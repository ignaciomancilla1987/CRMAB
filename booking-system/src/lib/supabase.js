import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.error(
    '⚠️ Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Revisa tu archivo .env.local',
  )
}

export const supabase = createClient(url || '', anonKey || '', {
  auth: { persistSession: false },
})

export default supabase
