import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'
import App from './App.jsx'

try {
  const root = document.getElementById('root')
  if (!root) {
    throw new Error('Root element not found in DOM')
  }

  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ErrorBoundary>
    </StrictMode>,
  )
} catch (error) {
  console.error('Fatal error during app initialization:', error)
  document.body.innerHTML = `<div style="color: red; padding: 20px; font-family: monospace;">
    <strong>Failed to initialize app:</strong><br/>
    ${error.message}<br/>
    Check console for details.
  </div>`
}
