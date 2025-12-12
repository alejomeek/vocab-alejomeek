import React, { useState, useEffect } from 'react'
import { Plus, TrendingUp, Target, Flame } from 'lucide-react'
import { useWords } from '../hooks/useWords'
import { calculateProgressStats, getWordsToStudyToday } from '../utils/spacedRepetition'
import AddWordModal from './AddWordModal'
import './Dashboard.css'

function Dashboard() {
  const { words, loading } = useWords()
  const [showAddModal, setShowAddModal] = useState(false)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (words.length > 0) {
      const progressStats = calculateProgressStats(words)
      const wordsToStudy = getWordsToStudyToday(words, 10)
      
      setStats({
        ...progressStats,
        wordsReadyToday: wordsToStudy.length
      })
    }
  }, [words])

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner">⏳</div>
        <p>Cargando tu vocabulario...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="container-sm">
        {/* Botón principal: Agregar palabra */}
        <button 
          className="btn-add-word"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={24} />
          <span>Add New Word</span>
        </button>

        {/* Estadísticas principales */}
        <section className="stats-section">
          <h2 className="section-title">📊 Your Progress</h2>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#dbeafe' }}>
                <TrendingUp size={24} color="#1e3a8a" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats?.total || 0}</div>
                <div className="stat-label">Total Words</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#dcfce7' }}>
                <Target size={24} color="#10b981" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats?.readyToStudy || 0}</div>
                <div className="stat-label">Ready to Study</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#fed7aa' }}>
                <Flame size={24} color="#f59e0b" />
              </div>
              <div className="stat-content">
                <div className="stat-value">0</div>
                <div className="stat-label">Days Streak</div>
              </div>
            </div>
          </div>
        </section>

        {/* Distribución por niveles */}
        {stats && (
          <section className="levels-section">
            <h3 className="section-subtitle">Mastery Levels</h3>
            <div className="levels-chart">
              {[5, 4, 3, 2, 1, 0].map(level => {
                const count = stats.byLevel[level] || 0
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0
                
                return (
                  <div key={level} className="level-row">
                    <div className="level-label">
                      {level === 5 ? '⭐' : level === 0 ? '🆕' : `${level}`}
                    </div>
                    <div className="level-bar-container">
                      <div 
                        className="level-bar"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: level === 5 ? '#10b981' : 
                                          level === 0 ? '#6b7280' : '#3b82f6'
                        }}
                      />
                    </div>
                    <div className="level-count">{count}</div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Botón Start Daily Practice */}
        <button className="btn-start-practice">
          <Target size={20} />
          <div>
            <div className="practice-title">🎯 Start Daily Practice</div>
            <div className="practice-subtitle">
              ({stats?.wordsReadyToday || 0} words ready)
            </div>
          </div>
        </button>

        {/* Palabras recientes */}
        <section className="recent-section">
          <h3 className="section-subtitle">📚 Recent Words</h3>
          <div className="recent-words">
            {words.slice(0, 5).map(word => (
              <div key={word.id} className="recent-word-item">
                <span className="recent-word-text">{word.palabra}</span>
                <span className="recent-word-level">
                  {'●'.repeat(word.nivel)}{'○'.repeat(5 - word.nivel)}
                </span>
              </div>
            ))}
            
            {words.length === 0 && (
              <p className="empty-state">
                No words yet. Click "Add New Word" to start building your vocabulary!
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Modal para agregar palabra */}
      {showAddModal && (
        <AddWordModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  )
}

export default Dashboard