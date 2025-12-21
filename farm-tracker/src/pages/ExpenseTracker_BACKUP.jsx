import React, { useState, useEffect } from 'react'
import { getExpenses, addExpense, updateExpense, deleteExpense, getCategories } from '../db'

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [searchText, setSearchText] = useState('')
  const [selectedExpenses, setSelectedExpenses] = useState(new Set())
  const [duplicateWarning, setDuplicateWarning] = useState(null)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    itemName: '',
    description: '',
    labourEntries: [],
    materialEntries: [],
    otherCosts: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl+N or Cmd+N: New expense
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        setShowForm(true)
        setEditingId(null)
        resetForm()
      }
      // Ctrl+F or Cmd+F: Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        document.getElementById('searchInput')?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
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

  const handleCategoryChange = (categoryId) => {
    if (!editingId) {
      setFormData({
        ...formData,
        category: categoryId,
        labourEntries: [],
        materialEntries: [],
        otherCosts: '',
      })
    } else {
      setFormData({
        ...formData,
        category: categoryId,
      })
    }
    setDuplicateWarning(null)
  }

  const addLabourEntry = () => {
    setFormData({
      ...formData,
      labourEntries: [...formData.labourEntries, { name: '', unitPrice: '', quantity: '' }],
    })
  }

  const updateLabourEntry = (index, field, value) => {
    const updated = [...formData.labourEntries]
    updated[index][field] = value
    setFormData({ ...formData, labourEntries: updated })
  }

  const removeLabourEntry = (index) => {
    setFormData({
      ...formData,
      labourEntries: formData.labourEntries.filter((_, i) => i !== index),
    })
  }

  const addMaterialEntry = () => {
    setFormData({
      ...formData,
      materialEntries: [...formData.materialEntries, { name: '', unitPrice: '', quantity: '' }],
    })
  }

  const updateMaterialEntry = (index, field, value) => {
    const updated = [...formData.materialEntries]
    updated[index][field] = value
    setFormData({ ...formData, materialEntries: updated })
  }

  const removeMaterialEntry = (index) => {
    setFormData({
      ...formData,
      materialEntries: formData.materialEntries.filter((_, i) => i !== index),
    })
  }

  const checkDuplicate = () => {
    const selectedCategory = categories.find((c) => c.id === formData.category)
    const today = new Date().toISOString().split('T')[0]
    
    // Check if same category and date exists
    const duplicate = expenses.find((exp) => 
      exp.category === formData.category && 
      exp.date === formData.date &&
      exp.id !== editingId
    )

    if (duplicate) {
      setDuplicateWarning('Similar expense already exists for this category today!')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.category || !formData.date) {
      alert('Please fill in all required fields')
      return
    }

    const selectedCategory = categories.find((c) => c.id === formData.category)

    // Validate labour entries if they exist
    if (formData.labourEntries.length > 0) {
      for (let entry of formData.labourEntries) {
        if (!entry.name || !entry.unitPrice || !entry.quantity) {
          alert('Please fill all labour entry fields')
          return
        }
        // Validate no negative values
        if (parseFloat(entry.unitPrice) < 0 || parseFloat(entry.quantity) < 0) {
          alert('Amount and quantity cannot be negative')
          return
        }
      }
    }

    // Validate material entries if they exist
    if (formData.materialEntries.length > 0) {
      for (let entry of formData.materialEntries) {
        if (!entry.name || !entry.unitPrice || !entry.quantity) {
          alert('Please fill all material entry fields')
          return
        }
        // Validate no negative values
        if (parseFloat(entry.unitPrice) < 0 || parseFloat(entry.quantity) < 0) {
          alert('Amount and quantity cannot be negative')
          return
        }
      }
    }

    // Validate other costs
    if (formData.otherCosts && parseFloat(formData.otherCosts) < 0) {
      alert('Other costs cannot be negative')
      return
    }

    // Check if at least one cost component is provided
    const hasLabour = formData.labourEntries.length > 0
    const hasMaterials = formData.materialEntries.length > 0
    const hasOther = formData.otherCosts && parseFloat(formData.otherCosts) > 0

    if (!hasLabour && !hasMaterials && !hasOther) {
      alert('Please add at least one cost (Labour, Materials, or Other Costs)')
      return
    }

    try {
      const expenseData = {
        ...formData,
        categoryName: selectedCategory?.name || '',
      }

      if (editingId) {
        await updateExpense({ ...expenseData, id: editingId })
      } else {
        await addExpense(expenseData)
      }

      await loadData()
      resetForm()
    } catch (error) {
      console.error('Error saving expense:', error)
      alert('Failed to save expense')
    }
  }

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: '',
      itemName: '',
      description: '',
      labourEntries: [],
      materialEntries: [],
      otherCosts: '',
    })
    setShowForm(false)
    setEditingId(null)
    setDuplicateWarning(null)
  }

  const handleEdit = (expense) => {
    setFormData(expense)
    setEditingId(expense.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id)
        await loadData()
        setSelectedExpenses(new Set())
      } catch (error) {
        console.error('Error deleting expense:', error)
        alert('Failed to delete expense')
      }
    }
  }

  const handleSelectExpense = (id) => {
    const newSelected = new Set(selectedExpenses)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedExpenses(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedExpenses.size === getFilteredExpenses().length) {
      setSelectedExpenses(new Set())
    } else {
      setSelectedExpenses(new Set(getFilteredExpenses().map((e) => e.id)))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedExpenses.size === 0) {
      alert('Please select expenses to delete')
      return
    }

    if (window.confirm(`Delete ${selectedExpenses.size} expense(s)?`)) {
      try {
        for (const id of selectedExpenses) {
          await deleteExpense(id)
        }
        await loadData()
        setSelectedExpenses(new Set())
      } catch (error) {
        console.error('Error deleting expenses:', error)
        alert('Failed to delete expenses')
      }
    }
  }

  const getFilteredExpenses = () => {
    return expenses.filter((expense) => {
      const categoryMatch = filterCategory === 'all' || expense.category === filterCategory
      const dateFromMatch = !filterDateFrom || new Date(expense.date) >= new Date(filterDateFrom)
      const dateToMatch = !filterDateTo || new Date(expense.date) <= new Date(filterDateTo)
      
      // Search by item name, description, or labour type
      const searchLower = searchText.toLowerCase()
      const searchMatch = !searchText || 
        (expense.itemName && expense.itemName.toLowerCase().includes(searchLower)) ||
        (expense.description && expense.description.toLowerCase().includes(searchLower)) ||
        (expense.labourEntries && expense.labourEntries.some(e => e.name.toLowerCase().includes(searchLower))) ||
        (expense.materialEntries && expense.materialEntries.some(e => e.name.toLowerCase().includes(searchLower)))

      return categoryMatch && dateFromMatch && dateToMatch && searchMatch
    })
  }

  const calculateLabourTotal = (entries) => {
    return entries.reduce((sum, entry) => {
      return sum + (parseFloat(entry.unitPrice || 0) * parseFloat(entry.quantity || 0))
    }, 0)
  }

  const calculateMaterialTotal = (entries) => {
    return entries.reduce((sum, entry) => {
      return sum + (parseFloat(entry.unitPrice || 0) * parseFloat(entry.quantity || 0))
    }, 0)
  }

  const calculateExpenseTotal = (expense) => {
    let total = 0
    if (expense.labourEntries) {
      total += calculateLabourTotal(expense.labourEntries)
    }
    if (expense.materialEntries) {
      total += calculateMaterialTotal(expense.materialEntries)
    }
    if (expense.otherCosts) {
      total += parseFloat(expense.otherCosts)
    }
    return total
  }

  if (loading) {
    return <div className="text-center py-8">Loading expenses...</div>
  }

  const selectedCategory = categories.find((c) => c.id === formData.category)
  const filteredExpenses = getFilteredExpenses()

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Expense Tracker</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            title="Ctrl+N"
          >
            ➕ Add Expense
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            {editingId ? 'Edit Expense' : 'New Expense'}
          </h3>
          
          {duplicateWarning && (
            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
              ⚠️ {duplicateWarning}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => {
                    setFormData({ ...formData, date: e.target.value })
                    setDuplicateWarning(null)
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Item Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  placeholder="e.g., Ploughing, Sowing, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
            </div>

            {/* Labour Entries */}
            {selectedCategory?.needsLabour && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-800">👷 Labour Entries</h4>
                  <button
                    type="button"
                    onClick={addLabourEntry}
                    className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 transition-colors"
                  >
                    + Add Labour
                  </button>
                </div>

                {formData.labourEntries.length === 0 ? (
                  <p className="text-sm text-gray-600 mb-3">No labour entries added yet</p>
                ) : (
                  <div className="space-y-3 mb-3">
                    {formData.labourEntries.map((entry, index) => (
                      <div key={index} className="bg-white p-3 rounded border border-orange-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="e.g., Men, Women, Supervisor"
                            value={entry.name}
                            onChange={(e) => updateLabourEntry(index, 'name', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                          />
                          <input
                            type="number"
                            placeholder="Unit Price (₹)"
                            value={entry.unitPrice}
                            onChange={(e) => updateLabourEntry(index, 'unitPrice', e.target.value)}
                            min="0"
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                          />
                          <input
                            type="number"
                            placeholder="Quantity"
                            value={entry.quantity}
                            onChange={(e) => updateLabourEntry(index, 'quantity', e.target.value)}
                            min="0"
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                          />
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={
                                entry.unitPrice && entry.quantity
                                  ? entry.unitPrice * entry.quantity
                                  : ''
                              }
                              disabled
                              className="px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100 font-semibold flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => removeLabourEntry(index)}
                              className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Material Entries */}
            {selectedCategory?.needsMaterials && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-800">📦 Material Entries</h4>
                  <button
                    type="button"
                    onClick={addMaterialEntry}
                    className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors"
                  >
                    + Add Material
                  </button>
                </div>

                {formData.materialEntries.length === 0 ? (
                  <p className="text-sm text-gray-600 mb-3">No material entries added yet</p>
                ) : (
                  <div className="space-y-3 mb-3">
                    {formData.materialEntries.map((entry, index) => (
                      <div key={index} className="bg-white p-3 rounded border border-purple-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="e.g., Seeds, Fertilizer"
                            value={entry.name}
                            onChange={(e) => updateMaterialEntry(index, 'name', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                          />
                          <input
                            type="number"
                            placeholder="Unit Price (₹)"
                            value={entry.unitPrice}
                            onChange={(e) => updateMaterialEntry(index, 'unitPrice', e.target.value)}
                            min="0"
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                          />
                          <input
                            type="number"
                            placeholder="Quantity"
                            value={entry.quantity}
                            onChange={(e) => updateMaterialEntry(index, 'quantity', e.target.value)}
                            min="0"
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                          />
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={
                                entry.unitPrice && entry.quantity
                                  ? entry.unitPrice * entry.quantity
                                  : ''
                              }
                              disabled
                              className="px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100 font-semibold flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => removeMaterialEntry(index)}
                              className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Other Costs */}
            {selectedCategory?.needsOtherCosts && (
              <div className="bg-red-50 p-4 rounded-lg">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  💵 Other Costs (food, transport, etc.) (₹) - Optional
                </label>
                <input
                  type="number"
                  value={formData.otherCosts}
                  onChange={(e) => setFormData({ ...formData, otherCosts: e.target.value })}
                  placeholder="e.g., 1500"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional notes"
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                {editingId ? 'Update' : 'Add'} Expense
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Filters & Search</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label className="text-sm text-gray-600">Search</label>
            <input
              id="searchInput"
              type="text"
              placeholder="Item, labour, material..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              title="Ctrl+F"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">From Date</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">To Date</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={() => {
                setFilterCategory('all')
                setFilterDateFrom('')
                setFilterDateTo('')
                setSearchText('')
              }}
              className="w-full bg-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-400 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {filteredExpenses.length > 0 && (
        <div className="bg-blue-50 rounded-lg shadow-md p-4 border border-blue-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedExpenses.size === filteredExpenses.length && filteredExpenses.length > 0}
                onChange={handleSelectAll}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-600"
              />
              <span className="text-sm font-semibold text-gray-700">
                {selectedExpenses.size > 0 ? `${selectedExpenses.size} selected` : 'Select All'}
              </span>
            </div>
            {selectedExpenses.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                🗑️ Delete Selected ({selectedExpenses.size})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Expenses List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Expenses ({filteredExpenses.length})
        </h3>
        {filteredExpenses.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No expenses found</p>
        ) : (
          <div className="space-y-4">
            {filteredExpenses.map((expense) => {
              const labourTotal = calculateLabourTotal(expense.labourEntries || [])
              const materialTotal = calculateMaterialTotal(expense.materialEntries || [])
              const otherTotal = parseFloat(expense.otherCosts) || 0
              const total = labourTotal + materialTotal + otherTotal

              return (
                <div key={expense.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={selectedExpenses.has(expense.id)}
                      onChange={() => handleSelectExpense(expense.id)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-600 mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-gray-800">{expense.categoryName}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(expense.date).toLocaleDateString('en-IN')}
                            {expense.itemName && ` • ${expense.itemName}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">₹{total.toLocaleString('en-IN')}</p>
                        </div>
                      </div>

                      {/* Labour Breakdown */}
                      {expense.labourEntries && expense.labourEntries.length > 0 && (
                        <div className="mt-2 pl-4 border-l-2 border-orange-400">
                          <p className="text-xs font-semibold text-orange-700 mb-1">👷 Labour:</p>
                          {expense.labourEntries.map((entry, idx) => (
                            <p key={idx} className="text-xs text-gray-700">
                              {entry.name}: {entry.quantity} × ₹{entry.unitPrice} = ₹{(entry.quantity * entry.unitPrice).toLocaleString('en-IN')}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Materials Breakdown */}
                      {expense.materialEntries && expense.materialEntries.length > 0 && (
                        <div className="mt-2 pl-4 border-l-2 border-purple-400">
                          <p className="text-xs font-semibold text-purple-700 mb-1">📦 Materials:</p>
                          {expense.materialEntries.map((entry, idx) => (
                            <p key={idx} className="text-xs text-gray-700">
                              {entry.name}: {entry.quantity} × ₹{entry.unitPrice} = ₹{(entry.quantity * entry.unitPrice).toLocaleString('en-IN')}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Other Costs */}
                      {expense.otherCosts && (
                        <div className="mt-2 pl-4 border-l-2 border-red-400">
                          <p className="text-xs font-semibold text-red-700">💵 Other: ₹{parseFloat(expense.otherCosts).toLocaleString('en-IN')}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-300">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
