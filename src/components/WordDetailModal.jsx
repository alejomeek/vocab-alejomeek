import React from 'react'
import { X, Volume2, Trash2, Calendar, Target } from 'lucide-react'
import { speakWord } from '../services/ttsService'
import './WordDetailModal.css'

function WordDetailModal({ word, onClose, onDelete }) {
  const handlePlayAudio = () => {
    speakWord(word.palabra)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const getLevelText = (nivel) => {
    const texts = {
      0: 'New',
      1: 'Learning',
      2: 'Progressing',
      3: 'Advanced',
      4: 'Almost Mastered',
      5: 'Mastered'
    }
    return texts[nivel] || 'Unknown'
  }

  const getLevelColor = (nivel) => {
    const colors = {
      0: '#6b7280',
      1: '#3b82f6',
      2: '#8b5cf6',
      3: '#ec4899',
      4: '#f59e0b',
      5: '#10b981'
    }
    return colors[nivel] || colors[0]
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content word-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="word-detail-title">{word.palabra}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Pronunciación */}
          <button className="btn-play-audio" onClick={handlePlayAudio}>
            <Volume2 size={24} />
            <span>Play Pronunciation</span>
          </button>

          {/* Información principal */}
          <div className="word-info-section">
            <div className="info-item">
              <div className="info-label">📝 Translation</div>
              <div className="info-value">{word.traduccion}</div>
            </div>

            <div className="info-item">
              <div className="info-label">📖 Definition</div>
              <div className="info-value">{word.significado}</div>
            </div>

            <div className="info-item">
              <div className="info-label">💬 Example</div>
              <div className="info-value info-example">"{word.ejemplo}"</div>
            </div>

            {word.categoria && (
              <div className="info-item">
                <div className="info-label">🏷️ Category</div>
                <div className="info-value">
                  <span className="category-badge">{word.categoria}</span>
                </div>
              </div>
            )}
          </div>

          {/* Estadísticas de estudio */}
          <div className="study-stats">
            <h3 className="stats-title">📊 Study Statistics</h3>

            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-label">Level</div>
                <div 
                  className="stat-value level-badge"
                  style={{ backgroundColor: getLevelColor(word.nivel) }}
                >
                  {getLevelText(word.nivel)}
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-label">Times Studied</div>
                <div className="stat-value">{word.veces_estudiada}</div>
              </div>

              <div className="stat-item">
                <div className="stat-label">Correct Answers</div>
                <div className="stat-value">{word.veces_correcta}</div>
              </div>

              <div className="stat-item">
                <div className="stat-label">Accuracy</div>
                <div className="stat-value">
                  {word.veces_estudiada > 0
                    ? Math.round((word.veces_correcta / word.veces_estudiada) * 100)
                    : 0}%
                </div>
              </div>
            </div>

            <div className="date-info">
              <div className="date-item">
                <Calendar size={16} />
                <span>
                  <strong>Last review:</strong> {formatDate(word.ultimo_estudio)}
                </span>
              </div>
              <div className="date-item">
                <Target size={16} />
                <span>
                  <strong>Next review:</strong> {formatDate(word.proximo_repaso)}
                </span>
              </div>
            </div>

            {/* Barra de progreso visual */}
            <div className="progress-section">
              <div className="progress-label">Mastery Progress</div>
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{
                    width: `${(word.nivel / 5) * 100}%`,
                    backgroundColor: getLevelColor(word.nivel)
                  }}
                />
              </div>
              <div className="progress-text">
                Level {word.nivel} of 5
              </div>
            </div>
          </div>

          {/* Botón eliminar */}
          <button
            className="btn-delete"
            onClick={() => {
              if (onDelete) {
                onDelete(word.id)
              }
            }}
          >
            <Trash2 size={18} />
            <span>Delete Word</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default WordDetailModal