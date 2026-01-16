
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { withCompliance } from '../_shared/compliance-middleware.ts'

console.log("AI Router Initialized")

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

// Mock Gemini Call (Replace with actual Google Generative AI SDK)
async function callGemini(model: string, prompt: string) {
    console.log(`Calling Gemini Model: ${model} with prompt prefix: ${prompt.substring(0, 50)}...`)
    // Simulation of API response time
    const delay = model.includes('pro') ? 1000 : 300;
    await new Promise(resolve => setTimeout(resolve, delay));

    return `[Response from ${model}]: Processed your request.`
}

const handler = async (req: Request): Promise<Response> => {
    // Note: CORS is handled by middleware

    try {
        const { user_id, prompt } = await req.json()

        if (!user_id || !prompt) {
            return new Response(JSON.stringify({ error: "Missing user_id or prompt" }), { status: 400, headers: { "Content-Type": "application/json" } })
        }

        // 0. COMPLIANCE PATCH: Safety & Opt-Out Checks (Part 3)
        // Note: Middleware blocks *already* opted-out users. This logic handles the *request* to opt-out.
        const upperPrompt = prompt.toUpperCase();

        // Check for STOP/UNSUBSCRIBE
        if (upperPrompt === 'STOP' || upperPrompt === 'UNSUBSCRIBE') {
            console.log(`User ${user_id} opted out.`);

            // 2. MANAGER ALERT LOGIC:
            // First, get the user's team to alert the correct manager
            const { data: userData } = await supabase
                .from('users')
                .select('team_id, user_metadata')
                .eq('id', user_id)
                .single();

            if (userData && userData.team_id) {
                // A. Update User Status
                await supabase
                    .from('users')
                    .update({ communication_status: 'opted_out' })
                    .eq('id', user_id);

                // B. Create Manager Alert
                const playerName = userData.user_metadata?.first_name
                    ? `${userData.user_metadata.first_name} ${userData.user_metadata.last_name || ''}`
                    : 'A player';

                await supabase.from('alerts').insert({
                    team_id: userData.team_id,
                    type: 'opt_out',
                    message: `Player ${playerName} has opted out of WhatsApp updates. They will no longer receive AI responses.`,
                    is_read: false
                });
            }

            return new Response(
                JSON.stringify({ result: "You have been unsubscribed. You will no longer receive messages. To opt back in, reply START.", model_used: 'system-compliance' }),
                { headers: { "Content-Type": "application/json" } }
            );
        }

        // Check for EMERGENCY contexts
        const emergencyKeywords = ['911', '112', 'SUICIDE', 'FIRE', 'POLICE', 'AMBULANCE', 'EMERGENCY'];
        if (emergencyKeywords.some(keyword => upperPrompt.includes(keyword))) {
            console.log(`Emergency context detected for user ${user_id}. Blocked.`);
            return new Response(
                JSON.stringify({ result: "⚠️ I cannot contact emergency services. Please dial 911 or 112 directly if you are in danger.", model_used: 'system-compliance' }),
                { headers: { "Content-Type": "application/json" } }
            );
        }

        // 1. Fetch User's Team & Plan
        // 3. Call AI
        const responseText = await callGemini('gemini-pro', prompt)

        return new Response(
            JSON.stringify({ result: responseText, model_used: 'gemini-pro' }),
            { headers: { "Content-Type": "application/json" } },
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        )
    }
}

serve(withCompliance(handler))
