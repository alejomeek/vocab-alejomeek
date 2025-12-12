import { useState, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { updateWordAfterStudy, getWordsToStudyToday } from '../utils/spacedRepetition'

/**
 * Custom hook para gestionar sesiones de estudio
 * Proporciona lógica para Daily Practice y tracking de progreso
 */
export function useStudy() {
  const [studySession, setStudySession] = useState(null)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [sessionResults, setSessionResults] = useState([])
  const [loading, setLoading] = useState(false)

  /**
   * Iniciar una nueva sesión de estudio
   * @param {Array<Object>} allWords - Todas las palabras disponibles
   * @param {number} limit - Cantidad de palabras para la sesión
   * @param {string} mode - Modo de estudio (flashcards, multipleChoice, etc.)
   */
  const startStudySession = useCallback((allWords, limit = 10, mode = 'flashcards') => {
    const wordsToStudy = getWordsToStudyToday(allWords, limit)
    
    if (wordsToStudy.length === 0) {
      return { success: false, message: 'No hay palabras para estudiar hoy' }
    }
    
    setStudySession({
      words: wordsToStudy,
      mode,
      startTime: new Date(),
      totalWords: wordsToStudy.length
    })
    setCurrentWordIndex(0)
    setSessionResults([])
    
    return { success: true, words: wordsToStudy }
  }, [])

  /**
   * Obtener la palabra actual de la sesión
   */
  const getCurrentWord = useCallback(() => {
    if (!studySession || currentWordIndex >= studySession.words.length) {
      return null
    }
    return studySession.words[currentWordIndex]
  }, [studySession, currentWordIndex])

  /**
   * Registrar respuesta del usuario
   * @param {boolean} correct - Si la respuesta fue correcta
   * @param {string} userAnswer - Respuesta del usuario (opcional)
   */
  const submitAnswer = useCallback(async (correct, userAnswer = null) => {
    if (!studySession) return { success: false, message: 'No hay sesión activa' }
    
    const currentWord = getCurrentWord()
    if (!currentWord) return { success: false, message: 'No hay palabra actual' }
    
    setLoading(true)
    
    try {
      // Actualizar palabra con spaced repetition
      const updatedWord = updateWordAfterStudy(currentWord, correct)
      
      // Guardar en Supabase
      const { error } = await supabase
        .from('palabras')
        .update({
          nivel: updatedWord.nivel,
          veces_estudiada: updatedWord.veces_estudiada,
          veces_correcta: updatedWord.veces_correcta,
          ultimo_estudio: updatedWord.ultimo_estudio,
          proximo_repaso: updatedWord.proximo_repaso
        })
        .eq('id', currentWord.id)
      
      if (error) throw error
      
      // Registrar resultado en la sesión
      const result = {
        wordId: currentWord.id,
        palabra: currentWord.palabra,
        correct,
        userAnswer,
        timestamp: new Date()
      }
      
      setSessionResults(prev => [...prev, result])
      
      return { success: true, updatedWord, result }
    } catch (err) {
      console.error('Error actualizando palabra:', err)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [studySession, getCurrentWord])

  /**
   * Avanzar a la siguiente palabra
   */
  const nextWord = useCallback(() => {
    if (!studySession) return false
    
    const nextIndex = currentWordIndex + 1
    if (nextIndex >= studySession.words.length) {
      // Sesión completada
      return false
    }
    
    setCurrentWordIndex(nextIndex)
    return true
  }, [studySession, currentWordIndex])

  /**
   * Saltar palabra actual (no cuenta como respuesta)
   */
  const skipWord = useCallback(() => {
    return nextWord()
  }, [nextWord])

  /**
   * Finalizar sesión y obtener resultados
   */
  const endSession = useCallback(() => {
    if (!studySession) return null
    
    const endTime = new Date()
    const duration = Math.round((endTime - studySession.startTime) / 1000) // segundos
    
    const summary = {
      totalWords: studySession.totalWords,
      answered: sessionResults.length,
      correct: sessionResults.filter(r => r.correct).length,
      incorrect: sessionResults.filter(r => !r.correct).length,
      accuracy: sessionResults.length > 0
        ? Math.round((sessionResults.filter(r => r.correct).length / sessionResults.length) * 100)
        : 0,
      duration,
      mode: studySession.mode,
      results: sessionResults
    }
    
    // Limpiar estado
    setStudySession(null)
    setCurrentWordIndex(0)
    setSessionResults([])
    
    return summary
  }, [studySession, sessionResults])

  /**
   * Obtener progreso de la sesión actual
   */
  const getSessionProgress = useCallback(() => {
    if (!studySession) return null
    
    return {
      current: currentWordIndex + 1,
      total: studySession.totalWords,
      percentage: Math.round(((currentWordIndex + 1) / studySession.totalWords) * 100),
      answered: sessionResults.length,
      correct: sessionResults.filter(r => r.correct).length
    }
  }, [studySession, currentWordIndex, sessionResults])

  /**
   * Verificar si la sesión está activa
   */
  const isSessionActive = useCallback(() => {
    return studySession !== null && currentWordIndex < studySession.words.length
  }, [studySession, currentWordIndex])

  /**
   * Verificar si es la última palabra
   */
  const isLastWord = useCallback(() => {
    if (!studySession) return false
    return currentWordIndex === studySession.words.length - 1
  }, [studySession, currentWordIndex])

  return {
    // Estado
    studySession,
    currentWord: getCurrentWord(),
    loading,
    
    // Acciones
    startStudySession,
    submitAnswer,
    nextWord,
    skipWord,
    endSession,
    
    // Info
    getSessionProgress,
    isSessionActive,
    isLastWord
  }
}