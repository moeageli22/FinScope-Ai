// supabase/functions/reset-password/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const { userId, newPassword, codeId } = await req.json()

        if (!userId || !newPassword || !codeId) {
            return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400
            })
        }

        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
            auth: { autoRefreshToken: false, persistSession: false }
        })

        // Update password via admin API
        const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
            password: newPassword
        })

        if (updateError) {
            console.error('Admin update error:', updateError)
            return new Response(JSON.stringify({ success: false, error: updateError.message }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500
            })
        }

        // Mark code as used
        await supabase.from('password_reset_codes').update({ used: true }).eq('id', codeId)

        console.log(`✅ Password reset for user: ${userId}`)

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