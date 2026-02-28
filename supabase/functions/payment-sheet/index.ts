
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@12.0.0'

console.log("Hello from Stripe Payment Sheet Function!")

serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');

    if (!STRIPE_SECRET_KEY) {
        return new Response(JSON.stringify({ error: "Missing STRIPE_SECRET_KEY" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } })
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
        apiVersion: '2022-11-15',
        httpClient: Stripe.createFetchHttpClient(),
    })

    try {
        const { email, user_id, voiceflow_user_id, plan } = await req.json()

        // Map plan to amount (in cents)
        const isAnnual = plan?.endsWith(' (Annual)') || false;
        const basePlan = isAnnual ? plan.replace(' (Annual)', '') : plan;

        // Base monthly rates
        let baseAmount = 9900; // Starter
        if (basePlan === 'All Star') baseAmount = 19900;
        if (basePlan === 'Hall of Fame') baseAmount = 24900;

        // Apply discount and interval multiplier if annual
        const finalAmount = isAnnual ? Math.round(baseAmount * 0.8 * 12) : baseAmount;

        // 1. Create Customer
        const customer = await stripe.customers.create({
            email: email,
            metadata: {
                user_id: user_id,
                voiceflow_user_id: voiceflow_user_id,
            }
        });

        // 2. Create Subscription with Trial
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: plan || 'Starter Pack',
                    },
                    unit_amount: finalAmount,
                    recurring: {
                        interval: isAnnual ? 'year' : 'month',
                    },
                },
            }],
            trial_period_days: 14,
            payment_behavior: 'default_incomplete',
            payment_settings: {
                save_default_payment_method: 'on_subscription',
            },
            expand: ['pending_setup_intent'],
            metadata: {
                user_id: user_id,
                plan: plan || 'Starter',
            }
        });

        // 3. Return the Setup Intent Secret
        // For a trial, payment_intent is usually null, we use pending_setup_intent
        const setupIntent = subscription.pending_setup_intent;

        return new Response(
            JSON.stringify({
                clientSecret: setupIntent.client_secret, // Standardize name
                subscriptionId: subscription.id,
                customer: customer.id,
                publishableKey: Deno.env.get('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY') ?? "pk_live_51Smuh3LHktvXWxv0olVsHpAEIxRL0VTbHP6k9HFd7MNmYI7ZqmORLjTan8jnzkH2021crdfmqcFm1voI1fsbbRQT003cWCfR2j",
            }),
            { headers: { "Content-Type": "application/json", ...corsHeaders } },
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
        )
    }
})
