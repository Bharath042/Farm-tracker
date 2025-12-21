import React, { useState, useEffect } from 'react'
import { getExpenses, getCategories } from '../db'
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const expensesData = await getExpenses()
      const categoriesData = await getCategories()
      setExpenses(expensesData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAmount = (expense) => {
    let total = 0

    // Labour entries
    if (expense.labourEntries && Array.isArray(expense.labourEntries)) {
      expense.labourEntries.forEach((entry) => {
        total += parseFloat(entry.unitPrice || 0) * parseFloat(entry.quantity || 0)
      })
    }

    // Material entries
    if (expense.materialEntries && Array.isArray(expense.materialEntries)) {
      expense.materialEntries.forEach((entry) => {
        total += parseFloat(entry.unitPrice || 0) * parseFloat(entry.quantity || 0)
      })
    }

    // Other costs
    if (expense.otherCosts) {
      total += parseFloat(expense.otherCosts)
    }

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
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Analytics & Reports</h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
          <p className="text-gray-600 text-sm">Total Expenses</p>
          <p className="text-3xl font-bold text-green-600">₹{totalExpenses.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
          <p className="text-gray-600 text-sm">Number of Entries</p>
          <p className="text-3xl font-bold text-blue-600">{expenses.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600">
          <p className="text-gray-600 text-sm">Average per Entry</p>
          <p className="text-3xl font-bold text-purple-600">₹{averageExpense.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-600">
          <p className="text-gray-600 text-sm">Categories Used</p>
          <p className="text-3xl font-bold text-orange-600">{Object.keys(categoryWiseTotals).length}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Expenses by Category</h3>
          <div className="flex justify-center">
            <div style={{ width: '100%', maxWidth: '300px', height: '300px' }}>
              <Pie data={pieChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Category Breakdown</h3>
          <div style={{ height: '400px', width: '100%', minWidth: 0 }}>
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
      </div>


      {/* Category Details Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Category Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Category</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Total Amount</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Percentage</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Entries</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(categoryWiseTotals)
                .sort((a, b) => b[1] - a[1])
                .map(([category, total]) => {
                  const percentage = ((total / totalExpenses) * 100).toFixed(1)
                  const categoryEntries = expenses.filter((e) => e.categoryName === category).length
                  return (
                    <tr key={category} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{category}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                        ₹{total.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">{percentage}%</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">{categoryEntries}</td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
