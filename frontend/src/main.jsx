import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './config/queryClient'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'
import App from './App.jsx'

// Log initialization for debugging
console.log('[Init] Starting app initialization...')
console.log('[Init] Environment:', import.meta.env.MODE)
console.log('[Init] Firebase API Key:', import.meta.env.VITE_API_KEY ? 'Loaded ✓' : 'MISSING ✗')

try {
  const root = document.getElementById('root')
  if (!root) {
    throw new Error('Root element not found in DOM')
  }
  console.log('[Init] Root element found ✓')

  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>,
  )
  console.log('[Init] React app mounted successfully ✓')
} catch (error) {
  console.error('[Init] Fatal error during app initialization:', error)
  document.body.innerHTML = `<div style="color: red; padding: 20px; font-family: monospace;">
    <strong>Failed to initialize app:</strong><br/>
    ${error.message}<br/>
    Check console for details.
  </div>`
}
