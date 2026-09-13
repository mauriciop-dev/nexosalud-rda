import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let _client: SupabaseClient | null = null

// Lazy singleton: evita romper el prerender del build cuando las variables
// de entorno de Supabase no están presentes.
export function getSupabase(): SupabaseClient {
  if (!_client) {
    _client = createClient(supabaseUrl, supabaseAnonKey)
  }
  return _client
}

// Proxy para mantener compatibilidad con `import { supabase } from '@/lib/supabase'`
export const supabase = new Proxy({} as SupabaseClient, {
  get(_t, prop) {
    const client = getSupabase()
    const value = Reflect.get(client as unknown as object, prop)
    return typeof value === 'function' ? value.bind(client) : value
  },
})
