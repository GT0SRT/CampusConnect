import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'
import App from './App.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

try {
  const root = document.getElementById('root')
  if (!root) {
    throw new Error('Root element not found in DOM')
  }

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
} catch (error) {
  console.error('Fatal error during app initialization:', error)
  document.body.innerHTML = `<div style="color: red; padding: 20px; font-family: monospace;">
    <strong>Failed to initialize app:</strong><br/>
    ${error.message}<br/>
    Check console for details.
  </div>`
}
