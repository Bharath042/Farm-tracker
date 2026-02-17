import React, { useState, useEffect } from 'react'
import { getExpenses, getCategories, getSubCategories } from '../db'
import { Pie, Bar, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export default function Analytics() {
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [subcategories, setSubCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const expensesData = await getExpenses()
      const categoriesData = await getCategories()
      const subcategoriesData = await getSubCategories()
      setExpenses(expensesData)
      setCategories(categoriesData)
      setSubCategories(subcategoriesData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getExpenseSubCategoryDistribution = (expense) => {
    let total = 0
    const distribution = {}

    // Debug: Log the expense structure to understand the issue
    console.log('Processing expense:', {
      id: expense.id,
      itemName: expense.itemName,
      subCategoryCostEntries: expense.subCategoryCostEntries,
      otherCosts: expense.otherCosts,
      labourEntries: expense.labourEntries,
      materialEntries: expense.materialEntries
    })

    // Labour entries → Labour subcategory
    let labourTotal = 0
    if (expense.labourEntries && Array.isArray(expense.labourEntries)) {
      expense.labourEntries.forEach((entry) => {
        const amount =
          parseFloat(entry.unitPrice || 0) * parseFloat(entry.quantity || 0)
        if (isNaN(amount) || amount <= 0) return
        labourTotal += amount
      })
    }
    if (labourTotal > 0) {
      const labourSubcat = subcategories.find(
        (sc) => sc.name && sc.name.toLowerCase() === 'labour'
      )
      if (labourSubcat) {
        distribution[labourSubcat.id] =
          (distribution[labourSubcat.id] || 0) + labourTotal
      }
      total += labourTotal
    }

    // Material entries → Materials subcategory
    let materialTotal = 0
    if (expense.materialEntries && Array.isArray(expense.materialEntries)) {
      expense.materialEntries.forEach((entry) => {
        const amount =
          parseFloat(entry.unitPrice || 0) * parseFloat(entry.quantity || 0)
        if (isNaN(amount) || amount <= 0) return
        materialTotal += amount
      })
    }
    if (materialTotal > 0) {
      const materialSubcat = subcategories.find(
        (sc) =>
          sc.name &&
          (sc.name.toLowerCase() === 'materials' ||
            sc.name.toLowerCase() === 'material')
      )
      if (materialSubcat) {
        distribution[materialSubcat.id] =
          (distribution[materialSubcat.id] || 0) + materialTotal
      }
      total += materialTotal
    }

    // Dynamic per-subcategory cost entries (Transport, Food, Others, etc.)
    let dynamicOtherTotal = 0
    const subMap = expense.subCategoryCostEntries || {}
    console.log('SubCategoryCostEntries map:', subMap)
    Object.entries(subMap).forEach(([subcatId, entries]) => {
      let subtotal = 0
      ;(entries || []).forEach((entry) => {
        const val = parseFloat(entry.amount || 0)
        if (isNaN(val) || val <= 0) return
        subtotal += val
      })
      if (subtotal > 0) {
        console.log(`Adding ${subtotal} to subcategory ${subcatId}`)
        distribution[subcatId] = (distribution[subcatId] || 0) + subtotal
        dynamicOtherTotal += subtotal
      }
    })
    total += dynamicOtherTotal

    // Plain otherCosts (fallback) → map to 'Others' subcategory
    const totalOtherCosts = parseFloat(expense.otherCosts || 0) || 0
    const plainOtherToAssign =
      dynamicOtherTotal > 0
        ? Math.max(totalOtherCosts - dynamicOtherTotal, 0)
        : totalOtherCosts

    if (plainOtherToAssign > 0) {
      const othersSubcat = subcategories.find(
        (sc) => sc.name && sc.name.toLowerCase() === 'others'
      )
      if (othersSubcat) {
        distribution[othersSubcat.id] =
          (distribution[othersSubcat.id] || 0) + plainOtherToAssign
      }
      total += plainOtherToAssign
    }

    console.log('Final distribution for this expense:', distribution)
    return { total, distribution }
  }

  const calculateAmount = (expense) => {
    const { total } = getExpenseSubCategoryDistribution(expense)
    return total
  }

  const getCategoryWiseTotal = () => {
    const totals = {}
    expenses.forEach((expense) => {
      const categoryName = expense.categoryName || 'Unknown'
      totals[categoryName] = (totals[categoryName] || 0) + calculateAmount(expense)
    })
    return totals
  }

  const getSubCategoryWiseTotal = () => {
    const totals = {}
    expenses.forEach((expense) => {
      const { distribution } = getExpenseSubCategoryDistribution(expense)
      Object.entries(distribution).forEach(([subcatId, amount]) => {
        const subcat = subcategories.find((sc) => sc.id === subcatId)
        if (!subcat) return
        totals[subcat.name] = (totals[subcat.name] || 0) + amount
      })
    })
    return totals
  }

  const getCategorySubCategoryTotals = () => {
    const map = {}
    expenses.forEach((expense) => {
      const category = categories.find((c) => c.id === expense.category)
      const categoryName = category?.name || expense.categoryName || 'Unknown'

      const { distribution } = getExpenseSubCategoryDistribution(expense)
      Object.entries(distribution).forEach(([subcatId, amount]) => {
        const subcat = subcategories.find((sc) => sc.id === subcatId)
        if (!subcat) return

        const subcatName = subcat.name
        if (!map[categoryName]) {
          map[categoryName] = {}
        }
        map[categoryName][subcatName] =
          (map[categoryName][subcatName] || 0) + amount
      })
    })
    return map
  }

  const getMonthlyTotal = () => {
    const totals = {}
    expenses.forEach((expense) => {
      const date = new Date(expense.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      totals[monthKey] = (totals[monthKey] || 0) + calculateAmount(expense)
    })
    return totals
  }

  const categoryWiseTotals = getCategoryWiseTotal()
  const subCategoryWiseTotals = getSubCategoryWiseTotal()
  const categorySubCategoryTotals = getCategorySubCategoryTotals()
  const monthlyTotals = getMonthlyTotal()
  const totalExpenses = expenses.reduce((sum, exp) => sum + calculateAmount(exp), 0)
  const averageExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0

  // Pie Chart Data
  const pieChartData = {
    labels: Object.keys(categoryWiseTotals),
    datasets: [
      {
        label: 'Expenses by Category',
        data: Object.values(categoryWiseTotals),
        backgroundColor: [
          '#10b981',
          '#3b82f6',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#ec4899',
          '#14b8a6',
          '#f97316',
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  }

  // Bar Chart Data
  const barChartData = {
    labels: Object.keys(categoryWiseTotals),
    datasets: [
      {
        label: 'Total Amount (₹)',
        data: Object.values(categoryWiseTotals),
        backgroundColor: '#10b981',
        borderColor: '#059669',
        borderWidth: 1,
      },
    ],
  }

  const subCategoryLabels = Object.keys(subCategoryWiseTotals)
  const subCategoryValues = Object.values(subCategoryWiseTotals)

  const subCategoryPieData = {
    labels: subCategoryLabels,
    datasets: [
      {
        label: 'Expenses by SubCategory',
        data: subCategoryValues,
        backgroundColor: [
          '#10b981',
          '#3b82f6',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#ec4899',
          '#14b8a6',
          '#f97316',
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  }

  const subCategoryBarData = {
    labels: subCategoryLabels,
    datasets: [
      {
        label: 'Total Amount (₹)',
        data: subCategoryValues,
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        borderWidth: 1,
      },
    ],
  }

  // Line Chart Data
  const sortedMonths = Object.keys(monthlyTotals).sort()
  const lineChartData = {
    labels: sortedMonths.map((month) => {
      const [year, monthNum] = month.split('-')
      const date = new Date(year, monthNum - 1)
      return date.toLocaleDateString('en-IN', { year: '2-digit', month: 'short' })
    }),
    datasets: [
      {
        label: 'Monthly Expenses (₹)',
        data: sortedMonths.map((month) => monthlyTotals[month]),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // Horizontal bars for better mobile view
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      y: {
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  }

  useEffect(() => {
    if (loading) return
    const hash = window.location.hash
    if (!hash || !hash.startsWith('#analytics-')) return
    const id = hash.slice(1)
    const element = document.getElementById(id)
    if (element) {
      const yOffset = -96 // offset for sticky navbar height
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }, [loading])

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>
  }

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500 mb-4">No expenses recorded yet. Add some expenses to see analytics!</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-20 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b-2 border-emerald-200 dark:border-emerald-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white transition-colors duration-200">Analytics & Reports</h1>
          <p className="text-emerald-700 dark:text-emerald-400 mt-2 font-medium transition-colors duration-200">Detailed expense analysis and insights</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-8">

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border-l-4 border-emerald-500 dark:border-emerald-600 transition-colors duration-200">
          <p className="text-emerald-700 dark:text-emerald-400 text-sm font-bold uppercase transition-colors duration-200">Total Expenses</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2 transition-colors duration-200">₹{totalExpenses.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border-l-4 border-blue-500 dark:border-blue-600 transition-colors duration-200">
          <p className="text-blue-700 dark:text-blue-400 text-sm font-bold uppercase transition-colors duration-200">Number of Entries</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2 transition-colors duration-200">{expenses.length}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border-l-4 border-amber-500 dark:border-amber-600 transition-colors duration-200">
          <p className="text-amber-700 dark:text-amber-400 text-sm font-bold uppercase transition-colors duration-200">Average per Entry</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2 transition-colors duration-200">₹{averageExpense.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border-l-4 border-teal-500 dark:border-teal-600 transition-colors duration-200">
          <p className="text-teal-700 dark:text-teal-400 text-sm font-bold uppercase transition-colors duration-200">Categories Used</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2 transition-colors duration-200">{Object.keys(categoryWiseTotals).length}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-6 transition-colors duration-200">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 transition-colors duration-200">Expenses by Category</h3>
          <div className="flex justify-center">
            <div style={{ width: '100%', maxWidth: '300px', height: '300px' }}>
              <Pie data={pieChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-6 transition-colors duration-200">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 transition-colors duration-200">Category Breakdown</h3>
          <div style={{ height: '400px', width: '100%', minWidth: 0 }}>
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* SubCategory Pie Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-6 transition-colors duration-200">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 transition-colors duration-200">Expenses by SubCategory</h3>
          {Object.keys(subCategoryWiseTotals).length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-10 transition-colors duration-200">
              No subcategory data available yet.
            </p>
          ) : (
            <div className="flex justify-center">
              <div style={{ width: '100%', maxWidth: '300px', height: '300px' }}>
                <Pie data={subCategoryPieData} options={chartOptions} />
              </div>
            </div>
          )}
        </div>

        {/* SubCategory Bar Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-6 transition-colors duration-200">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 transition-colors duration-200">SubCategory Breakdown</h3>
          {Object.keys(subCategoryWiseTotals).length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-10 transition-colors duration-200">
              No subcategory data available yet.
            </p>
          ) : (
            <div style={{ height: '400px', width: '100%', minWidth: 0 }}>
              <Bar data={subCategoryBarData} options={barChartOptions} />
            </div>
          )}
        </div>
      </div>

      {/* Cost by Category - Detailed Cards */}
      <div
        id="analytics-category"
        className="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-6 transition-colors duration-200"
      >
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 transition-colors duration-200">Cost by Category</h3>
        {Object.keys(categoryWiseTotals).length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500 dark:text-slate-400 transition-colors duration-200">No category data available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(categoryWiseTotals)
              .sort((a, b) => b[1] - a[1])
              .map(([categoryName, cost], index) => {
                const percentage = totalExpenses > 0 ? ((cost / totalExpenses) * 100).toFixed(1) : '0.0'
                const subCategoryMap = categorySubCategoryTotals[categoryName] || {}
                const subCategoryEntries = Object.entries(subCategoryMap).sort((a, b) => b[1] - a[1])

                const colorSchemes = [
                  { border: 'border-emerald-200', bg: 'bg-emerald-50', bar: 'bg-emerald-500', text: 'text-emerald-700' },
                  { border: 'border-blue-200', bg: 'bg-blue-50', bar: 'bg-blue-500', text: 'text-blue-700' },
                  { border: 'border-amber-200', bg: 'bg-amber-50', bar: 'bg-amber-500', text: 'text-amber-700' },
                  { border: 'border-teal-200', bg: 'bg-teal-50', bar: 'bg-teal-500', text: 'text-teal-700' },
                  { border: 'border-cyan-200', bg: 'bg-cyan-50', bar: 'bg-cyan-500', text: 'text-cyan-700' },
                  { border: 'border-rose-200', bg: 'bg-rose-50', bar: 'bg-rose-500', text: 'text-rose-700' },
                ]
                const scheme = colorSchemes[index % colorSchemes.length]

                return (
                  <div
                    key={categoryName}
                    className={`${scheme.bg} dark:bg-slate-800 rounded-lg p-6 border-2 ${scheme.border} dark:border-slate-700 hover:shadow-md transition-all duration-200`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-slate-900 dark:text-white transition-colors duration-200">{categoryName}</h4>
                      <span
                        className={`text-xs font-bold ${scheme.text} dark:text-slate-300 bg-white dark:bg-slate-700 px-2 py-1 rounded border-2 ${scheme.border} dark:border-slate-600 transition-colors duration-200`}
                      >
                        {percentage}%
                      </span>
                    </div>
                    <p className={`text-3xl font-bold ${scheme.text} dark:text-slate-300 mb-4 transition-colors duration-200`}>
                      ₹{cost.toLocaleString('en-IN')}
                    </p>
                    <div className="h-2 bg-white dark:bg-slate-700 rounded-full overflow-hidden border border-slate-200 dark:border-slate-600 transition-colors duration-200">
                      <div
                        className={`h-full ${scheme.bar} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    {subCategoryEntries.length > 0 && (
                      <div className="mt-4 space-y-1">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 transition-colors duration-200">
                          SubCategory split-up:
                        </p>
                        {subCategoryEntries.slice(0, 3).map(([subName, subCost]) => {
                          const subPercentage = cost > 0 ? ((subCost / cost) * 100).toFixed(1) : '0.0'
                          return (
                            <div
                              key={subName}
                              className="flex justify-between text-xs text-slate-700 dark:text-slate-300 transition-colors duration-200"
                            >
                              <span>{subName}</span>
                              <span>
                                ₹{subCost.toLocaleString('en-IN')} ({subPercentage}%)
                              </span>
                            </div>
                          )
                        })}
                        {subCategoryEntries.length > 3 && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors duration-200">
                            + {subCategoryEntries.length - 3} more
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        )}
      </div>

      {/* Cost by SubCategory - Detailed Cards */}
      <div
        id="analytics-subcategory"
        className="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-6 transition-colors duration-200"
      >
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 transition-colors duration-200">Cost by SubCategory</h3>
        {Object.keys(subCategoryWiseTotals).length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500 dark:text-slate-400 transition-colors duration-200">
              No subcategories data available. Create subcategories and assign them to categories to see details here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(subCategoryWiseTotals)
              .sort((a, b) => b[1] - a[1])
              .map(([subcategory, total], index) => {
                const percentage = totalExpenses > 0 ? ((total / totalExpenses) * 100).toFixed(1) : '0.0'

                const colorSchemes = [
                  { border: 'border-emerald-200', bg: 'bg-emerald-50', bar: 'bg-emerald-500', text: 'text-emerald-700' },
                  { border: 'border-blue-200', bg: 'bg-blue-50', bar: 'bg-blue-500', text: 'text-blue-700' },
                  { border: 'border-amber-200', bg: 'bg-amber-50', bar: 'bg-amber-500', text: 'text-amber-700' },
                  { border: 'border-teal-200', bg: 'bg-teal-50', bar: 'bg-teal-500', text: 'text-teal-700' },
                  { border: 'border-cyan-200', bg: 'bg-cyan-50', bar: 'bg-cyan-500', text: 'text-cyan-700' },
                  { border: 'border-rose-200', bg: 'bg-rose-50', bar: 'bg-rose-500', text: 'text-rose-700' },
                ]
                const scheme = colorSchemes[index % colorSchemes.length]

                return (
                  <div
                    key={subcategory}
                    className={`${scheme.bg} dark:bg-slate-800 rounded-lg p-6 border-2 ${scheme.border} dark:border-slate-700 hover:shadow-md transition-all duration-200`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-slate-900 dark:text-white transition-colors duration-200">{subcategory}</h4>
                      <span
                        className={`text-xs font-bold ${scheme.text} dark:text-slate-300 bg-white dark:bg-slate-700 px-2 py-1 rounded border-2 ${scheme.border} dark:border-slate-600 transition-colors duration-200`}
                      >
                        {percentage}%
                      </span>
                    </div>
                    <p className={`text-3xl font-bold ${scheme.text} dark:text-slate-300 mb-4 transition-colors duration-200`}>
                      ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                    <div className="h-2 bg-white dark:bg-slate-700 rounded-full overflow-hidden border border-slate-200 dark:border-slate-600 transition-colors duration-200">
                      <div
                        className={`h-full ${scheme.bar} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
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
