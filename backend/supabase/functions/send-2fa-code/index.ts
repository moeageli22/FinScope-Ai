import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Use different variable names since SUPABASE_ prefix is reserved
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("=== 2FA Function Invoked ===")

    // Parse request body
    let requestBody
    try {
      requestBody = await req.json()
      console.log("Request body received:", {
        hasEmail: !!requestBody.email,
        hasUserId: !!requestBody.userId,
        hasIpAddress: !!requestBody.ipAddress,
        hasUserAgent: !!requestBody.userAgent
      })
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError)
      return new Response(
          JSON.stringify({ success: false, error: "Invalid request body" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400
          }
      )
    }

    const { email, userId, ipAddress, userAgent } = requestBody

    // Validate required fields
    if (!email || !userId) {
      console.error("Missing required fields:", { email: !!email, userId: !!userId })
      return new Response(
          JSON.stringify({ success: false, error: "Missing email or userId" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400
          }
      )
    }

    console.log("Processing 2FA for:", email, "User ID:", userId)

    // Check environment variables
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase configuration")
      return new Response(
          JSON.stringify({ success: false, error: "Server configuration error" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500
          }
      )
    }

    // Create Supabase client
    const supabase = createClient(
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY
    )

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    console.log("Generated 6-digit code")

    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 10)

    // Store code in database
    console.log("Attempting to store code in database...")
    const { data: insertData, error: dbError } = await supabase
        .from("two_factor_codes")
        .insert({
          user_id: userId,
          code: code,
          expires_at: expiresAt.toISOString(),
          ip_address: ipAddress || 'Unknown',
          user_agent: userAgent || 'Unknown',
          used: false
        })
        .select()

    if (dbError) {
      console.error("Database error:", dbError)
      return new Response(
          JSON.stringify({ success: false, error: `Database error: ${dbError.message}` }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500
          }
      )
    }

    console.log("Code stored successfully in database")

    // Check if Resend API key is available
    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not set, skipping email send")
      return new Response(
          JSON.stringify({
            success: true,
            warning: "Code generated but email not sent - no API key configured",
            code: code // Only for testing, remove in production
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Send email via Resend
    console.log("Sending email to:", email)
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "FinScope AI <onboarding@resend.dev>",
        to: [email],
        subject: "Your Login Verification Code - FinScope AI",
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
                .code-box { background: white; border: 2px dashed #06b6d4; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px; }
                .code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #06b6d4; font-family: 'Courier New', monospace; }
                .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
                .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔒 FinScope AI</h1>
                </div>
                <div class="content">
                  <h2>Your Login Verification Code</h2>
                  <p>Someone is trying to sign in to your FinScope AI account. If this was you, enter the code below:</p>
                  <div class="code-box">
                    <div class="code">${code}</div>
                  </div>
                  <p style="text-align: center; color: #6b7280; font-size: 14px;">
                    <strong>This code expires in 10 minutes</strong>
                  </p>
                  <div class="warning">
                    <strong>⚠️ Security Notice:</strong><br>
                    If you didn't attempt to sign in, please ignore this email and consider changing your password immediately.
                  </div>
                  <p style="font-size: 13px; color: #6b7280; margin-top: 20px;">
                    <strong>Login Details:</strong><br>
                    IP Address: ${ipAddress || "Unknown"}<br>
                    Time: ${new Date().toLocaleString()}
                  </p>
                </div>
                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} FinScope AI. All rights reserved.</p>
                  <p>This is an automated email, please do not reply.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    })

    const resendData = await emailResponse.json()

    if (!emailResponse.ok) {
      console.error("Resend API error:", resendData)
      return new Response(
          JSON.stringify({
            success: false,
            error: `Failed to send email: ${JSON.stringify(resendData)}`
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500
          }
      )
    }

    console.log("Email sent successfully!")
    console.log("=== 2FA Function Completed Successfully ===")

    return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
    )

  } catch (error) {
    console.error("=== Function Error ===")
    console.error("Error type:", error.constructor.name)
    console.error("Error message:", error.message)
    console.error("Error stack:", error.stack)

    return new Response(
        JSON.stringify({
          success: false,
          error: error.message || "Internal server error"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        }
    )
  }
})