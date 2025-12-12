import React, { useState, useEffect } from 'react'
import { useStudy } from '../../hooks/useStudy'
import { useWords } from '../../hooks/useWords'

export default function MultipleChoiceMode({ onComplete }) {
  const { currentWord, submitAnswer, nextWord, getSessionProgress, isLastWord, endSession, studySession } = useStudy()
  const { words } = useWords()
  const [questionType, setQuestionType] = useState('translation') // 'translation' or 'definition'
  const [options, setOptions] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const progress = getSessionProgress()

  useEffect(() => {
    if (currentWord && words.length > 0) {
      // Alternar entre preguntar traducción y definición
      const type = Math.random() > 0.5 ? 'translation' : 'definition'
      setQuestionType(type)
      
      // Generar 4 opciones (1 correcta + 3 incorrectas)
      const correctAnswer = type === 'translation' ? currentWord.traduccion : currentWord.significado
      
      // Obtener 3 respuestas incorrectas aleatorias
      const otherWords = words
        .filter(w => w.id !== currentWord.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
      
      const incorrectAnswers = otherWords.map(w => 
        type === 'translation' ? w.traduccion : w.significado
      )
      
      // Mezclar opciones
      const allOptions = [correctAnswer, ...incorrectAnswers]
        .sort(() => Math.random() - 0.5)
        .map((opt, idx) => ({ id: idx, text: opt, isCorrect: opt === correctAnswer }))
      
      setOptions(allOptions)
      setSelectedOption(null)
      setShowResult(false)
    }
  }, [currentWord, words, studySession])

  const handleSelectOption = (option) => {
    if (showResult) return
    
    setSelectedOption(option)
    setShowResult(true)
    
    setTimeout(async () => {
      await submitAnswer(option.isCorrect)
      
      if (isLastWord()) {
        const summary = endSession()
        alert(`Session complete! ${summary.correct}/${summary.totalWords} correct (${summary.accuracy}%)`)
        onComplete()
      } else {
        nextWord()
      }
    }, 1500)
  }

  if (!currentWord) return <div className="container">No words available</div>

  const getOptionStyle = (option) => {
    const baseStyle = {
      width: '100%',
      padding: '16px',
      background: 'white',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      fontSize: '16px',
      textAlign: 'left',
      cursor: showResult ? 'default' : 'pointer',
      transition: 'all 0.2s',
      marginBottom: '12px'
    }

    if (!showResult) {
      return {
        ...baseStyle,
        ':hover': { borderColor: '#1e3a8a', transform: 'translateX(4px)' }
      }
    }

    if (option.id === selectedOption?.id) {
      return {
        ...baseStyle,
        background: option.isCorrect ? '#dcfce7' : '#fee2e2',
        borderColor: option.isCorrect ? '#10b981' : '#ef4444',
        fontWeight: '600'
      }
    }

    if (option.isCorrect && showResult) {
      return {
        ...baseStyle,
        background: '#dcfce7',
        borderColor: '#10b981',
        fontWeight: '600'
      }
    }

    return { ...baseStyle, opacity: 0.5 }
  }

  return (
    <div className="container-sm" style={{ paddingTop: '40px' }}>
      <div style={{ marginBottom: '20px', textAlign: 'center', color: '#6b7280' }}>
        {progress?.current} / {progress?.total}
      </div>

      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '24px',
        textAlign: 'center',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px', fontWeight: '600' }}>
          {questionType === 'translation' 
            ? '¿Qué significa esta palabra?' 
            : 'Which definition matches?'}
        </p>
        <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#1e3a8a' }}>
          {currentWord.palabra}
        </h2>
      </div>

      <div>
        {options.map(option => (
          <button
            key={option.id}
            onClick={() => handleSelectOption(option)}
            style={getOptionStyle(option)}
            disabled={showResult}
          >
            {option.text}
            {showResult && option.isCorrect && ' ✓'}
            {showResult && !option.isCorrect && option.id === selectedOption?.id && ' ✗'}
          </button>
        ))}
      </div>

      {showResult && (
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: selectedOption?.isCorrect ? '#dcfce7' : '#fee2e2',
          borderRadius: '12px',
          textAlign: 'center',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <p style={{ 
            fontSize: '16px', 
            fontWeight: '600',
            color: selectedOption?.isCorrect ? '#10b981' : '#ef4444'
          }}>
            {selectedOption?.isCorrect ? '¡Correcto! 🎉' : 'Incorrecto 😔'}
          </p>
          {!selectedOption?.isCorrect && (
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
              "{currentWord.ejemplo}"
            </p>
          )}
        </div>
      )}
    </div>
  )
}