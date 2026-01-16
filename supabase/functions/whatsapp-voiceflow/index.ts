
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

console.log("Whatsapp-Voiceflow Function Initialized")

serve(async (req) => {
    // 1. Verify Request
    // In a production app, verify the X-Twilio-Signature header here.

    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 })
    }

    try {
        // 2. Parse Incoming Twilio Webhook Data
        // Twilio sends data as application/x-www-form-urlencoded
        const formData = await req.formData()
        const incomingMsg = formData.get('Body')?.toString() || ''
        const sender = formData.get('From')?.toString() || ''

        console.log(`Received message from ${sender}: ${incomingMsg}`)

        if (!incomingMsg) {
            return new Response('No message content', { status: 200 })
        }

        // 3. Send to Voiceflow
        const VF_API_KEY = Deno.env.get('VOICEFLOW_API_KEY')
        const VF_VERSION_ID = Deno.env.get('VOICEFLOW_VERSION_ID') || 'production'
        const TWILIO_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
        const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
        const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER') // The bot's number

        if (!VF_API_KEY || !TWILIO_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
            console.error("Missing Environment Variables")
            return new Response('Server Config Error', { status: 500 })
        }

        // User ID for Voiceflow (using phone number ensures continuity)
        const userId = sender.replace(/\D/g, '')

        const vfResponse = await fetch(`https://general-runtime.voiceflow.com/state/user/${userId}/interact`, {
            method: 'POST',
            headers: {
                'Authorization': VF_API_KEY,
                'Content-Type': 'application/json',
                'versionID': VF_VERSION_ID
            },
            body: JSON.stringify({
                action: { type: 'text', payload: incomingMsg }
            })
        })

        if (!vfResponse.ok) {
            const err = await vfResponse.text()
            console.error("Voiceflow Error:", err)
            throw new Error(`Voiceflow API Error: ${vfResponse.statusText}`)
        }

        const vfData = await vfResponse.json()

        // 4. Send Response back to Twilio (WhatsApp)
        // Voiceflow returns an array of "traces". We look for text or speak traces.

        for (const trace of vfData) {
            if (trace.type === 'text' || trace.type === 'speak') {
                const replyText = trace.payload.message

                // Call Twilio API to send message
                const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`

                // Encode body for x-www-form-urlencoded
                const body = new URLSearchParams()
                body.append('To', sender)
                body.append('From', TWILIO_PHONE_NUMBER) // e.g. whatsapp:+14155238886
                body.append('Body', replyText)

                const twilioResp = await fetch(twilioUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Basic ' + btoa(`${TWILIO_SID}:${TWILIO_AUTH_TOKEN}`),
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: body
                })

                if (!twilioResp.ok) {
                    console.error("Twilio Send Error", await twilioResp.text())
                }
            }
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        })

    } catch (error: any) {
        console.error(error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: 500,
        })
    }
})
