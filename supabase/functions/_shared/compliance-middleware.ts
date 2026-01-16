import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export type Handler = (req: Request) => Promise<Response>

export function withCompliance(handler: Handler): Handler {
    return async (req: Request): Promise<Response> => {
        // 1. Handle CORS Preflight
        if (req.method === 'OPTIONS') {
            return new Response('ok', { headers: corsHeaders })
        }

        try {
            // 2. Clone request to peek at body for user_id without consuming stream for handler
            const clonedReq = req.clone()
            let userId: string | null = null

            try {
                const body = await clonedReq.json()
                userId = body.user_id
            } catch (e) {
                // If JSON parse fails or no body, we proceed (might be GET request or other)
                // If strict compliance requires user_id, handler will likely fail or we can enforce here.
                // For now, we only enforce kill switch IF user_id is present.
            }

            // 3. REGION CHECK: European Region Compliance (Part 4)
            // Ensure data processing remains in EU-central-1
            const region = Deno.env.get('SUPABASE_REGION') || 'unknown';
            const allowedRegions = ['eu-central-1'];

            if (!allowedRegions.includes(region)) {
                // For now, we Log a CRITICAL WARNING rather than blocking, to allow migration.
                console.warn(`[COMPLIANCE ALERT] Region Mismatch. Data processing is occurring in '${region}', but strictly required in '${allowedRegions.join(', ')}'.`);

                // Optional: Inject warning header for visibility
                // newHeaders.set('X-Compliance-Warning', 'Region-Mismatch');
            }

            // 4. KILL SWITCH: Check Opt-Out Status
            if (userId) {
                const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
                const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
                const supabase = createClient(supabaseUrl, supabaseKey)

                const { data: user, error } = await supabase
                    .from('users')
                    .select('communication_status')
                    .eq('id', userId)
                    .single()

                if (user && user.communication_status === 'opted_out') {
                    console.log(`Blocked request from opted-out user: ${userId}`)
                    return new Response(
                        JSON.stringify({
                            error: "User has opted out of communications.",
                            code: "OPT_OUT_BLOCK"
                        }),
                        {
                            status: 403,
                            headers: { ...corsHeaders, "Content-Type": "application/json" }
                        }
                    )
                }
            }

            // 5. METADATA INJECTOR: Execute Handler and Inject Headers
            const response = await handler(req)

            // Create a new response with added headers (Response headers are immutable in some contexts, safest to recreate)
            const newHeaders = new Headers(response.headers)
            newHeaders.set('X-AI-Generated', 'true')
            // Add CORS headers if missing (handler might have added them, but safety first)
            for (const [key, value] of Object.entries(corsHeaders)) {
                if (!newHeaders.has(key)) {
                    newHeaders.set(key, value)
                }
            }

            return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: newHeaders
            })

        } catch (error) {
            console.error("Middleware Error:", error)
            return new Response(
                JSON.stringify({ error: "Internal Server Error during compliance check" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            )
        }
    }
}
