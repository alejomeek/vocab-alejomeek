/**
 * Script para importar CSV desde línea de comandos
 * Uso: node importarCSV.js ruta/a/tu/archivo.csv
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Cargar variables de entorno desde .env
require('dotenv').config()

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan credenciales de Supabase en .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Parsea el CSV
 */
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim())
  
  return lines.map((line, index) => {
    try {
      const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)
      
      if (!values || values.length < 4) {
        console.warn(`⚠️  Línea ${index + 1} inválida`)
        return null
      }
      
      const clean = values.map(v => v.replace(/^["'\s]+|["'\s]+$/g, '').trim())
      
      return {
        palabra: clean[0].toLowerCase(),
        traduccion: clean[1],
        significado: clean[2],
        ejemplo: clean[3],
        nivel: 0,
        veces_estudiada: 0,
        veces_correcta: 0,
        categoria: null,
        tags: [],
        proximo_repaso: new Date().toISOString()
      }
    } catch (error) {
      console.error(`❌ Error en línea ${index + 1}:`, error.message)
      return null
    }
  }).filter(item => item !== null)
}

/**
 * Importa palabras en batches
 */
async function importWords(words) {
  const batchSize = 50
  let imported = 0
  let skipped = 0
  
  console.log(`\n📦 Importando ${words.length} palabras en batches de ${batchSize}...\n`)
  
  for (let i = 0; i < words.length; i += batchSize) {
    const batch = words.slice(i, i + batchSize)
    const progress = Math.round((i / words.length) * 100)
    
    process.stdout.write(`\r⏳ Progreso: ${progress}% (${i}/${words.length})`)
    
    const { data, error } = await supabase
      .from('palabras')
      .insert(batch)
      .select()
    
    if (error) {
      if (error.code === '23505') {
        // Duplicados - intentar uno por uno
        for (const word of batch) {
          const { error: singleError } = await supabase
            .from('palabras')
            .insert([word])
            .select()
          
          if (!singleError) {
            imported++
          } else if (singleError.code === '23505') {
            skipped++
          }
        }
      } else {
        console.error(`\n❌ Error en batch:`, error.message)
      }
    } else {
      imported += data.length
    }
  }
  
  process.stdout.write(`\r✅ Progreso: 100% (${words.length}/${words.length})\n`)
  
  return { imported, skipped, total: words.length }
}

/**
 * Main
 */
async function main() {
  const csvPath = process.argv[2]
  
  if (!csvPath) {
    console.error('❌ Uso: node importarCSV.js <ruta-al-csv>')
    console.error('   Ejemplo: node importarCSV.js ./mi-vocabulario.csv')
    process.exit(1)
  }
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ Archivo no encontrado: ${csvPath}`)
    process.exit(1)
  }
  
  console.log('🚀 Vocab Alejomeek - Importador CSV\n')
  console.log(`📄 Archivo: ${path.basename(csvPath)}`)
  
  try {
    // Leer archivo
    const csvText = fs.readFileSync(csvPath, 'utf-8')
    
    // Parsear
    console.log('📝 Parseando CSV...')
    const words = parseCSV(csvText)
    console.log(`✅ ${words.length} palabras parseadas correctamente\n`)
    
    // Importar
    const result = await importWords(words)
    
    // Resultados
    console.log('\n📊 Resultados:')
    console.log(`   ✅ Importadas: ${result.imported}`)
    console.log(`   ⏭️  Omitidas (duplicadas): ${result.skipped}`)
    console.log(`   📦 Total procesadas: ${result.total}\n`)
    
    if (result.imported > 0) {
      console.log('🎉 ¡Importación completada con éxito!')
      console.log('\n💡 Próximo paso: Enriquecer palabras con categorías')
      console.log('   Puedes hacerlo desde la app en Settings > Enrich Categories')
    }
  } catch (error) {
    console.error('\n❌ Error durante la importación:', error.message)
    process.exit(1)
  }
}

main()