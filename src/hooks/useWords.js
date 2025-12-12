import { useState, useEffect, useCallback } from 'react'
import { supabase, handleSupabaseError } from '../services/supabase'
import { generateWordData } from '../services/claudeService'

/**
 * Custom hook para gestionar palabras
 * Proporciona operaciones CRUD y estado sincronizado con Supabase
 */
export function useWords() {
  const [words, setWords] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Cargar todas las palabras de Supabase
   */
  const fetchWords = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: fetchError } = await supabase
        .from('palabras')
        .select('*')
        .order('fecha_agregada', { ascending: false })
      
      if (fetchError) throw fetchError
      setWords(data || [])
    } catch (err) {
      setError(handleSupabaseError(err))
      console.error('Error cargando palabras:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Verificar si una palabra ya existe
   */
  const wordExists = useCallback(async (palabra) => {
    try {
      const { data, error: checkError } = await supabase
        .from('palabras')
        .select('id')
        .eq('palabra', palabra.toLowerCase())
        .single()
      
      return !!data
    } catch (err) {
      return false
    }
  }, [])

  /**
   * Agregar nueva palabra (con generación de datos via Claude)
   */
  const addWord = useCallback(async (palabra) => {
    setLoading(true)
    setError(null)
    
    try {
      // 1. Verificar si ya existe
      const exists = await wordExists(palabra)
      if (exists) {
        throw new Error('Esta palabra ya existe en tu biblioteca')
      }
      
      // 2. Generar datos con Claude
      const wordData = await generateWordData(palabra)
      
      // 3. Guardar en Supabase
      const { data, error: insertError } = await supabase
        .from('palabras')
        .insert([{
          palabra: palabra.toLowerCase(),
          ...wordData,
          nivel: 0,
          veces_estudiada: 0,
          veces_correcta: 0,
          proximo_repaso: new Date().toISOString()
        }])
        .select()
      
      if (insertError) throw insertError
      
      // 4. Actualizar estado local
      setWords(prevWords => [data[0], ...prevWords])
      return { success: true, word: data[0] }
    } catch (err) {
      const errorMessage = handleSupabaseError(err)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [wordExists])

  /**
   * Actualizar una palabra existente
   */
  const updateWord = useCallback(async (id, updates) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: updateError } = await supabase
        .from('palabras')
        .update(updates)
        .eq('id', id)
        .select()
      
      if (updateError) throw updateError
      
      // Actualizar estado local
      setWords(prevWords =>
        prevWords.map(word => (word.id === id ? data[0] : word))
      )
      
      return { success: true, word: data[0] }
    } catch (err) {
      const errorMessage = handleSupabaseError(err)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Eliminar una palabra
   */
  const deleteWord = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    
    try {
      const { error: deleteError } = await supabase
        .from('palabras')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
      // Actualizar estado local
      setWords(prevWords => prevWords.filter(word => word.id !== id))
      
      return { success: true }
    } catch (err) {
      const errorMessage = handleSupabaseError(err)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Buscar palabras
   */
  const searchWords = useCallback(async (query) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: searchError } = await supabase
        .from('palabras')
        .select('*')
        .or(`palabra.ilike.%${query}%,traduccion.ilike.%${query}%`)
        .order('fecha_agregada', { ascending: false })
      
      if (searchError) throw searchError
      setWords(data || [])
    } catch (err) {
      setError(handleSupabaseError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Filtrar palabras por categoría
   */
  const filterByCategory = useCallback(async (categoria) => {
    setLoading(true)
    setError(null)
    
    try {
      let query = supabase
        .from('palabras')
        .select('*')
        .order('fecha_agregada', { ascending: false })
      
      if (categoria && categoria !== 'all') {
        query = query.eq('categoria', categoria)
      }
      
      const { data, error: filterError } = await query
      
      if (filterError) throw filterError
      setWords(data || [])
    } catch (err) {
      setError(handleSupabaseError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Filtrar palabras por nivel
   */
  const filterByLevel = useCallback(async (nivel) => {
    setLoading(true)
    setError(null)
    
    try {
      let query = supabase
        .from('palabras')
        .select('*')
        .order('fecha_agregada', { ascending: false })
      
      if (nivel !== null && nivel !== 'all') {
        query = query.eq('nivel', nivel)
      }
      
      const { data, error: filterError } = await query
      
      if (filterError) throw filterError
      setWords(data || [])
    } catch (err) {
      setError(handleSupabaseError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar palabras al montar el componente
  useEffect(() => {
    fetchWords()
  }, [fetchWords])

  return {
    words,
    loading,
    error,
    addWord,
    updateWord,
    deleteWord,
    fetchWords,
    searchWords,
    filterByCategory,
    filterByLevel,
    wordExists
  }
}