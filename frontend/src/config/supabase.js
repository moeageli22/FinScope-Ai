// FinScope AI - Supabase Configuration
// frontend/src/config/supabase.js

import { createClient } from '@supabase/supabase-js'

// Your Supabase credentials
const supabaseUrl = 'https://mmcczchanckdfsqnnmep.supabase.co'
// NOTE: Replace this with your actual ANON/PUBLIC key from Supabase Dashboard > Settings > API
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY2N6Y2hhbmNrZGZzcW5ubWVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MTk3NzUsImV4cCI6MjA4NDM5NTc3NX0.C2jjq2ZAoueyv1ycMfisojs38hJ_HrEOEquCR-x6F5k'

// Create Supabase client with auth configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce' // More secure auth flow
    }
})