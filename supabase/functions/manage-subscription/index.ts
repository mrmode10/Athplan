
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@12.0.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getPlanDetails } from '../_shared/plans.ts'

console.log("Manage Subscription Function Initialized")

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
    apiVersion: '2022-11-15',
    httpClient: Stripe.createFetchHttpClient(),
})

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Authenticate User
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) throw new Error('Missing Authorization header')

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) throw new Error('Invalid Token')

        // Parse Body
        let body = {}
        try {
            body = await req.json()
        } catch (e) {
            // Body might be empty for GET, which is fine
        }
        const { action, plan, payment_method_id } = body as any

        // Fetch Team/Customer Info
        const { data: team, error: teamError } = await supabase
            .from('teams')
            .select('stripe_customer_id, plan, subscription_status')
            .eq('id', user.user_metadata.team || user.user_metadata.team_id) // Fallback support
            .single()

        // Note: If user has no team or team has no stripes_customer_id, we can't manage subscription
        const customerId = team?.stripe_customer_id || user.user_metadata.stripe_customer_id

        if (!customerId) {
            // Optional: Create customer if missing? For now return error
            throw new Error('No Stripe Customer found for this user.')
        }

        // --- GET DETAILS ---
        if (req.method === 'GET' || action === 'get_details') {
            const customer = await stripe.customers.retrieve(customerId, { expand: ['subscriptions', 'invoice_settings.default_payment_method'] }) as any

            const subscription = customer.subscriptions?.data[0]
            let paymentMethod = customer.invoice_settings?.default_payment_method

            if (!paymentMethod && subscription?.default_payment_method) {
                // Retrieve sub PM if customer doesn't have one
                paymentMethod = await stripe.paymentMethods.retrieve(subscription.default_payment_method as string)
            } else if (typeof paymentMethod === 'string') {
                paymentMethod = await stripe.paymentMethods.retrieve(paymentMethod)
            }

            return new Response(JSON.stringify({
                plan: team?.plan || 'starter',
                status: subscription?.status || 'inactive',
                current_period_end: subscription?.current_period_end,
                payment_method: paymentMethod ? {
                    brand: paymentMethod.card?.brand,
                    last4: paymentMethod.card?.last4,
                    exp_month: paymentMethod.card?.exp_month,
                    exp_year: paymentMethod.card?.exp_year
                } : null
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // --- CHANGE PLAN ---
        if (action === 'change_plan') {
            if (!plan) throw new Error('Plan is required')

            const customer = await stripe.customers.retrieve(customerId, { expand: ['subscriptions'] }) as any
            const subscription = customer.subscriptions?.data[0]

            if (!subscription) {
                throw new Error('No active subscription to update')
            }

            const newPlanDetails = getPlanDetails(plan)

            // Proration behavior: always_invoice to charge immediately for upgrades? 
            // Or create_prorations defaults to true.
            const updatedSub = await stripe.subscriptions.update(subscription.id, {
                items: [{
                    id: subscription.items.data[0].id,
                    price_data: {
                        currency: 'usd',
                        product_data: { name: plan },
                        unit_amount: newPlanDetails.amount,
                        recurring: { interval: 'month' }
                    }
                }],
                metadata: { plan: plan }
            })

            // Update Supabase immediately for UI responsiveness (webhook will double check)
            await supabase.from('teams').update({ plan: plan }).eq('stripe_customer_id', customerId)

            // Update User Metadata as well for App.tsx
            await supabase.auth.admin.updateUserById(user.id, { user_metadata: { plan: plan } })

            return new Response(JSON.stringify({ success: true, plan: plan }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // --- CANCEL SUBSCRIPTION ---
        if (action === 'cancel_subscription') {
            const subscriptions = await stripe.subscriptions.list({
                customer: customerId,
                status: 'active',
                limit: 1
            });

            if (subscriptions.data.length === 0) {
                throw new Error('No active subscription found to cancel.');
            }

            const subId = subscriptions.data[0].id;

            return new Response(JSON.stringify({ subscription: updatedSub, message: 'Subscription set to cancel at period end.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // --- CREATE CHECKOUT SESSION (Hosted Page) ---
        if (action === 'create_checkout_session') {
            if (!plan) throw new Error('Plan is required')
            const planDetails = getPlanDetails(plan)

            // Create Checkout Session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: planDetails.name,
                                description: `Subscription to ${planDetails.name}`,
                            },
                            unit_amount: planDetails.amount,
                            recurring: {
                                interval: 'month',
                            },
                        },
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                success_url: `${req.headers.get('origin')}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${req.headers.get('origin')}/pricing`,
                customer: customerId || undefined, // Use existing if available, else Stripe creates new
                customer_email: customerId ? undefined : user.email, // Pre-fill email if new
                metadata: {
                    user_id: user.id,
                    plan: plan,
                    team_id: user.user_metadata.team || user.user_metadata.team_id
                },
                subscription_data: {
                    metadata: {
                        user_id: user.id,
                        plan: plan
                    }
                }
            });

            return new Response(JSON.stringify({ url: session.url }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // --- CREATE SETUP INTENT (For Update Card) ---
        if (action === 'create_setup_intent') {
            const setupIntent = await stripe.setupIntents.create({
                customer: customerId,
                payment_method_types: ['card'],
            })

            return new Response(JSON.stringify({ clientSecret: setupIntent.client_secret }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // --- UPDATE DEFAULT PAYMENT METHOD (After Setup Intent Success) ---
        if (action === 'update_payment_method') {
            // Usually the client confirms the setup intent, which attaches the PM to the customer.
            // We just need to set it as default.
            // But the client might just pass payment_method_id if simpler.
            // Let's assume client sends setup_intent_id or payment_method_id. 
            // If client sends setup_intent_id, we retrieve it to get pm id.

            // Actually, easiest flow: 
            // 1. Client calls create_setup_intent
            // 2. Client confirms setup intent with Stripe Elements
            // 3. Setup Intent succeeds -> PM is attached
            // 4. Client calls this action to set that PM as default (if needed) OR we rely on webhook.
            // But SetupIntent doesn't auto-set default for *subscription* invoices usually, unless 'usage: off_session'?
            // Safer to explicitly set it here.

            if (!payment_method_id) throw new Error('payment_method_id required')

            // Update Customer Default
            await stripe.customers.update(customerId, {
                invoice_settings: { default_payment_method: payment_method_id }
            })

            // Update Subscription Default too (to be sure future invoices use it)
            const customer = await stripe.customers.retrieve(customerId, { expand: ['subscriptions'] }) as any
            const subscription = customer.subscriptions?.data[0]
            if (subscription) {
                await stripe.subscriptions.update(subscription.id, {
                    default_payment_method: payment_method_id
                })
            }

            return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        throw new Error(`Unknown action: ${action}`)

    } catch (err: any) {
        console.error(err)
        return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
})
