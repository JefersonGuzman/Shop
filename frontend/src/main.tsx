import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Settings from './pages/Settings.tsx'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <div style={{ padding: 12 }}>
        <nav style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <Link to="/">Chat</Link>
          <Link to="/settings">Configuración IA</Link>
        </nav>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </BrowserRouter>
  </StrictMode>,
)
