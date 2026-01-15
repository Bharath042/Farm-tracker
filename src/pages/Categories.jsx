import React, { useState, useEffect } from 'react'
import { getCategories, addCategory, updateCategory, deleteCategory, getSubCategories } from '../db'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [subcategories, setSubCategories] = useState([])
  const [defaultOthersId, setDefaultOthersId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selectedSubCategories: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [categoriesData, subcategoriesData] = await Promise.all([
        getCategories(),
        getSubCategories(),
      ])
      setCategories(categoriesData)
      setSubCategories(subcategoriesData)

      const others =
        subcategoriesData.find((sc) => sc.id === 'default-others') ||
        subcategoriesData.find((sc) => sc.name && sc.name.toLowerCase() === 'others')
      setDefaultOthersId(others ? others.id : null)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Category name is required')
      return
    }

    try {
      const withDefaultOthers = (() => {
        if (!defaultOthersId) return formData
        const existing = formData.selectedSubCategories || []
        return existing.includes(defaultOthersId)
          ? formData
          : {
              ...formData,
              selectedSubCategories: [...existing, defaultOthersId],
            }
      })()

      if (editingId) {
        await updateCategory({ ...withDefaultOthers, id: editingId })
      } else {
        await addCategory(withDefaultOthers)
      }
      await loadData()
      setFormData({ name: '', description: '', selectedSubCategories: defaultOthersId ? [defaultOthersId] : [] })
      setShowForm(false)
      setEditingId(null)
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Failed to save category')
    }
  }

  const handleEdit = (category) => {
    const selected = category.selectedSubCategories || []
    const ensuredSelected =
      defaultOthersId && !selected.includes(defaultOthersId)
        ? [...selected, defaultOthersId]
        : selected

    setFormData({
      name: category.name,
      description: category.description || '',
      selectedSubCategories: ensuredSelected,
    })
    setEditingId(category.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id)
        await loadData()
      } catch (error) {
        console.error('Error deleting category:', error)
        alert('Failed to delete category')
      }
    }
  }

  const handleCancel = () => {
    setFormData({ name: '', description: '', selectedSubCategories: [] })
    setShowForm(false)
    setEditingId(null)
  }

  const toggleSubCategory = (subcategoryId) => {
    setFormData((prev) => ({
      ...prev,
      selectedSubCategories: prev.selectedSubCategories.includes(subcategoryId)
        ? prev.selectedSubCategories.filter((id) => id !== subcategoryId)
        : [...prev.selectedSubCategories, subcategoryId],
    }))
  }

  const getSelectedSubCategoryNames = (selectedIds) => {
    return subcategories
      .filter((sc) => selectedIds.includes(sc.id))
      .map((sc) => sc.name)
  }

  if (loading) {
    return <div className="text-center py-8 text-slate-600 dark:text-slate-400">Loading categories...</div>
  }

  return (
    <div className="space-y-8 pb-24 bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b-2 border-emerald-200 dark:border-emerald-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white transition-colors duration-200">Categories</h2>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap"
              >
                ➕ Add Category
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Form */}
        {showForm && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border-2 border-emerald-200 dark:border-emerald-800 transition-colors duration-200">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 transition-colors duration-200">
              {editingId ? 'Edit Category' : 'New Category'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-200">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Ploughing, Sowing, Harvesting, Weeding"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-200">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional notes about this category"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors duration-200"
                />
              </div>

              {/* SubCategories Selection */}
              <div className="bg-blue-50 dark:bg-slate-700 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800 transition-colors duration-200">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 transition-colors duration-200">
                  Select SubCategories for this Category
                </label>
                
                {subcategories.length === 0 ? (
                  <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-200">
                    No subcategories available. Create some in the SubCategories page first.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {subcategories.map((subcategory) => (
                      <label key={subcategory.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.selectedSubCategories.includes(subcategory.id)}
                          onChange={() => toggleSubCategory(subcategory.id)}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-600"
                        />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors duration-200">
                          {subcategory.name}
                        </span>
                        {subcategory.description && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">
                            ({subcategory.description})
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  {editingId ? 'Update' : 'Create'} Category
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-400 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 text-center border-2 border-slate-200 dark:border-slate-700 transition-colors duration-200">
              <p className="text-slate-500 dark:text-slate-400 mb-4 transition-colors duration-200">No categories yet. Create one to get started!</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                ➕ Create First Category
              </button>
            </div>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 border-2 border-slate-200 dark:border-slate-700 transition-colors duration-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white transition-colors duration-200">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-200 mt-1">{category.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Display Selected SubCategories */}
                {category.selectedSubCategories && category.selectedSubCategories.length > 0 ? (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 transition-colors duration-200">SubCategories:</p>
                    <div className="flex flex-wrap gap-2">
                      {getSelectedSubCategoryNames(category.selectedSubCategories).map((name) => (
                        <span key={name} className="inline-block bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs px-2 py-1 rounded transition-colors duration-200">
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">No subcategories selected</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
