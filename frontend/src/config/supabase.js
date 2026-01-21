// FinScope AI - Supabase Configuration
// Add this file to: frontend/src/config/supabase.js

import { createClient } from '@supabase/supabase-js'

// Your Supabase credentials
const supabaseUrl = 'https://mmcczchanckdfsqnnmep.supabase.co'
const supabaseKey = 'sb_publishable_E-9-jogb4vDJUL6czRWodA_0HvcvVZN'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)

// That's it! Now you can use this in your app