import React from 'react'

export default function Navigation({ currentPage, onPageChange, isDarkMode, onThemeChange }) {

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'expenses', label: 'Expenses', icon: '💰' },
    { id: 'categories', label: 'Categories', icon: '📁' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'milestones', label: 'Milestones', icon: '🏆' },
  ]

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-white dark:bg-slate-900 shadow-md sticky top-0 z-50 border-b-2 border-emerald-200 dark:border-emerald-800 transition-colors duration-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
          </div>
        </div>
      </nav>
    </>
  )
}
