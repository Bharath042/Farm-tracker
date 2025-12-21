import React, { useState, useEffect } from 'react'
import { getExpenses, getCategories, getFarmData, getSubCategories } from '../db'

export default function Dashboard({ onNavigate }) {
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [expenseCount, setExpenseCount] = useState(0)
  const [categoryCount, setCategoryCount] = useState(0)
  const [subCategoryCount, setSubCategoryCount] = useState(0)
  const [recentExpenses, setRecentExpenses] = useState([])
  const [farmData, setFarmData] = useState({})
  const [totalLabour, setTotalLabour] = useState(0)
  const [totalMaterials, setTotalMaterials] = useState(0)
  const [loading, setLoading] = useState(true)
  const [animatedValues, setAnimatedValues] = useState({
    expenses: 0,
    labour: 0,
    materials: 0,
  })

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const expenses = await getExpenses()
        const categoriesData = await getCategories()
        const subcategoriesData = await getSubCategories()
        const farm = await getFarmData()

        setFarmData(farm)
        setCategoryCount(categoriesData.length)
        setSubCategoryCount(subcategoriesData.length)
        setExpenseCount(expenses.length)

        let labour = 0
        let materials = 0
        let other = 0

        expenses.forEach((exp) => {
          let expenseTotal = 0

          if (exp.labourEntries && Array.isArray(exp.labourEntries)) {
            exp.labourEntries.forEach((entry) => {
              const cost = parseFloat(entry.unitPrice || 0) * parseFloat(entry.quantity || 0)
              labour += cost
              expenseTotal += cost
            })
          }
          if (exp.materialEntries && Array.isArray(exp.materialEntries)) {
            exp.materialEntries.forEach((entry) => {
              const cost = parseFloat(entry.unitPrice || 0) * parseFloat(entry.quantity || 0)
              materials += cost
              expenseTotal += cost
            })
          }
          if (exp.otherCosts) {
            const cost = parseFloat(exp.otherCosts)
            other += cost
            expenseTotal += cost
          }
        })

        const total = labour + materials + other
        setTotalExpenses(total)
        setTotalLabour(labour)
        setTotalMaterials(materials)

        animateValues(total, labour, materials)

        const recent = expenses
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5)
        setRecentExpenses(recent)
      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const animateValues = (total, labour, materials) => {
    let frame = 0
    const maxFrames = 30
    const interval = setInterval(() => {
      frame++
      const progress = frame / maxFrames
      setAnimatedValues({
        expenses: Math.floor(total * progress),
        labour: Math.floor(labour * progress),
        materials: Math.floor(materials * progress),
      })
      if (frame >= maxFrames) clearInterval(interval)
    }, 20)
  }

  const handleViewCategoryAnalytics = () => {
    if (!onNavigate) return
    window.location.hash = '#analytics-category'
    onNavigate('analytics')
  }

  const handleViewSubCategoryAnalytics = () => {
    if (!onNavigate) return
    window.location.hash = '#analytics-subcategory'
    onNavigate('analytics')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-emerald-300 border-t-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-20 bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b-2 border-emerald-200 dark:border-emerald-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white transition-colors duration-200">Dashboard</h1>
          <p className="text-emerald-700 dark:text-emerald-400 mt-2 font-medium transition-colors duration-200">Farm expense overview and analytics</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Primary Metrics - 3 Column */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Expenses */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 p-8 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-lg transition-all duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide transition-colors duration-200">Total Expenses</p>
                <p className="text-4xl font-bold text-slate-900 dark:text-white mt-4 transition-colors duration-200">₹{animatedValues.expenses.toLocaleString('en-IN')}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 transition-colors duration-200">{expenseCount} transactions</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-lg">💰</div>
            </div>
          </div>

          {/* Labour Cost */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-amber-200 dark:border-amber-800 p-8 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-lg transition-all duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide transition-colors duration-200">Labour Cost</p>
                <p className="text-4xl font-bold text-slate-900 dark:text-white mt-4 transition-colors duration-200">₹{animatedValues.labour.toLocaleString('en-IN')}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 transition-colors duration-200">{((animatedValues.labour / animatedValues.expenses) * 100 || 0).toFixed(0)}% of total</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-lg">👷</div>
            </div>
          </div>

          {/* Materials Cost */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-blue-200 dark:border-blue-800 p-8 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide transition-colors duration-200">Materials Cost</p>
                <p className="text-4xl font-bold text-slate-900 dark:text-white mt-4 transition-colors duration-200">₹{animatedValues.materials.toLocaleString('en-IN')}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 transition-colors duration-200">{((animatedValues.materials / animatedValues.expenses) * 100 || 0).toFixed(0)}% of total</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-lg">📦</div>
            </div>
          </div>
        </div>

        {/* Secondary Metrics - 5 Column */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-emerald-100 dark:border-emerald-800 p-6 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors">
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide transition-colors duration-200">Entries</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-3 transition-colors duration-200">{expenseCount}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-blue-100 dark:border-blue-800 p-6 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
            <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide transition-colors duration-200">Categories</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-3 transition-colors duration-200">{categoryCount}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-violet-100 dark:border-violet-800 p-6 hover:border-violet-300 dark:hover:border-violet-600 transition-colors">
            <p className="text-xs font-bold text-violet-700 dark:text-violet-400 uppercase tracking-wide transition-colors duration-200">SubCategories</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-3 transition-colors duration-200">{subCategoryCount}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-amber-100 dark:border-amber-800 p-6 hover:border-amber-300 dark:hover:border-amber-600 transition-colors">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide transition-colors duration-200">Avg Entry</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-3 transition-colors duration-200">₹{expenseCount > 0 ? Math.floor(totalExpenses / expenseCount).toLocaleString('en-IN') : 0}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-teal-100 dark:border-teal-800 p-6 hover:border-teal-300 dark:hover:border-teal-600 transition-colors">
            <p className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wide transition-colors duration-200">Other Costs</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-3 transition-colors duration-200">₹{(totalExpenses - totalLabour - totalMaterials).toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Detailed Analytics Links */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-8 transition-colors duration-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 transition-colors duration-200">Detailed Analytics</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-200">
                View full cost breakdowns by category and subcategory on the Analytics page.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleViewCategoryAnalytics}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-colors duration-200"
              >
                View Cost by Category
              </button>
              <button
                type="button"
                onClick={handleViewSubCategoryAnalytics}
                className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold shadow-sm transition-colors duration-200"
              >
                View Cost by SubCategory
              </button>
            </div>
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-8 transition-colors duration-200">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 transition-colors duration-200">Recent Expenses</h2>
          {recentExpenses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No expenses recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentExpenses.map((expense, idx) => {
                let amount = 0
                if (expense.labourEntries && Array.isArray(expense.labourEntries)) {
                  expense.labourEntries.forEach((entry) => {
                    amount += parseFloat(entry.unitPrice || 0) * parseFloat(entry.quantity || 0)
                  })
                }
                if (expense.materialEntries && Array.isArray(expense.materialEntries)) {
                  expense.materialEntries.forEach((entry) => {
                    amount += parseFloat(entry.unitPrice || 0) * parseFloat(entry.quantity || 0)
                  })
                }
                if (expense.otherCosts) {
                  amount += parseFloat(expense.otherCosts)
                }

                const categoryName = expense.categoryName || 'Unknown'
                const borderColors = ['border-emerald-200', 'border-blue-200', 'border-amber-200', 'border-teal-200', 'border-cyan-200']
                const borderColor = borderColors[idx % borderColors.length]

                return (
                  <div
                    key={expense.id}
                    className={`flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border-l-4 ${borderColor} hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors duration-200`}
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white transition-colors duration-200">{categoryName}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 transition-colors duration-200">
                        {new Date(expense.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 dark:text-white transition-colors duration-200">₹{amount.toLocaleString('en-IN')}</p>
                      {expense.itemName && <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 transition-colors duration-200">{expense.itemName}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
