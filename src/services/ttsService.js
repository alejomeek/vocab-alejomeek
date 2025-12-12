/**
 * Servicio de Text-to-Speech para pronunciación de palabras en inglés
 * Utiliza Web Speech API (nativo del navegador)
 */

/**
 * Reproduce la pronunciación de una palabra en inglés (acento US)
 * @param {string} word - Palabra a pronunciar
 * @returns {Promise<void>}
 */
export function speakWord(word) {
  return new Promise((resolve, reject) => {
    // Verificar si el navegador soporta Web Speech API
    if (!('speechSynthesis' in window)) {
      reject(new Error('Tu navegador no soporta síntesis de voz'))
      return
    }

    // Cancelar cualquier pronunciación en curso
    window.speechSynthesis.cancel()

    // Crear utterance
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-US' // Acento americano
    utterance.rate = 0.85 // Velocidad un poco más lenta para claridad
    utterance.pitch = 1.0
    utterance.volume = 1.0

    // Intentar usar una voz US específica si está disponible
    const voices = window.speechSynthesis.getVoices()
    const usVoice = voices.find(voice => 
      voice.lang === 'en-US' && voice.name.includes('US')
    ) || voices.find(voice => voice.lang === 'en-US')

    if (usVoice) {
      utterance.voice = usVoice
    }

    // Event listeners
    utterance.onend = () => resolve()
    utterance.onerror = (event) => reject(event.error)

    // Reproducir
    window.speechSynthesis.speak(utterance)
  })
}

/**
 * Reproduce la pronunciación de una frase completa
 * @param {string} text - Texto a pronunciar
 * @returns {Promise<void>}
 */
export function speakText(text) {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Tu navegador no soporta síntesis de voz'))
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.9
    utterance.pitch = 1.0
    utterance.volume = 1.0

    const voices = window.speechSynthesis.getVoices()
    const usVoice = voices.find(voice => voice.lang === 'en-US')
    if (usVoice) {
      utterance.voice = usVoice
    }

    utterance.onend = () => resolve()
    utterance.onerror = (event) => reject(event.error)

    window.speechSynthesis.speak(utterance)
  })
}

/**
 * Detiene cualquier reproducción en curso
 */
export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

/**
 * Verifica si el navegador soporta Text-to-Speech
 * @returns {boolean}
 */
export function isTTSSupported() {
  return 'speechSynthesis' in window
}

// Precargar voces (workaround para algunos navegadores)
if ('speechSynthesis' in window) {
  window.speechSynthesis.getVoices()
  // En algunos navegadores las voces se cargan de forma asíncrona
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices()
  }
}