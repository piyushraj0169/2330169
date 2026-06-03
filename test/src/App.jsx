import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import ErrorBoundary from './components/ErrorBoundary'
import './styles/styles.css'

// App root uses semantic main landmarks for better accessibility.
function App() {
  return (
    <ErrorBoundary>
      <div className="app-shell">
        <Header />
        <main className="app-main">
          <Dashboard />
        </main>
      </div>
    </ErrorBoundary>
  )
}

export default App
