// Local database using localStorage and IndexedDB
// This module handles all data persistence for the farm tracker

import { getAuthInstance, getFirestoreInstance } from './firebase'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore'

const requireUser = () => {
  const user = getAuthInstance().currentUser
  if (!user) throw new Error('Not authenticated')
  return user
}

const ensureId = (value, fallbackId) => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    if (!value.id && fallbackId) return { ...value, id: fallbackId }
  }
  return value
}

const listFromCollection = async (collectionName) => {
  const user = requireUser()
  const firestore = getFirestoreInstance()
  const snap = await getDocs(collection(firestore, 'users', user.uid, collectionName))
  return snap.docs.map((d) => ensureId(d.data(), d.id))
}

const writeDoc = async (collectionName, id, payload) => {
  const user = requireUser()
  const firestore = getFirestoreInstance()
  await setDoc(doc(firestore, 'users', user.uid, collectionName, id), payload)
}

const deleteDocById = async (collectionName, id) => {
  const user = requireUser()
  const firestore = getFirestoreInstance()
  await deleteDoc(doc(firestore, 'users', user.uid, collectionName, id))
}

export const initDB = async () => {
  if (!import.meta.env.VITE_FIREBASE_API_KEY || !import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    throw new Error('Missing Firebase environment variables')
  }
  return true
}

export const getDB = async () => getFirestoreInstance()

export const addCategory = async (category) => {
  const id = Date.now().toString()
  const createdAt = new Date().toISOString()
  const payload = { ...category, id, createdAt }
  await writeDoc('categories', id, payload)
  return payload
}

export const getCategories = async () => listFromCollection('categories')

export const updateCategory = async (category) => {
  if (!category?.id) throw new Error('Category id is required')
  await writeDoc('categories', category.id, category)
  return category
}

export const deleteCategory = async (categoryId) => {
  await deleteDocById('categories', categoryId)
}

export const addExpense = async (expense) => {
  const id = Date.now().toString()
  const createdAt = new Date().toISOString()
  const payload = { ...expense, id, createdAt }
  await writeDoc('expenses', id, payload)
  return payload
}

export const getExpenses = async () => listFromCollection('expenses')

export const updateExpense = async (expense) => {
  if (!expense?.id) throw new Error('Expense id is required')
  await writeDoc('expenses', expense.id, expense)
  return expense
}

export const deleteExpense = async (expenseId) => {
  await deleteDocById('expenses', expenseId)
}

export const addMilestone = async (milestone) => {
  const id = Date.now().toString()
  const createdAt = new Date().toISOString()
  const payload = { ...milestone, id, createdAt }
  await writeDoc('milestones', id, payload)
  return payload
}

export const getMilestones = async () => listFromCollection('milestones')

export const deleteMilestone = async (milestoneId) => {
  await deleteDocById('milestones', milestoneId)
}

export const saveFarmData = async (data) => {
  const user = requireUser()
  const firestore = getFirestoreInstance()
  const payload = {
    ...data,
    key: 'farmMetadata',
    updatedAt: new Date().toISOString(),
  }

  await setDoc(doc(firestore, 'users', user.uid, 'farmData', 'farmMetadata'), payload)
  return payload
}

export const getFarmData = async () => {
  const user = requireUser()
  const firestore = getFirestoreInstance()
  const snap = await getDoc(doc(firestore, 'users', user.uid, 'farmData', 'farmMetadata'))
  if (!snap.exists()) return {}
  return snap.data() || {}
}

export const addSubCategory = async (subcategory) => {
  const id = subcategory?.id ? subcategory.id : Date.now().toString()
  const createdAt = new Date().toISOString()
  const payload = { ...subcategory, id, createdAt }
  await writeDoc('subcategories', id, payload)
  return payload
}

export const getSubCategories = async () => listFromCollection('subcategories')

export const updateSubCategory = async (subcategory) => {
  if (!subcategory?.id) throw new Error('Subcategory id is required')
  await writeDoc('subcategories', subcategory.id, subcategory)
  return subcategory
}

export const deleteSubCategory = async (subcategoryId) => {
  await deleteDocById('subcategories', subcategoryId)
}
