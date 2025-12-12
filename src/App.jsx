import React, { useState } from 'react'
import { Home, BookOpen, Library, Settings } from 'lucide-react'
import Dashboard from './components/Dashboard'
import StudyScreen from './components/StudyScreen'
import WordsScreen from './components/WordsScreen'
import SettingsScreen from './components/SettingsScreen'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('home')

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard />
      case 'study':
        return <StudyScreen />
      case 'words':
        return <WordsScreen />
      case 'settings':
        return <SettingsScreen />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1 className="app-title">Vocab Alejomeek</h1>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {renderScreen()}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button
          className={`nav-button ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <Home size={24} />
          <span>Home</span>
        </button>

        <button
          className={`nav-button ${activeTab === 'study' ? 'active' : ''}`}
          onClick={() => setActiveTab('study')}
        >
          <BookOpen size={24} />
          <span>Study</span>
        </button>

        <button
          className={`nav-button ${activeTab === 'words' ? 'active' : ''}`}
          onClick={() => setActiveTab('words')}
        >
          <Library size={24} />
          <span>Words</span>
        </button>

        <button
          className={`nav-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={24} />
          <span>Settings</span>
        </button>
      </nav>
    </div>
  )
}

export default App