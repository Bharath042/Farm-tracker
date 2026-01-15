import React, { useState, useEffect } from 'react'
import { getSubCategories, addSubCategory, updateSubCategory, deleteSubCategory } from '../db'

const DEFAULT_OTHERS_SUBCATEGORY_ID = 'default-others'

export default function SubCategories() {
  const [subcategories, setSubCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSubCategories()
  }, [])

  const loadSubCategories = async () => {
    try {
      let data = await getSubCategories()

      const defaultOthersInDb = data.find((sc) => sc.id === DEFAULT_OTHERS_SUBCATEGORY_ID)
      const othersByName = data.filter((sc) => sc.name && sc.name.toLowerCase() === 'others')

      if (!defaultOthersInDb) {
        const defaultOthers = {
          id: DEFAULT_OTHERS_SUBCATEGORY_ID,
          name: 'Others',
          description: 'Miscellaneous expenses that do not fit into other subcategories',
        }
        await addSubCategory(defaultOthers)
        data = await getSubCategories()
      }

      const duplicates = othersByName.filter((sc) => sc.id !== DEFAULT_OTHERS_SUBCATEGORY_ID)
      if (duplicates.length > 0) {
        for (const dup of duplicates) {
          await deleteSubCategory(dup.id)
        }
        data = await getSubCategories()
      }

      setSubCategories(data)
    } catch (error) {
      console.error('Error loading subcategories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('SubCategory name is required')
      return
    }

    try {
      if (editingId) {
        await updateSubCategory({ ...formData, id: editingId })
      } else {
        await addSubCategory(formData)
      }
      await loadSubCategories()
      setFormData({ name: '', description: '' })
      setShowForm(false)
      setEditingId(null)
    } catch (error) {
      console.error('Error saving subcategory:', error)
      alert('Failed to save subcategory')
    }
  }

  const handleEdit = (subcategory) => {
    setFormData(subcategory)
    setEditingId(subcategory.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    const subcat = subcategories.find((sc) => sc.id === id)
    if (subcat && subcat.id === DEFAULT_OTHERS_SUBCATEGORY_ID) {
      alert('The default "Others" subcategory cannot be deleted')
      return
    }
    if (window.confirm('Are you sure you want to delete this subcategory?')) {
      try {
        await deleteSubCategory(id)
        await loadSubCategories()
      } catch (error) {
        console.error('Error deleting subcategory:', error)
        alert('Failed to delete subcategory')
      }
    }
  }

  const handleCancel = () => {
    setFormData({ name: '', description: '' })
    setShowForm(false)
    setEditingId(null)
  }

  if (loading) {
    return <div className="text-center py-8 text-slate-600 dark:text-slate-400">Loading subcategories...</div>
  }

  return (
    <div className="space-y-8 pb-24 bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b-2 border-emerald-200 dark:border-emerald-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white transition-colors duration-200">SubCategories</h2>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap"
              >
                ➕ Add SubCategory
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <p className="text-slate-600 dark:text-slate-300 transition-colors duration-200 text-base leading-relaxed">
          Create custom subcategories for your expenses. You can then select which subcategories each category needs.
        </p>

        {/* Form */}
        {showForm && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border-2 border-emerald-200 dark:border-emerald-800 transition-colors duration-200">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 transition-colors duration-200">
              {editingId ? 'Edit SubCategory' : 'New SubCategory'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-200">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Labour, Materials, Transport, Food"
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
                  placeholder="Details about this subcategory"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors duration-200"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  {editingId ? 'Update' : 'Add'} SubCategory
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

        {/* SubCategories List */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border-2 border-slate-200 dark:border-slate-700 transition-colors duration-200">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 transition-colors duration-200">
            SubCategories ({subcategories.length})
          </h3>
          {subcategories.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-8 transition-colors duration-200">
              No subcategories yet. Create one to get started!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subcategories.map((subcategory) => (
                <div
                  key={subcategory.id}
                  className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-slate-800 dark:text-white transition-colors duration-200">
                      {subcategory.name}
                    </h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(subcategory)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(subcategory.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  {subcategory.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-200">
                      {subcategory.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
