import React, { useState, useEffect } from 'react'
import { getExpenses, getCategories, getFarmData } from '../db'

export default function Dashboard() {
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [expenseCount, setExpenseCount] = useState(0)
  const [categoryCount, setCategoryCount] = useState(0)
  const [recentExpenses, setRecentExpenses] = useState([])
  const [farmData, setFarmData] = useState({})
  const [totalLabour, setTotalLabour] = useState(0)
  const [totalMaterials, setTotalMaterials] = useState(0)
  const [categoryCosts, setCategoryCosts] = useState({})
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const expenses = await getExpenses()
        const categoriesData = await getCategories()
        const farm = await getFarmData()

        setFarmData(farm)
        setCategories(categoriesData)
        setCategoryCount(categoriesData.length)
        setExpenseCount(expenses.length)

        // Calculate labour, materials, and other costs
        let labour = 0
        let materials = 0
        let other = 0
        const costByCategory = {}

        expenses.forEach((exp) => {
          let expenseTotal = 0

          // Labour entries
          if (exp.labourEntries && Array.isArray(exp.labourEntries)) {
            exp.labourEntries.forEach((entry) => {
              const cost = parseFloat(entry.unitPrice || 0) * parseFloat(entry.quantity || 0)
              labour += cost
              expenseTotal += cost
            })
          }
          // Material entries
          if (exp.materialEntries && Array.isArray(exp.materialEntries)) {
            exp.materialEntries.forEach((entry) => {
              const cost = parseFloat(entry.unitPrice || 0) * parseFloat(entry.quantity || 0)
              materials += cost
              expenseTotal += cost
            })
          }
          // Other costs
          if (exp.otherCosts) {
            const cost = parseFloat(exp.otherCosts)
            other += cost
            expenseTotal += cost
          }

          // Add to category total
          if (exp.category) {
            costByCategory[exp.category] = (costByCategory[exp.category] || 0) + expenseTotal
          }
        })

        const total = labour + materials + other
        setTotalExpenses(total)
        setTotalLabour(labour)
        setTotalMaterials(materials)
        setCategoryCosts(costByCategory)

        // Get recent 5 expenses
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

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome to Farm Tracker 🌳
        </h2>
        {farmData.farmName && (
          <p className="text-gray-600">
            Farm: <span className="font-semibold">{farmData.farmName}</span>
            {farmData.location && ` • Location: ${farmData.location}`}
          </p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Expenses</p>
              <p className="text-3xl font-bold text-green-600">₹{totalExpenses.toLocaleString('en-IN')}</p>
            </div>
            <span className="text-4xl">💰</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Labour Cost</p>
              <p className="text-3xl font-bold text-orange-600">₹{totalLabour.toLocaleString('en-IN')}</p>
            </div>
            <span className="text-4xl">👷</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Materials Cost</p>
              <p className="text-3xl font-bold text-purple-600">₹{totalMaterials.toLocaleString('en-IN')}</p>
            </div>
            <span className="text-4xl">📦</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Categories</p>
              <p className="text-3xl font-bold text-blue-600">{categoryCount}</p>
            </div>
            <span className="text-4xl">🏷️</span>
          </div>
        </div>
      </div>

      {/* Cost by Category */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Cost by Category</h3>
        {Object.keys(categoryCosts).length === 0 ? (
          <p className="text-gray-500 text-center py-8">No expenses recorded yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(categoryCosts)
              .sort((a, b) => b[1] - a[1])
              .map(([categoryId, cost]) => {
                const category = categories.find((c) => c.id === categoryId)
                const categoryName = category?.name || 'Unknown'
                const percentage = ((cost / totalExpenses) * 100).toFixed(1)

                return (
                  <div key={categoryId} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-800">{categoryName}</h4>
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                        {percentage}%
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">₹{cost.toLocaleString('en-IN')}</p>
                    <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>

      {/* Recent Expenses */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Expenses</h3>
        {recentExpenses.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No expenses recorded yet. Start by adding an expense!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Item</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentExpenses.map((expense) => {
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
                  return (
                    <tr key={expense.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(expense.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{expense.itemName || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{categoryName}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                        ₹{amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
