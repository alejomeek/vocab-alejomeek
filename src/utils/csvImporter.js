import { supabase } from '../services/supabase'
import { generateCategory } from '../services/claudeService'

/**
 * Parsea un archivo CSV y lo convierte a un array de objetos
 * Formato esperado: Palabra, Traduccion, Significado, Ejemplo
 * @param {string} csvText - Contenido del archivo CSV
 * @returns {Array<Object>} Array de palabras parseadas
 */
export function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim())
  
  return lines.map((line, index) => {
    try {
      // Parsear respetando comas dentro de comillas
      const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)
      
      if (!values || values.length < 4) {
        console.warn(`Línea ${index + 1} inválida (faltan columnas):`, line)
        return null
      }
      
      // Limpiar comillas y espacios en blanco
      const clean = values.map(v => v.replace(/^["'\s]+|["'\s]+$/g, '').trim())
      
      return {
        palabra: clean[0].toLowerCase(),
        traduccion: clean[1],
        significado: clean[2],
        ejemplo: clean[3],
        // Campos por defecto
        nivel: 0,
        veces_estudiada: 0,
        veces_correcta: 0,
        categoria: null, // Se agregará después con Claude
        tags: [],
        proximo_repaso: new Date().toISOString()
      }
    } catch (error) {
      console.error(`Error parseando línea ${index + 1}:`, error)
      return null
    }
  }).filter(item => item !== null)
}

/**
 * Importa palabras a Supabase en batches
 * @param {Array<Object>} words - Array de palabras a importar
 * @param {Function} onProgress - Callback para reportar progreso (opcional)
 * @returns {Promise<Object>} Resultado de la importación
 */
export async function importWordsToSupabase(words, onProgress = null) {
  try {
    const batchSize = 50 // Insertamos de 50 en 50
    const results = {
      imported: 0,
      skipped: 0,
      errors: []
    }
    
    for (let i = 0; i < words.length; i += batchSize) {
      const batch = words.slice(i, i + batchSize)
      
      // Reportar progreso
      if (onProgress) {
        onProgress({
          current: i,
          total: words.length,
          percentage: Math.round((i / words.length) * 100)
        })
      }
      
      const { data, error } = await supabase
        .from('palabras')
        .insert(batch)
        .select()
      
      if (error) {
        // Si hay duplicados, intentar uno por uno
        if (error.code === '23505') {
          for (const word of batch) {
            const { data: single, error: singleError } = await supabase
              .from('palabras')
              .insert([word])
              .select()
            
            if (!singleError) {
              results.imported++
            } else if (singleError.code === '23505') {
              results.skipped++
            } else {
              results.errors.push({
                word: word.palabra,
                error: singleError.message
              })
            }
          }
        } else {
          throw error
        }
      } else {
        results.imported += data.length
      }
    }
    
    // Reportar 100%
    if (onProgress) {
      onProgress({
        current: words.length,
        total: words.length,
        percentage: 100
      })
    }
    
    return {
      success: true,
      ...results,
      total: words.length
    }
  } catch (error) {
    console.error('Error importando palabras:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Enriquece palabras sin categoría usando Claude API
 * @param {Function} onProgress - Callback para reportar progreso
 * @returns {Promise<Object>} Resultado del enriquecimiento
 */
export async function enrichWordsWithCategories(onProgress = null) {
  try {
    // Obtener palabras sin categoría
    const { data: words, error } = await supabase
      .from('palabras')
      .select('id, palabra')
      .is('categoria', null)
    
    if (error) throw error
    
    if (!words || words.length === 0) {
      return {
        success: true,
        enriched: 0,
        message: 'No hay palabras sin categoría'
      }
    }
    
    let enriched = 0
    const total = words.length
    
    // Procesar palabras una por una (para no saturar la API)
    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      
      // Reportar progreso
      if (onProgress) {
        onProgress({
          current: i + 1,
          total,
          percentage: Math.round(((i + 1) / total) * 100),
          word: word.palabra
        })
      }
      
      try {
        // Generar categoría con Claude
        const categoria = await generateCategory(word.palabra)
        
        if (categoria) {
          // Actualizar en Supabase
          const { error: updateError } = await supabase
            .from('palabras')
            .update({ categoria })
            .eq('id', word.id)
          
          if (!updateError) {
            enriched++
          }
        }
        
        // Pequeña pausa para no saturar la API (opcional)
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Error enriqueciendo palabra "${word.palabra}":`, error)
      }
    }
    
    return {
      success: true,
      enriched,
      total
    }
  } catch (error) {
    console.error('Error enriqueciendo palabras:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Función principal: Lee CSV, importa y enriquece
 * @param {File} file - Archivo CSV
 * @param {Function} onProgress - Callback para reportar progreso
 * @param {boolean} enrichCategories - Si debe enriquecer con categorías
 * @returns {Promise<Object>} Resultado completo
 */
export async function importCSVFile(file, onProgress = null, enrichCategories = true) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      try {
        // 1. Parsear CSV
        if (onProgress) {
          onProgress({ stage: 'parsing', message: 'Procesando archivo CSV...' })
        }
        
        const csvText = e.target.result
        const words = parseCSV(csvText)
        
        console.log(`Parseadas ${words.length} palabras del CSV`)
        
        // 2. Importar a Supabase
        if (onProgress) {
          onProgress({ stage: 'importing', message: 'Importando palabras...' })
        }
        
        const importResult = await importWordsToSupabase(words, (progress) => {
          if (onProgress) {
            onProgress({
              stage: 'importing',
              message: `Importando palabras (${progress.current}/${progress.total})...`,
              ...progress
            })
          }
        })
        
        if (!importResult.success) {
          reject(importResult)
          return
        }
        
        // 3. Enriquecer con categorías (opcional)
        let enrichResult = null
        if (enrichCategories && importResult.imported > 0) {
          if (onProgress) {
            onProgress({ stage: 'enriching', message: 'Generando categorías con IA...' })
          }
          
          enrichResult = await enrichWordsWithCategories((progress) => {
            if (onProgress) {
              onProgress({
                stage: 'enriching',
                message: `Procesando "${progress.word}" (${progress.current}/${progress.total})...`,
                ...progress
              })
            }
          })
        }
        
        // 4. Resolver con resultados completos
        resolve({
          success: true,
          imported: importResult.imported,
          skipped: importResult.skipped,
          enriched: enrichResult?.enriched || 0,
          total: words.length
        })
      } catch (error) {
        reject({
          success: false,
          error: error.message
        })
      }
    }
    
    reader.onerror = () => reject({
      success: false,
      error: 'Error leyendo el archivo'
    })
    
    reader.readAsText(file)
  })
}