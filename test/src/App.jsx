import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import './styles/styles.css'

// App root uses semantic main landmarks for better accessibility.
function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <Dashboard />
      </main>
    </div>
  )
}

export default App
