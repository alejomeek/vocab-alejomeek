import React, { useState } from 'react'
import { X, Loader, Volume2, CheckCircle, AlertCircle } from 'lucide-react'
import { useWords } from '../hooks/useWords'
import { speakWord } from '../services/ttsService'
import './AddWordModal.css'

function AddWordModal({ onClose }) {
  const { addWord, loading, wordExists } = useWords()
  const [word, setWord] = useState('')
  const [generatedData, setGeneratedData] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleGenerate = async () => {
    if (!word.trim()) return

    setGenerating(true)
    setError(null)
    setGeneratedData(null)

    try {
      // Verificar si la palabra ya existe
      const exists = await wordExists(word.trim())
      if (exists) {
        setError('This word already exists in your library')
        setGenerating(false)
        return
      }

      // Generar datos con Claude
      const result = await addWord(word.trim())
      
      if (result.success) {
        setGeneratedData(result.word)
        setSuccess(true)
        
        // Auto-cerrar después de 2 segundos
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        setError(result.error || 'Failed to generate word data')
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setGenerating(false)
    }
  }

  const handlePlayAudio = () => {
    if (generatedData) {
      speakWord(generatedData.palabra)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !generating && word.trim()) {
      handleGenerate()
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Add New Word</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {!generatedData && !success && (
            <>
              {/* Input */}
              <div className="input-group">
                <input
                  type="text"
                  className="input word-input"
                  placeholder="Enter word in English..."
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  onKeyPress={handleKeyPress}
                  autoFocus
                  disabled={generating}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleGenerate}
                  disabled={!word.trim() || generating}
                >
                  {generating ? (
                    <>
                      <Loader size={20} className="spinner" />
                      Generating...
                    </>
                  ) : (
                    'Generate'
                  )}
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="alert alert-error">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              {/* Info */}
              <p className="modal-hint">
                Type a word and we'll automatically generate its translation, definition, and example using AI.
              </p>
            </>
          )}

          {/* Success - Palabra generada */}
          {success && generatedData && (
            <div className="success-view fade-in">
              <div className="success-icon">
                <CheckCircle size={48} color="#10b981" />
              </div>
              
              <h3 className="generated-word">{generatedData.palabra}</h3>

              <div className="word-details">
                <div className="word-detail-item">
                  <div className="detail-label">Translation</div>
                  <div className="detail-value">{generatedData.traduccion}</div>
                </div>

                <div className="word-detail-item">
                  <div className="detail-label">Definition</div>
                  <div className="detail-value">{generatedData.significado}</div>
                </div>

                <div className="word-detail-item">
                  <div className="detail-label">Example</div>
                  <div className="detail-value">"{generatedData.ejemplo}"</div>
                </div>

                {generatedData.categoria && (
                  <div className="word-detail-item">
                    <div className="detail-label">Category</div>
                    <div className="detail-value">
                      <span className="category-badge">{generatedData.categoria}</span>
                    </div>
                  </div>
                )}
              </div>

              <button 
                className="btn btn-secondary"
                onClick={handlePlayAudio}
              >
                <Volume2 size={20} />
                Play Pronunciation
              </button>

              <p className="success-message">✅ Word saved successfully!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AddWordModal