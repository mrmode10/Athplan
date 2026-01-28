
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@12.0.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("Stripe Webhook Handler Initialized")

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
    apiVersion: '2022-11-15',
    httpClient: Stripe.createFetchHttpClient(),
})

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

serve(async (req) => {
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
        return new Response('No signature', { status: 400 })
    }

    try {
        const body = await req.text()
        const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
        let event

        // Verify signature
        try {
            event = stripe.webhooks.constructEvent(body, signature, endpointSecret!)
        } catch (err) {
            console.error(`Webhook signature verification failed: ${err.message}`)
            return new Response(`Webhook Error: ${err.message}`, { status: 400 })
        }

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object
            console.log('PaymentIntent succeeded:', paymentIntent.id)

            // 1. Extract Metadata (Passed from client/payment-sheet)
            // 2. Check for Existing Team (Consent Preservation)
            // We search by email or stripe_customer_id to avoid duplications
            const userId = paymentIntent.metadata.user_id
            const email = paymentIntent.metadata.email
            const plan = paymentIntent.metadata.plan || 'starter' // Get plan from metadata

            if (!userId) {
                console.error('No user_id in metadata')
                return new Response('Missing user_id', { status: 400 })
            }

            // Check if user already has a team or if a team exists with this email
            const { data: existingUser } = await supabase.from('users').select('team_id').eq('id', userId).single()

            let teamId = existingUser?.team_id

            if (teamId) {
                // UPDATE EXISTING TEAM (Upgrade/Downgrade Trigger)
                console.log(`Updating existing team: ${teamId} to plan: ${plan}`)
                const { error: updateError } = await supabase
                    .from('teams')
                    .update({
                        plan: plan,
                        subscription_status: 'active',
                        stripe_customer_id: paymentIntent.customer
                    })
                    .eq('id', teamId)

                if (updateError) console.error('Error updating team plan:', updateError)
            } else {
                // CREATE NEW TEAM
                const { data: team, error: teamError } = await supabase
                    .from('teams')
                    .insert({
                        name: `${email}'s Team`,
                        stripe_customer_id: paymentIntent.customer,
                        subscription_status: 'active',
                        plan: plan
                    })
                    .select()
                    .single()

                if (teamError) {
                    console.error('Error creating team:', teamError)
                    return new Response('Error creating team', { status: 500 })
                }
                teamId = team.id
                console.log(`Generated Team_ID: ${teamId}`)

                // Link User
                await supabase.from('users').update({ team_id: teamId }).eq('id', userId)
            }

            // 4. Update Voiceflow
            const voiceflowUserId = paymentIntent.metadata.voiceflow_user_id
            if (voiceflowUserId) {
                try {
                    await updateVoiceflow(voiceflowUserId, teamId, plan)
                } catch (vfError) {
                    console.error('Voiceflow update failed:', vfError)
                }
            }
            // 5. CIVIL SERVICE PAYOUT: Log to Revenue Ledger
            const { error: ledgerError } = await supabase
                .from('revenue_ledger')
                .insert({
                    team_id: teamId,
                    stripe_payment_intent_id: paymentIntent.id,
                    amount_cents: paymentIntent.amount,
                    currency: paymentIntent.currency,
                    description: `Payment for ${plan} plan`
                })

            if (ledgerError) {
                console.error('Error logging to revenue ledger:', ledgerError)
            } else {
                console.log('Revenue recorded in ledger.')
            }
        }
        else if (event.type === 'customer.subscription.updated') {
            const subscription = event.data.object
            const customerId = subscription.customer
            const plan = subscription.metadata.plan
            const status = subscription.status

            if (customerId) {
                console.log(`Subscription updated for customer ${customerId}: Plan=${plan}, Status=${status}`)

                // Update Team
                await supabase
                    .from('teams')
                    .update({
                        plan: plan,
                        subscription_status: status
                    })
                    .eq('stripe_customer_id', customerId)

                // Ideally we also update Users in that team
                // But for now we rely on the primary user link via team
            }
        }
        else if (event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object
            const customerId = subscription.customer

            console.log(`Subscription canceled for customer ${customerId}`)

            await supabase
                .from('teams')
                .update({
                    subscription_status: 'canceled',
                    // Optionally downgrade plan to 'starter' or keep 'pro' until period end? 
                    // 'deleted' usually means period end passed or immediate cancel.
                    plan: 'starter'
                })
                .eq('stripe_customer_id', customerId)
        }

        return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } })

    } catch (err) {
        console.error(err)
        return new Response(err.message, { status: 400 })
    }
})

// Helper to update Voiceflow
async function updateVoiceflow(vfUserId: string, teamId: string, plan: string) {
    const VF_API_KEY = Deno.env.get('VOICEFLOW_API_KEY')
    const VF_VERSION_ID = Deno.env.get('VOICEFLOW_VERSION_ID') // specific project/version

    // Example: Updating a variable in the state (This depends on exact Voiceflow API used)
    // For interact API:
    // POST https://general-runtime.voiceflow.com/state/user/{userID}/variables

    // NOTE: Replace with the correct API endpoint for your specific VF project setup
    // Using State API as an example to set variables
    const response = await fetch(`https://general-runtime.voiceflow.com/state/user/${vfUserId}/variables`, {
        method: 'PATCH',
        headers: {
            'Authorization': VF_API_KEY!,
            'Content-Type': 'application/json',
            'versionID': VF_VERSION_ID || '' // optional if strictly scoped by key
        },
        body: JSON.stringify({
            Team_ID: teamId,
            Client_Status: 'Active_Paid',
            Plan: plan
        })
    })

    if (!response.ok) {
        throw new Error(`Voiceflow API error: ${response.statusText}`)
    }
    console.log('Voiceflow updated successfully')
}
