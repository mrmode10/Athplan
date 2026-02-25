
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { withCompliance } from '../_shared/compliance-middleware.ts'
import { GoogleGenerativeAI } from 'npm:@google/generative-ai'

console.log("AI Router Initialized")

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

// Initialize Google Generative AI
const apiKey = Deno.env.get('GEMINI_API_KEY');
if (!apiKey) {
    console.error("CRITICAL: GEMINI_API_KEY is missing from environment variables.");
}
const genAI = new GoogleGenerativeAI(apiKey || '');

async function callGemini(modelName: string, prompt: string) {
    if (!apiKey) {
        return "System Error: AI Service Key is missing. Please contact support.";
    }

    try {
        console.log(`Calling Gemini Model: ${modelName}...`);

        // Use the requested model (e.g., gemini-1.5-flash)
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return text;
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        return `I'm having trouble connecting to my brain right now. Please try again later. (Error: ${error.message})`;
    }
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

        // 3. User Context & Schedule Retrieval
        // Fetch user's team to provide relevant schedule updates
        const { data: userData, error: userError } = await supabase
            .from('whatsapp_users')
            .select('group_name, phone_number')
            .eq('phone_number', user_id) // Assuming user_id is phone number
            .single();

        let systemContext = "";

        if (userData && userData.group_name) {
            // Fetch latest schedule updates for this group
            const { data: updates } = await supabase
                .from('schedule_updates')
                .select('content, created_at')
                .eq('group_name', userData.group_name)
                .order('created_at', { ascending: false })
                .limit(3);

            if (updates && updates.length > 0) {
                const updateText = updates.map(u =>
                    `- [${new Date(u.created_at).toLocaleString()}] ${u.content}`
                ).join('\n');

                systemContext = `
IMPORTANT CONTEXT:
User is in group: "${userData.group_name}".
Here are the latest schedule updates for this group:
${updateText}

INSTRUCTIONS:
- Use the above schedule info to answer questions about times, buses, or events.
- If the answer is in the schedule updates, state it clearly.
- If not found, say you don't have that specific info yet.
`;
            } else {
                systemContext = `User is in group: "${userData.group_name}". No specific schedule updates found.`;
            }
        } else {
            // Check 'users' table if not found in 'bot_users' (fallback)
            const { data: appUser } = await supabase
                .from('users')
                .select('user_metadata')
                .eq('id', user_id)
                .single();

            if (appUser?.user_metadata?.first_name) {
                systemContext = `User name is ${appUser.user_metadata.first_name}.`;
            }
        }

        const fullPrompt = `${systemContext}\n\nUser Query: ${prompt}`;
        console.log("Sending prompt with context:", fullPrompt);

        // 4. Call AI (Gemini 1.5 Flash)
        const responseText = await callGemini('gemini-1.5-flash', fullPrompt)

        return new Response(
            JSON.stringify({ result: responseText, model_used: 'gemini-1.5-flash' }),
            { headers: { "Content-Type": "application/json" } },
        )

    } catch (error: any) {
        console.error("AI Router Error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        )
    }
}

serve(withCompliance(handler))

