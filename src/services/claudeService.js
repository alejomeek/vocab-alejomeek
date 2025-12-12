import Anthropic from '@anthropic-ai/sdk'

// Inicializar cliente de Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true // Solo para desarrollo - en producción usar backend
})

/**
 * Genera información completa de una palabra usando Claude API
 * @param {string} word - Palabra en inglés a procesar
 * @returns {Promise<Object>} Objeto con traducción, significado, ejemplo y categoría
 */
export async function generateWordData(word) {
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `Necesito información sobre la palabra en inglés: "${word}"

Por favor proporciona:
1. Traducción al español (una palabra o frase corta, la más común)
2. Definición en inglés (clara y concisa, máximo 2 líneas)
3. Un ejemplo de uso en inglés en una oración contextual y natural
4. Categoría gramatical (noun, verb, adjective, adverb, preposition, conjunction, etc.)

IMPORTANTE: Responde SOLO con este JSON exacto, sin texto adicional, sin markdown, sin backticks:
{
  "traduccion": "...",
  "significado": "...",
  "ejemplo": "...",
  "categoria": "..."
}`
      }]
    })

    // Extraer el JSON de la respuesta
    const responseText = message.content[0].text
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON de la respuesta de Claude')
    }

    const data = JSON.parse(jsonMatch[0])
    
    // Validar que tenga todos los campos necesarios
    if (!data.traduccion || !data.significado || !data.ejemplo || !data.categoria) {
      throw new Error('Respuesta de Claude incompleta')
    }

    return data
  } catch (error) {
    console.error('Error generando datos de palabra:', error)
    throw new Error('No se pudo generar información para esta palabra. Intenta de nuevo.')
  }
}

/**
 * Enriquece una palabra existente agregando la categoría
 * @param {string} word - Palabra en inglés
 * @returns {Promise<string>} Categoría gramatical
 */
export async function generateCategory(word) {
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 100,
      messages: [{
        role: "user",
        content: `¿Cuál es la categoría gramatical de la palabra "${word}" en inglés? 
        
Responde SOLO con una palabra: noun, verb, adjective, adverb, preposition, conjunction, pronoun, o interjection`
      }]
    })

    return message.content[0].text.trim().toLowerCase()
  } catch (error) {
    console.error('Error generando categoría:', error)
    return null
  }
}