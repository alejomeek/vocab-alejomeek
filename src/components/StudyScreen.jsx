import React, { useState } from 'react'
import { BookOpen, CheckSquare, Edit3, Headphones, ArrowLeft } from 'lucide-react'
import { useWords } from '../hooks/useWords'
import { useStudy } from '../hooks/useStudy'
import { getWordsToStudyToday } from '../utils/spacedRepetition'
import FlashcardsMode from './study/FlashcardsMode'
import MultipleChoiceMode from './study/MultipleChoiceMode'
import WriteTranslationMode from './study/WriteTranslationMode'
import ListenWriteMode from './study/ListenWriteMode'
import './StudyScreen.css'

function StudyScreen() {
  const { words } = useWords()
  const { startStudySession } = useStudy()
  const [selectedMode, setSelectedMode] = useState(null)
  const [sessionActive, setSessionActive] = useState(false)

  const modes = [
    {
      id: 'flashcards',
      name: 'Flashcards',
      icon: BookOpen,
      description: 'Tap to reveal, mark if you got it right',
      color: '#3b82f6',
      component: FlashcardsMode
    },
    {
      id: 'multipleChoice',
      name: 'Multiple Choice',
      icon: CheckSquare,
      description: 'Choose the correct translation or definition',
      color: '#8b5cf6',
      component: MultipleChoiceMode
    },
    {
      id: 'writeTranslation',
      name: 'Write Translation',
      icon: Edit3,
      description: 'Type the Spanish translation',
      color: '#ec4899',
      component: WriteTranslationMode
    },
    {
      id: 'listenWrite',
      name: 'Listen & Write',
      icon: Headphones,
      description: 'Listen and write the word',
      color: '#f59e0b',
      component: ListenWriteMode
    }
  ]

  const wordsReady = getWordsToStudyToday(words, 10)

  const handleStartMode = (mode) => {
    const result = startStudySession(words, 10, mode.id)
    if (result.success) {
      setSelectedMode(mode)
      setSessionActive(true)
    }
  }

  const handleEndSession = () => {
    setSelectedMode(null)
    setSessionActive(false)
  }

  // Si hay sesión activa, mostrar el modo correspondiente
  if (sessionActive && selectedMode) {
    const ModeComponent = selectedMode.component
    return (
      <div className="study-mode-container">
        <div className="study-mode-header">
          <button className="back-button" onClick={handleEndSession}>
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <h2 className="mode-title">{selectedMode.name}</h2>
        </div>
        <ModeComponent onComplete={handleEndSession} />
      </div>
    )
  }

  // Pantalla de selección de modo
  return (
    <div className="study-screen">
      <div className="container-sm">
        <div className="study-header">
          <h2 className="study-title">Choose Study Mode</h2>
          <p className="study-subtitle">
            {wordsReady.length} words ready to study
          </p>
        </div>

        <div className="modes-grid">
          {modes.map((mode) => {
            const Icon = mode.icon
            return (
              <button
                key={mode.id}
                className="mode-card"
                onClick={() => handleStartMode(mode)}
                disabled={wordsReady.length === 0}
              >
                <div className="mode-icon" style={{ backgroundColor: mode.color }}>
                  <Icon size={32} color="white" />
                </div>
                <div className="mode-content">
                  <h3 className="mode-name">{mode.name}</h3>
                  <p className="mode-description">{mode.description}</p>
                </div>
              </button>
            )
          })}
        </div>

        {wordsReady.length === 0 && (
          <div className="no-words-message">
            <p>🎉 All caught up!</p>
            <p>No words need review right now. Check back later!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudyScreen