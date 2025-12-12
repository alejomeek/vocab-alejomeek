import React, { useState } from 'react'
import { useStudy } from '../../hooks/useStudy'
import { CheckCircle, XCircle } from 'lucide-react'

export default function FlashcardsMode({ onComplete }) {
  const { currentWord, submitAnswer, nextWord, getSessionProgress, isLastWord, endSession } = useStudy()
  const [revealed, setRevealed] = useState(false)
  const progress = getSessionProgress()

  const handleAnswer = async (correct) => {
    await submitAnswer(correct)
    if (isLastWord()) {
      const summary = endSession()
      alert(`Session complete! ${summary.correct}/${summary.totalWords} correct`)
      onComplete()
    } else {
      nextWord()
      setRevealed(false)
    }
  }

  if (!currentWord) return <div className="container">No words available</div>

  return (
    <div className="container-sm" style={{ paddingTop: '40px' }}>
      <div style={{ marginBottom: '20px', textAlign: 'center', color: '#6b7280' }}>
        {progress?.current} / {progress?.total}
      </div>
      
      <div 
        onClick={() => setRevealed(!revealed)}
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '60px 40px',
          textAlign: 'center',
          cursor: 'pointer',
          minHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#1e3a8a', marginBottom: '24px' }}>
          {currentWord.palabra}
        </h2>
        {!revealed && <p style={{ color: '#6b7280' }}>Tap to reveal</p>}
        {revealed && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <p style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>{currentWord.traduccion}</p>
            <p style={{ color: '#6b7280', marginBottom: '12px' }}>{currentWord.significado}</p>
            <p style={{ fontStyle: 'italic', fontSize: '14px', color: '#9ca3af' }}>"{currentWord.ejemplo}"</p>
          </div>
        )}
      </div>

      {revealed && (
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button
            onClick={() => handleAnswer(false)}
            style={{
              flex: 1,
              padding: '16px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <XCircle size={20} />
            Wrong
          </button>
          <button
            onClick={() => handleAnswer(true)}
            style={{
              flex: 1,
              padding: '16px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <CheckCircle size={20} />
            Correct
          </button>
        </div>
      )}
    </div>
  )
}