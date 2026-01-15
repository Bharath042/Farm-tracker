import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { enableIndexedDbPersistence, getFirestore } from 'firebase/firestore'

let firebaseAppInstance = null
let authInstance = null
let firestoreInstance = null
let persistenceEnabled = false

const getFirebaseConfig = () => ({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
})

const validateConfig = (config) => {
  if (!config.apiKey || !config.projectId) {
    throw new Error('Missing Firebase environment variables')
  }
}

export const getFirebaseApp = () => {
  if (firebaseAppInstance) return firebaseAppInstance
  const config = getFirebaseConfig()
  validateConfig(config)
  firebaseAppInstance = initializeApp(config)
  return firebaseAppInstance
}

export const getAuthInstance = () => {
  if (authInstance) return authInstance
  authInstance = getAuth(getFirebaseApp())
  return authInstance
}

export const getFirestoreInstance = () => {
  if (firestoreInstance) return firestoreInstance
  firestoreInstance = getFirestore(getFirebaseApp())
  if (!persistenceEnabled) {
    persistenceEnabled = true
    enableIndexedDbPersistence(firestoreInstance).catch(() => {
    })
  }
  return firestoreInstance
}
