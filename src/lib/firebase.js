import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIhBlnJcYDGftYIzhLPawqjvSzbbMz2b4",
  authDomain: "poodough-404e5.firebaseapp.com",
  projectId: "poodough-404e5",
  storageBucket: "poodough-404e5.firebasestorage.app",
  messagingSenderId: "891825182935",
  appId: "1:891825182935:web:fe5861213fb5d02148f892",
  measurementId: "G-11912L727M"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Initialize Analytics with error handling
let analytics = null
try {
  // Only initialize analytics in production or when not blocked
  if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
    analytics = getAnalytics(app)
  }
} catch (error) {
  console.warn('Analytics initialization failed (this is normal with ad blockers):', error.message)
}

export { analytics }
export const googleProvider = new GoogleAuthProvider()

// Configure Google Auth Provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

export default app