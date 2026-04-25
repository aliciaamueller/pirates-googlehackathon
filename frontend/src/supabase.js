import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

let _client = null
if (isSupabaseConfigured) {
  try {
    _client = createClient(supabaseUrl, supabaseKey)
  } catch (e) {
    console.warn('[Supabase] createClient failed:', e)
  }
}

export const supabase = _client
