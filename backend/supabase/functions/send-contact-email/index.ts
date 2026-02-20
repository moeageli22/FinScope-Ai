// supabase/functions/send-contact-email/index.ts
// verify_jwt = false  ← set in config.toml so unauthenticated users can call this
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const { name, email, message } = await req.json()

        if (!name || !email || !message) {
            return new Response(
                JSON.stringify({ success: false, error: 'Missing required fields' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        if (!RESEND_API_KEY) {
            return new Response(
                JSON.stringify({ success: false, error: 'Email service not configured' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
        }

        const receivedAt = new Date().toLocaleString('en-GB', {
            timeZone: 'Europe/London',
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })

        const safeMessage = message.replace(/</g, '&lt;').replace(/>/g, '&gt;')
        const year = new Date().getFullYear()

        // 1. Notify Mohammed
        const notifyRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
            body: JSON.stringify({
                from: 'FinScope AI <noreply@finscopeai.app>',
                to: ['mohammadmunir2004@gmail.com'],
                reply_to: email,
                subject: `📬 New message from ${name} — FinScope AI`,
                html: `<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;background:#f4f4f5;margin:0;padding:0}.wrap{max-width:580px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)}.hdr{background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:26px 30px}.hdr h1{color:#fff;margin:0;font-size:19px;font-weight:800}.hdr p{color:rgba(255,255,255,.75);margin:4px 0 0;font-size:12px}.body{padding:26px 30px}.lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#6b7280;margin-bottom:5px}.val{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:10px 13px;font-size:14px;color:#111;margin-bottom:16px}.msg{background:#f0f0ff;border-left:4px solid #6366f1;border-radius:0 8px 8px 0;padding:13px 15px;font-size:14px;color:#1e1b4b;line-height:1.7;white-space:pre-wrap}.footer{border-top:1px solid #f1f5f9;padding:12px 30px;font-size:11px;color:#9ca3af;text-align:center}</style></head><body><div class="wrap"><div class="hdr"><h1>📬 New Contact Message</h1><p>Received via finscopeai.app · ${receivedAt}</p></div><div class="body"><div class="lbl">Name</div><div class="val">${name}</div><div class="lbl">Email</div><div class="val"><a href="mailto:${email}" style="color:#6366f1;text-decoration:none">${email}</a></div><div class="lbl">Message</div><div class="msg">${safeMessage}</div></div><div class="footer">Hit <strong>Reply</strong> to respond directly to ${name} · FinScope AI</div></div></body></html>`
            })
        })

        if (!notifyRes.ok) {
            const err = await notifyRes.json()
            console.error('Resend notify error:', err)
            return new Response(
                JSON.stringify({ success: false, error: 'Failed to send email' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
        }

        // 2. Confirm to the user
        await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
            body: JSON.stringify({
                from: 'FinScope AI <noreply@finscopeai.app>',
                to: [email],
                subject: `Your message has been received ✨ — FinScope AI`,
                html: `<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;background:#f4f4f5;margin:0;padding:0}.wrap{max-width:580px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)}.hdr{background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:30px;text-align:center}.hdr h1{color:#fff;margin:0;font-size:22px;font-weight:800}.hdr p{color:rgba(255,255,255,.8);margin:5px 0 0;font-size:13px}.body{padding:30px}.body h2{font-size:17px;font-weight:700;margin:0 0 10px;color:#111}.body p{font-size:14px;color:#374151;line-height:1.7;margin:0 0 14px}.preview{background:#f0f0ff;border-left:4px solid #6366f1;border-radius:0 8px 8px 0;padding:12px 15px;font-size:13px;color:#3730a3;font-style:italic;line-height:1.6;margin:18px 0;white-space:pre-wrap}.row{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:11px 14px;margin-bottom:8px;font-size:13px;color:#374151}.footer{border-top:1px solid #f1f5f9;padding:14px 30px;font-size:11px;color:#9ca3af;text-align:center}</style></head><body><div class="wrap"><div class="hdr"><h1>✨ FinScope AI</h1><p>Message Received</p></div><div class="body"><h2>Hey ${name}, thank you for reaching out!</h2><p>Your message has been successfully received. Mohammed will personally review it and get back to you as soon as possible.</p><div class="preview">"${safeMessage}"</div><div class="row">⏱️ &nbsp;Expected response within <strong>24–48 hours</strong></div><div class="row">✅ &nbsp;Your message has been delivered successfully</div><p style="margin-top:18px;font-size:13px;color:#6b7280">In the meantime, feel free to explore <a href="https://finscopeai.app" style="color:#6366f1;font-weight:600;text-decoration:none">finscopeai.app</a> or connect on <a href="https://www.linkedin.com/in/mohammed-ageli-153346218/" style="color:#6366f1;font-weight:600;text-decoration:none">LinkedIn</a>.</p></div><div class="footer">© ${year} FinScope AI · finscopeai.app · London, UK</div></div></body></html>`
            })
        })

        console.log(`✅ Contact emails sent — from ${name} <${email}>`)

        return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        console.error('Function error:', error)
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})