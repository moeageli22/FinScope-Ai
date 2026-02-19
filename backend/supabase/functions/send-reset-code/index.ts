// supabase/functions/send-reset-code/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const { email, userId } = await req.json()

        if (!email || !userId) {
            return new Response(JSON.stringify({ success: false, error: 'Missing email or userId' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400
            })
        }

        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString()
        const expiresAt = new Date()
        expiresAt.setMinutes(expiresAt.getMinutes() + 10)

        // Clean up old unused codes
        await supabase.from('password_reset_codes').delete()
            .eq('user_id', userId).eq('used', false)

        // Store new code
        const { error: dbError } = await supabase.from('password_reset_codes').insert({
            user_id: userId,
            code,
            expires_at: expiresAt.toISOString(),
            used: false
        })

        if (dbError) {
            console.error('DB error:', dbError)
            return new Response(JSON.stringify({ success: false, error: 'Failed to store code' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500
            })
        }

        if (!RESEND_API_KEY) {
            console.warn('No RESEND_API_KEY — code generated but not sent:', code)
            return new Response(JSON.stringify({ success: true, warning: 'No email API key' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Send email via Resend
        const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${RESEND_API_KEY}` },
            body: JSON.stringify({
                from: "FinScope AI <noreply@finscopeai.app>",
                to: [email],
                subject: "Your Password Reset Code - FinScope AI",
                html: `
                <!DOCTYPE html>
                <html>
                <head><style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #06b6d4, #3b82f6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .header h1 { color: white; margin: 0; font-size: 26px; }
                    .content { background: #f9fafb; padding: 40px 30px; border-radius: 0 0 10px 10px; }
                    .code-box { background: white; border: 2px dashed #06b6d4; padding: 20px; text-align: center; margin: 28px 0; border-radius: 8px; }
                    .code { font-size: 40px; font-weight: bold; letter-spacing: 10px; color: #06b6d4; font-family: 'Courier New', monospace; }
                    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 14px; margin: 20px 0; border-radius: 4px; font-size: 14px; }
                    .footer { text-align: center; margin-top: 28px; font-size: 12px; color: #6b7280; }
                </style></head>
                <body>
                    <div class="container">
                        <div class="header"><h1>🔐 FinScope AI</h1></div>
                        <div class="content">
                            <h2>Password Reset Request</h2>
                            <p>We received a request to reset your FinScope AI password. Enter the code below to continue:</p>
                            <div class="code-box">
                                <div class="code">${code}</div>
                            </div>
                            <p style="text-align:center; color:#6b7280; font-size:14px;">
                                <strong>This code expires in 10 minutes</strong>
                            </p>
                            <div class="warning">
                                <strong>⚠️ Didn't request this?</strong><br>
                                If you didn't request a password reset, please ignore this email. Your account remains secure.
                            </div>
                        </div>
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} FinScope AI. All rights reserved.</p>
                            <p>This is an automated email, please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>`
            })
        })

        const resendData = await emailResponse.json()
        if (!emailResponse.ok) {
            console.error('Resend error:', resendData)
            return new Response(JSON.stringify({ success: false, error: 'Failed to send email' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500
            })
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (error) {
        console.error('Function error:', error)
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500
        })
    }
})