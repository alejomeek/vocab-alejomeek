import React, { useState, useEffect } from 'react'
import { useStudy } from '../../hooks/useStudy'
import { speakWord } from '../../services/ttsService'
import { Volume2, CheckCircle, XCircle } from 'lucide-react'

export default function ListenWriteMode({ onComplete }) {
  const { currentWord, submitAnswer, nextWord, getSessionProgress, isLastWord, endSession } = useStudy()
  const [userAnswer, setUserAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [hasPlayed, setHasPlayed] = useState(false)
  const progress = getSessionProgress()

  useEffect(() => {
    // Auto-reproducir al cargar la palabra
    if (currentWord && !hasPlayed) {
      setTimeout(() => {
        handlePlayAudio()
        setHasPlayed(true)
      }, 500)
    }
  }, [currentWord])

  const handlePlayAudio = () => {
    if (currentWord) {
      speakWord(currentWord.palabra)
    }
  }

  const normalizeText = (text) => {
    return text.toLowerCase().trim().replace(/[^\w]/g, '')
  }

  const checkAnswer = () => {
    if (!userAnswer.trim()) return

    const normalized = normalizeText(userAnswer)
    const correctNormalized = normalizeText(currentWord.palabra)
    
    const correct = normalized === correctNormalized
    
    setIsCorrect(correct)
    setShowResult(true)

    setTimeout(async () => {
      await submitAnswer(correct)
      
      if (isLastWord()) {
        const summary = endSession()
        alert(`Session complete! ${summary.correct}/${summary.totalWords} correct (${summary.accuracy}%)`)
        onComplete()
      } else {
        nextWord()
        setUserAnswer('')
        setShowResult(false)
        setHasPlayed(false)
      }
    }, 2000)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !showResult && userAnswer.trim()) {
      checkAnswer()
    }
  }

  if (!currentWord) return <div className="container">No words available</div>

  return (
    <div className="container-sm" style={{ paddingTop: '40px' }}>
      <div style={{ marginBottom: '20px', textAlign: 'center', color: '#6b7280' }}>
        {progress?.current} / {progress?.total}
      </div>

      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '48px 32px',
        marginBottom: '24px',
        textAlign: 'center',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px', fontWeight: '600' }}>
          🎧 Listen and write what you hear
        </p>

        <button
          onClick={handlePlayAudio}
          disabled={showResult}
          style={{
            width: '120px',
            height: '120px',
            background: showResult ? '#9ca3af' : 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            border: 'none',
            borderRadius: '60px',
            cursor: showResult ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            transition: 'all 0.3s',
            boxShadow: '0 8px 16px rgba(30, 58, 138, 0.3)'
          }}
        >
          <Volume2 size={48} color="white" />
        </button>

        <p style={{ fontSize: '12px', color: '#9ca3af' }}>
          Click to play again
        </p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <input
          type="text"
          className="input"
          placeholder="Type what you heard..."
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={showResult}
          autoFocus
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '18px',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            textAlign: 'center'
          }}
        />
      </div>

      <button
        onClick={checkAnswer}
        disabled={!userAnswer.trim() || showResult}
        style={{
          width: '100%',
          padding: '16px',
          background: !userAnswer.trim() || showResult ? '#9ca3af' : '#1e3a8a',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: !userAnswer.trim() || showResult ? 'not-allowed' : 'pointer'
        }}
      >
        Check Answer
      </button>

      {showResult && (
        <div style={{
          marginTop: '24px',
          padding: '24px',
          background: isCorrect ? '#dcfce7' : '#fee2e2',
          borderRadius: '12px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            {isCorrect ? <CheckCircle size={32} color="#10b981" /> : <XCircle size={32} color="#ef4444" />}
            <p style={{
              fontSize: '20px',
              fontWeight: '700',
              color: isCorrect ? '#10b981' : '#ef4444'
            }}>
              {isCorrect ? '¡Correcto!' : 'Incorrecto'}
            </p>
          </div>
          
          {!isCorrect && (
            <>
              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>You wrote:</p>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#ef4444' }}>{userAnswer}</p>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Correct word:</p>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#10b981' }}>{currentWord.palabra}</p>
              </div>
            </>
          )}
          
          <div style={{
            marginTop: '16px',
            padding: '16px',
            background: 'white',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              <strong>{currentWord.palabra}</strong> - {currentWord.traduccion}
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>
              "{currentWord.ejemplo}"
            </p>
          </div>
        </div>
      )}
    </div>
  )
}