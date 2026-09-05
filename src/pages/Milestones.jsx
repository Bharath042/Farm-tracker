import React, { useState, useEffect } from 'react'
import { getMilestones, addMilestone, deleteMilestone } from '../db'

export default function Milestones() {
  const [milestones, setMilestones] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    description: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMilestones()
  }, [])

  const loadMilestones = async () => {
    try {
      const data = await getMilestones()
      setMilestones(data)
    } catch (error) {
      console.error('Error loading milestones:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.date) {
      alert('Please fill in all required fields')
      return
    }

    try {
      await addMilestone(formData)
      await loadMilestones()
      setFormData({
        date: new Date().toISOString().split('T')[0],
        title: '',
        description: '',
      })
      setShowForm(false)
    } catch (error) {
      console.error('Error saving milestone:', error)
      alert('Failed to save milestone')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this milestone?')) {
      try {
        await deleteMilestone(id)
        await loadMilestones()
      } catch (error) {
        console.error('Error deleting milestone:', error)
        alert('Failed to delete milestone')
      }
    }
  }

  const handleCancel = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      title: '',
      description: '',
    })
    setShowForm(false)
  }

  const sortedMilestones = [...milestones].sort((a, b) => new Date(b.date) - new Date(a.date))

  if (loading) {
    return <div className="text-center py-8">Loading milestones...</div>
  }

  return (
    <div className="space-y-8 pb-24 bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-200">
      <div className="bg-white dark:bg-slate-900 border-b-2 border-emerald-200 dark:border-emerald-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white transition-colors duration-200">Farm Milestones</h2>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap"
              >
                ➕ Add Milestone
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-8">
      <p className="text-slate-600 dark:text-slate-300 transition-colors duration-200 text-base leading-relaxed">
        Track important events in your farm journey like planting dates, fertilizer applications, pruning, and harvests.
      </p>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border-2 border-emerald-200 dark:border-emerald-800 transition-colors duration-200">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 transition-colors duration-200">New Milestone</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-200">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-200">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., First Planting, Fertilizer Application"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-200">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Details about this milestone"
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors duration-200"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Add Milestone
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

      {/* Milestones Timeline */}
      <div className="space-y-6 mt-8">
        {sortedMilestones.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-10 text-center border-2 border-slate-200 dark:border-slate-700 transition-colors duration-200">
            <p className="text-slate-500 dark:text-slate-400 mb-6 transition-colors duration-200 text-base">No milestones recorded yet. Add one to track your farm journey!</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              ➕ Add First Milestone
            </button>
          </div>
        ) : (
          <div className="relative pt-4">
            {/* Timeline line */}
            <div className="absolute left-3 md:left-8 top-0 bottom-0 w-1 bg-emerald-300 dark:bg-emerald-700 transition-colors duration-200"></div>

            {/* Milestones */}
            {sortedMilestones.map((milestone, index) => (
              <div key={milestone.id} className="ml-12 md:ml-24 mb-8 relative">
                {/* Timeline dot */}
                <div className="absolute -left-6 md:-left-20 top-2 w-4 h-4 bg-emerald-600 dark:bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900 shadow-md transition-colors duration-200"></div>

                {/* Card */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 md:p-8 hover:shadow-lg transition-all border-2 border-slate-200 dark:border-slate-700 duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white transition-colors duration-200">{milestone.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors duration-200">
                        {new Date(milestone.date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(milestone.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>

                  {milestone.description && (
                    <p className="text-slate-700 dark:text-slate-300 mt-3 transition-colors duration-200">{milestone.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suggested Milestones */}
      <div className="bg-blue-50 dark:bg-slate-800 rounded-lg shadow-md p-8 border-l-4 border-blue-600 dark:border-blue-500 transition-colors duration-200 mt-8">
        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-400 mb-4 transition-colors duration-200">💡 Suggested Milestones for Casuarina</h3>
        <ul className="space-y-3 text-blue-800 dark:text-blue-300 text-sm transition-colors duration-200 leading-relaxed">
          <li>• <strong>Planting Date:</strong> When you plant the saplings</li>
          <li>• <strong>First Fertilizer Application:</strong> Initial nutrient boost</li>
          <li>• <strong>Weeding & Maintenance:</strong> Regular upkeep activities</li>
          <li>• <strong>Pruning:</strong> Shaping and maintenance pruning</li>
          <li>• <strong>Pest/Disease Treatment:</strong> Any interventions</li>
          <li>• <strong>Growth Milestones:</strong> Notable growth stages</li>
          <li>• <strong>Expected Harvest:</strong> Projected harvest date</li>
        </ul>
      </div>
      </div>
    </div>
  )
}
