import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  try {
    const { email, userId, type = 'signup' } = await req.json()
    
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    )

    // Generate verification token
    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 hours expiry

    // Store token in database
    await supabase
      .from('email_verification_tokens')
      .insert({
        user_id: userId,
        token: token,
        expires_at: expiresAt.toISOString()
      })

    // Create verification link
    const verificationLink = `${req.headers.get('origin')}/verify-email?token=${token}`

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'FinScope AI <noreply@finscopeai.com>',
        to: [email],
        subject: type === 'signup' ? 'Verify Your Email - FinScope AI' : 'Email Verification Required',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #06b6d4, #3b82f6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .header h1 { color: white; margin: 0; font-size: 28px; }
                .content { background: #f9fafb; padding: 40px 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #06b6d4, #3b82f6); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔐 FinScope AI</h1>
                </div>
                <div class="content">
                  <h2>Verify Your Email Address</h2>
                  <p>Thank you for signing up with FinScope AI! To complete your registration, please verify your email address by clicking the button below:</p>
                  <center>
                    <a href="${verificationLink}" class="button">Verify Email Address</a>
                  </center>
                  <p>Or copy and paste this link into your browser:</p>
                  <p style="background: #e5e7eb; padding: 10px; border-radius: 5px; word-break: break-all;">${verificationLink}</p>
                  <p><strong>This link will expire in 24 hours.</strong></p>
                  <p>If you didn't create an account with FinScope AI, please ignore this email.</p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} FinScope AI. All rights reserved.</p>
                  <p>This is an automated email, please do not reply.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    })

    const data = await res.json()

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 400 }
    )
  }
})