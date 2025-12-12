/**
 * Algoritmo de Spaced Repetition (Repetición Espaciada)
 * Calcula cuándo debe revisarse una palabra según su nivel de dominio
 */

/**
 * Intervalos de repaso por nivel (en días)
 */
const REVIEW_INTERVALS = {
  0: 1,      // Nivel 0 (nueva): revisar mañana
  1: 3,      // Nivel 1: revisar en 3 días
  2: 7,      // Nivel 2: revisar en 1 semana
  3: 14,     // Nivel 3: revisar en 2 semanas
  4: 30,     // Nivel 4: revisar en 1 mes
  5: 90      // Nivel 5 (dominada): revisar en 3 meses
}

/**
 * Calcula la próxima fecha de repaso según el nivel
 * @param {number} nivel - Nivel de dominio (0-5)
 * @returns {Date} Fecha del próximo repaso
 */
export function calculateNextReview(nivel) {
  const days = REVIEW_INTERVALS[nivel] || 1
  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + days)
  return nextReview
}

/**
 * Actualiza el estado de una palabra después de estudiarla
 * @param {Object} palabra - Palabra actual
 * @param {boolean} acerto - Si el usuario acertó o falló
 * @returns {Object} Estado actualizado de la palabra
 */
export function updateWordAfterStudy(palabra, acerto) {
  const now = new Date()
  let nuevoNivel = palabra.nivel
  
  if (acerto) {
    // Si acertó, subir de nivel (máximo 5)
    nuevoNivel = Math.min(palabra.nivel + 1, 5)
  } else {
    // Si falló, bajar de nivel (mínimo 0)
    nuevoNivel = Math.max(palabra.nivel - 1, 0)
  }
  
  const proximoRepaso = calculateNextReview(nuevoNivel)
  
  return {
    ...palabra,
    nivel: nuevoNivel,
    veces_estudiada: palabra.veces_estudiada + 1,
    veces_correcta: acerto ? palabra.veces_correcta + 1 : palabra.veces_correcta,
    ultimo_estudio: now.toISOString(),
    proximo_repaso: proximoRepaso.toISOString(),
    actualizada_en: now.toISOString()
  }
}

/**
 * Obtiene las palabras que deben estudiarse hoy
 * @param {Array<Object>} palabras - Todas las palabras
 * @param {number} limit - Cantidad máxima de palabras (default: 10)
 * @returns {Array<Object>} Palabras priorizadas para estudiar hoy
 */
export function getWordsToStudyToday(palabras, limit = 10) {
  const now = new Date()
  
  // Filtrar palabras que deben estudiarse hoy
  const palabrasParaEstudiar = palabras.filter(palabra => {
    if (!palabra.proximo_repaso) return true // Sin fecha = estudiar ya
    const proximoRepaso = new Date(palabra.proximo_repaso)
    return proximoRepaso <= now
  })
  
  // Ordenar por prioridad:
  // 1. Nivel bajo primero (palabras más difíciles)
  // 2. Palabras que llevan más tiempo sin estudiar
  const ordenadas = palabrasParaEstudiar.sort((a, b) => {
    // Primero por nivel (ascendente)
    if (a.nivel !== b.nivel) {
      return a.nivel - b.nivel
    }
    
    // Luego por tiempo sin estudiar (descendente)
    const tiempoA = a.ultimo_estudio ? new Date(a.ultimo_estudio) : new Date(0)
    const tiempoB = b.ultimo_estudio ? new Date(b.ultimo_estudio) : new Date(0)
    return tiempoA - tiempoB
  })
  
  // Retornar solo el límite especificado
  return ordenadas.slice(0, limit)
}

/**
 * Calcula estadísticas de progreso
 * @param {Array<Object>} palabras - Todas las palabras
 * @returns {Object} Estadísticas de progreso
 */
export function calculateProgressStats(palabras) {
  const now = new Date()
  
  const stats = {
    total: palabras.length,
    readyToStudy: 0,
    byLevel: {
      0: 0, // Nuevas
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0  // Dominadas
    },
    studied: 0,
    accuracy: 0
  }
  
  palabras.forEach(palabra => {
    // Contar por nivel
    stats.byLevel[palabra.nivel] = (stats.byLevel[palabra.nivel] || 0) + 1
    
    // Contar palabras listas para estudiar
    if (!palabra.proximo_repaso || new Date(palabra.proximo_repaso) <= now) {
      stats.readyToStudy++
    }
    
    // Contar palabras estudiadas
    if (palabra.veces_estudiada > 0) {
      stats.studied++
    }
  })
  
  // Calcular accuracy global
  const totalIntentos = palabras.reduce((sum, p) => sum + p.veces_estudiada, 0)
  const totalCorrectas = palabras.reduce((sum, p) => sum + p.veces_correcta, 0)
  stats.accuracy = totalIntentos > 0 ? Math.round((totalCorrectas / totalIntentos) * 100) : 0
  
  return stats
}

/**
 * Calcula el streak (días consecutivos estudiando)
 * Nota: Esta función requiere tracking adicional en la BD
 * Por ahora retorna un placeholder
 * @returns {number} Días consecutivos
 */
export function calculateStreak() {
  // TODO: Implementar tracking de sesiones de estudio por fecha
  // Por ahora retornamos 0
  return 0
}

/**
 * Verifica si una palabra debe estudiarse hoy
 * @param {Object} palabra - Palabra a verificar
 * @returns {boolean} True si debe estudiarse hoy
 */
export function shouldStudyToday(palabra) {
  if (!palabra.proximo_repaso) return true
  const proximoRepaso = new Date(palabra.proximo_repaso)
  const now = new Date()
  return proximoRepaso <= now
}