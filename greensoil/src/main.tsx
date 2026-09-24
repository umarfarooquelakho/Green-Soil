import { StrictMode, Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// ── Error boundary to show crash details instead of blank screen ──
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App crashed:', error, info)
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          fontFamily: 'monospace', padding: '40px', maxWidth: '900px', margin: '0 auto',
          background: '#fff1f2', minHeight: '100vh',
        }}>
          <div style={{ background: '#ef4444', color: '#fff', padding: '16px 24px', borderRadius: '12px', marginBottom: '24px' }}>
            <h1 style={{ margin: 0, fontSize: '18px' }}>⚠ App crashed — error details below</h1>
          </div>
          <pre style={{
            background: '#1e293b', color: '#f8fafc', padding: '24px',
            borderRadius: '12px', overflow: 'auto', fontSize: '13px', lineHeight: '1.6',
          }}>
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
          <p style={{ color: '#64748b', marginTop: '16px', fontSize: '14px' }}>
            Copy the error above and share it — it will identify the exact problem.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '12px', background: '#16a34a', color: '#fff',
              border: 'none', padding: '10px 24px', borderRadius: '8px',
              cursor: 'pointer', fontSize: '14px',
            }}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
