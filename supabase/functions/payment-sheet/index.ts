
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

    const STRIPE_SECRET_KEY = 'sk_test_51SmuhAQ1GzqUdEZwFqP4zJgAAAZc9aoUzb30jmxdGYgmktz9TZSpSYEBWR3erPbh4ADaAyOmrFZuzYvLRkK1wW2300XNv0ZN1O';

    if (!STRIPE_SECRET_KEY) {
        return new Response(JSON.stringify({ error: "Missing STRIPE_SECRET_KEY" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } })
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
        apiVersion: '2022-11-15',
        httpClient: Stripe.createFetchHttpClient(),
    })

    try {
        const { amount, email, user_id, voiceflow_user_id, plan } = await req.json()

        const customer = await stripe.customers.create({
            email: email,
            metadata: {
                user_id: user_id,
                voiceflow_user_id: voiceflow_user_id,
                plan: plan
            }
        });

        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: customer.id },
            { apiVersion: '2022-11-15' }
        );

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount || 4900, // Default to $49.00
            currency: 'usd',
            customer: customer.id,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                user_id: user_id,
                email: email,
                voiceflow_user_id: voiceflow_user_id,
                plan: plan || 'starter'
            }
        });

        return new Response(
            JSON.stringify({
                paymentIntent: paymentIntent.client_secret,
                ephemeralKey: ephemeralKey.secret,
                customer: customer.id,
                publishableKey: Deno.env.get('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY') ?? "pk_test_sample",
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
