// FinScope AI - Supabase Configuration
// frontend/src/config/supabase.js

import { createClient } from '@supabase/supabase-js'

// Your Supabase credentials
const supabaseUrl = 'https://mmcczchanckdfsqnnmep.supabase.co'
// NOTE: Replace this with your actual ANON/PUBLIC key from Supabase Dashboard > Settings > API
const supabaseAnonKey = 'sb_publishable_E-9-jogb4vDJUL6czRWodA_0HvcvVZN'

// Create Supabase client with auth configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce' // More secure auth flow
    }
})