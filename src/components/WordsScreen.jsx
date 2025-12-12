import React, { useState, useEffect } from 'react'
import { Search, Filter, X, Volume2 } from 'lucide-react'
import { useWords } from '../hooks/useWords'
import { speakWord } from '../services/ttsService'
import WordDetailModal from './WordDetailModal'
import './WordsScreen.css'

function WordsScreen() {
  const { words, loading, deleteWord } = useWords()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedWord, setSelectedWord] = useState(null)
  const [filteredWords, setFilteredWords] = useState([])

  // Obtener categorías únicas
  const categories = ['all', ...new Set(words.map(w => w.categoria).filter(Boolean))]

  useEffect(() => {
    let result = words

    // Filtrar por búsqueda
    if (searchQuery) {
      result = result.filter(word =>
        word.palabra.toLowerCase().includes(searchQuery.toLowerCase()) ||
        word.traduccion.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      result = result.filter(word => word.categoria === selectedCategory)
    }

    // Filtrar por nivel
    if (selectedLevel !== 'all') {
      result = result.filter(word => word.nivel === parseInt(selectedLevel))
    }

    setFilteredWords(result)
  }, [words, searchQuery, selectedCategory, selectedLevel])

  const handlePlayAudio = (palabra) => {
    speakWord(palabra)
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta palabra?')) {
      await deleteWord(id)
      setSelectedWord(null)
    }
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

  if (loading) {
    return (
      <div className="words-loading">
        <div className="spinner">⏳</div>
        <p>Loading words...</p>
      </div>
    )
  }

  return (
    <div className="words-screen">
      <div className="container">
        {/* Header con búsqueda */}
        <div className="words-header">
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search words..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="search-clear"
                onClick={() => setSearchQuery('')}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button
            className="filter-button"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
          </button>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="filters-panel fade-in">
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <select
                className="filter-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Level</label>
              <select
                className="filter-select"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="0">🆕 New (0)</option>
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
                <option value="3">Level 3</option>
                <option value="4">Level 4</option>
                <option value="5">⭐ Mastered (5)</option>
              </select>
            </div>
          </div>
        )}

        {/* Contador de resultados */}
        <div className="results-count">
          {filteredWords.length} word{filteredWords.length !== 1 ? 's' : ''}
          {(searchQuery || selectedCategory !== 'all' || selectedLevel !== 'all') && (
            <button
              className="clear-filters"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setSelectedLevel('all')
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Lista de palabras */}
        <div className="words-grid">
          {filteredWords.map(word => (
            <div
              key={word.id}
              className="word-card fade-in"
              onClick={() => setSelectedWord(word)}
            >
              <div className="word-card-header">
                <h3 className="word-title">{word.palabra}</h3>
                <button
                  className="word-audio-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePlayAudio(word.palabra)
                  }}
                >
                  <Volume2 size={18} />
                </button>
              </div>

              <p className="word-translation">{word.traduccion}</p>
              <p className="word-definition">{word.significado}</p>

              <div className="word-card-footer">
                <div className="word-level">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className="level-dot"
                      style={{
                        backgroundColor: i < word.nivel ? getLevelColor(word.nivel) : '#e5e7eb'
                      }}
                    />
                  ))}
                </div>

                {word.categoria && (
                  <span className="word-category">{word.categoria}</span>
                )}
              </div>
            </div>
          ))}

          {filteredWords.length === 0 && (
            <div className="empty-state">
              <p>No words found</p>
              {searchQuery && (
                <button
                  className="btn btn-secondary"
                  onClick={() => setSearchQuery('')}
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalle */}
      {selectedWord && (
        <WordDetailModal
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

export default WordsScreen