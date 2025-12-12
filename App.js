import React from 'react'
import TestConnection from './TestConnection'

/**
 * TEMPORAL: App con componente de prueba
 * Una vez verificado que Supabase y Claude funcionan:
 * 1. Elimina TestConnection.jsx
 * 2. Restaura este archivo a su versión original con navegación
 */
function App() {
  return (
    <div className="app">
      <TestConnection />
    </div>
  )
}

export default App