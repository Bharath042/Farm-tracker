import React from 'react'

export default function Navigation({ currentPage, onPageChange, isDarkMode, onThemeChange }) {
  const [showMobileMenu, setShowMobileMenu] = React.useState(false)
  const [showCategoryMenu, setShowCategoryMenu] = React.useState(false)

  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'expenses', label: 'Expenses', icon: '💰' },
  ]

  const categoryItems = [
    { id: 'subcategories', label: 'SubCategories', icon: '📦' },
    { id: 'categories', label: 'Categories', icon: '📁' },
  ]

  const moreItems = [
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'milestones', label: 'Milestones', icon: '🎯' },
  ]

  const handleNavClick = (id) => {
    onPageChange(id)
    setShowMobileMenu(false)
    setShowCategoryMenu(false)
  }

  return (
    <>
      {/* Navigation Bar - Desktop & Mobile */}
      <nav className="bg-white dark:bg-slate-900 shadow-md sticky top-0 z-50 border-b-2 border-emerald-200 dark:border-emerald-800 transition-colors duration-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo & Title */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌳</span>
              <h1 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 transition-colors duration-200">Farm Tracker</h1>
            </div>
            
            {/* Right: Navigation Items (Desktop) + Theme Toggle (All) */}
            <div className="flex gap-2 items-center">
              {/* Desktop Navigation */}
              <div className="hidden md:flex gap-1 items-center">
                {[...mainNavItems, { id: 'subcategories', label: 'SubCategories', icon: '📦' }, { id: 'categories', label: 'Categories', icon: '📁' }, ...moreItems].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentPage === item.id
                        ? 'bg-emerald-600 dark:bg-emerald-600 text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="mr-1">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
              
              {/* Theme Toggle Button - Visible on all screens */}
              <button
                onClick={() => onThemeChange(!isDarkMode)}
                className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation with Menu */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t-2 border-emerald-200 dark:border-emerald-800 shadow-lg transition-colors duration-200 z-50">
        <div className="flex items-center justify-between h-16 px-2">
          {/* Main navigation items - Dashboard, Expenses */}
          {mainNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-3 transition-colors flex-1 ${
                currentPage === item.id
                  ? 'text-emerald-600 dark:text-emerald-400 border-t-2 border-emerald-600 dark:border-emerald-400'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium leading-tight text-center">{item.label}</span>
            </button>
          ))}

          {/* Category/SubCategory combined button */}
          <div className="relative flex-1">
            <button
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-3 transition-colors w-full ${
                currentPage === 'categories' || currentPage === 'subcategories'
                  ? 'text-emerald-600 dark:text-emerald-400 border-t-2 border-emerald-600 dark:border-emerald-400'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <span className="text-xl">📂</span>
              <span className="text-xs font-medium leading-tight text-center">Manage</span>
            </button>

            {/* Category Popup Menu */}
            {showCategoryMenu && (
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-800 border-2 border-emerald-200 dark:border-emerald-800 rounded-lg shadow-lg transition-colors duration-200 w-48 z-50">
                {categoryItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-2 transition-colors ${
                      currentPage === item.id
                        ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* More button */}
          <div className="relative flex-1">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-3 transition-colors w-full ${
                currentPage === 'analytics' || currentPage === 'milestones'
                  ? 'text-emerald-600 dark:text-emerald-400 border-t-2 border-emerald-600 dark:border-emerald-400'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <span className="text-xl">⋯</span>
              <span className="text-xs font-medium leading-tight text-center">More</span>
            </button>

            {/* More Popup Menu */}
            {showMobileMenu && (
              <div className="absolute bottom-16 right-0 bg-white dark:bg-slate-800 border-2 border-emerald-200 dark:border-emerald-800 rounded-lg shadow-lg transition-colors duration-200 w-48 z-50">
                {moreItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-2 transition-colors ${
                      currentPage === item.id
                        ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
