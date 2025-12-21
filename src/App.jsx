import { useState, useEffect } from 'react'
import { initDB } from './db'
import Navigation from './components/Navigation'
import Dashboard from './pages/Dashboard'
import ExpenseTracker from './pages/ExpenseTracker'
import SubCategories from './pages/SubCategories'
import Categories from './pages/Categories'
import Analytics from './pages/Analytics'
import Milestones from './pages/Milestones'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [dbReady, setDbReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initDB()
        setDbReady(true)
      } catch (error) {
        console.error('Failed to initialize database:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeApp()
  }, [])

  // Save theme preference and apply to document
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing Farm Tracker...</p>
        </div>
      </div>
    )
  }

  if (!dbReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <p className="text-red-600">Failed to initialize database</p>
        </div>
      </div>
    )
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />
      case 'expenses':
        return <ExpenseTracker />
      case 'subcategories':
        return <SubCategories />
      case 'categories':
        return <Categories />
      case 'analytics':
        return <Analytics />
      case 'milestones':
        return <Milestones />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-200">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} isDarkMode={isDarkMode} onThemeChange={setIsDarkMode} />
      <main className="container mx-auto px-4 py-6 pb-28 md:pb-6">
        {renderPage()}
      </main>
    </div>
  )
}

export default App
