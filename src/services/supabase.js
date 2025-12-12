import { createClient } from '@supabase/supabase-js'

// Obtener credenciales desde variables de entorno
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Validar que las credenciales existan
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan credenciales de Supabase en el archivo .env')
}

// Crear y exportar cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper para manejar errores de Supabase
export const handleSupabaseError = (error) => {
  if (error?.code === '23505') {
    return 'Esta palabra ya existe en tu biblioteca'
  }
  return error?.message || 'Error desconocido'
}