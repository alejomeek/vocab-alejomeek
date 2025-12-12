import React from 'react'
import { Info, Database, Download } from 'lucide-react'

export default function SettingsScreen() {
  const handleExport = async () => {
    // Placeholder para export
    alert('Export feature coming soon!')
  }

  return (
    <div className="container">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Settings</h2>
        
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Database size={24} color="#1e3a8a" />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Daily Practice</h3>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Words per session: 10</p>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
          <button
            onClick={handleExport}
            style={{
              width: '100%',
              padding: '16px',
              background: '#1e3a8a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <Download size={20} />
            Export Vocabulary
          </button>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Info size={24} color="#6b7280" />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>About</h3>
              <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Vocab Alejomeek v1.0</p>
              <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>Built with React, Supabase & Claude AI</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}