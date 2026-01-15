import { useState, useEffect } from 'react'
import { initDB } from './db'
import Navigation from './components/Navigation'
import Dashboard from './pages/Dashboard'
import ExpenseTracker from './pages/ExpenseTracker'
import SubCategories from './pages/SubCategories'
import Categories from './pages/Categories'
import Analytics from './pages/Analytics'
import Milestones from './pages/Milestones'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { getAuthInstance } from './firebase'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [dbReady, setDbReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [authMode, setAuthMode] = useState('signin')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')
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

  useEffect(() => {
    if (!dbReady) return
    const auth = getAuthInstance()
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setAuthLoading(false)
    })
    return () => unsubscribe()
  }, [dbReady])

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

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking sign-in...</p>
        </div>
      </div>
    )
  }

  const handleAuthSubmit = async (e) => {
    e.preventDefault()
    setAuthError('')

    const email = authEmail.trim()
    const password = authPassword
    if (!email || !password) {
      setAuthError('Email and password are required')
      return
    }

    try {
      const auth = getAuthInstance()
      if (authMode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      setAuthPassword('')
    } catch (error) {
      setAuthError(error?.message || 'Authentication failed')
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(getAuthInstance())
      setCurrentPage('dashboard')
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 transition-colors duration-200 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🌳</span>
            <h1 className="text-xl font-bold text-emerald-700 dark:text-emerald-400">Farm Tracker</h1>
          </div>

          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            {authMode === 'signup' ? 'Create account' : 'Sign in'}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Your data will sync across devices.
          </p>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Password</label>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {authError && (
              <div className="text-sm text-red-600">{authError}</div>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              {authMode === 'signup' ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <div className="mt-4 text-sm text-slate-700 dark:text-slate-300">
            {authMode === 'signup' ? (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin')
                  setAuthError('')
                }}
                className="text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                Already have an account? Sign in
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup')
                  setAuthError('')
                }}
                className="text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                New here? Create an account
              </button>
            )}
          </div>
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
      <Navigation
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isDarkMode={isDarkMode}
        onThemeChange={setIsDarkMode}
        userEmail={user.email || ''}
        onSignOut={handleSignOut}
      />
      <main className="container mx-auto px-4 py-6 pb-28 md:pb-6">
        {renderPage()}
      </main>
    </div>
  )
}

export default App
