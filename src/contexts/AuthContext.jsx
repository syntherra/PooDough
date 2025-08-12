import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc, query, collection, where, getDocs } from 'firebase/firestore'
import { auth, googleProvider, db } from '../lib/firebase'
import toast from 'react-hot-toast'
import notificationService from '../services/notificationService'

export const AuthContext = createContext()

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)

  // Check if displayName is already taken
  const checkDisplayNameAvailability = async (displayName, excludeUserId = null) => {
    if (!displayName || displayName.trim() === '') {
      return { available: false, message: 'Display name cannot be empty' }
    }

    try {
      const q = query(
        collection(db, 'users'),
        where('displayName', '==', displayName.trim())
      )
      const querySnapshot = await getDocs(q)
      
      // If excluding current user (for profile updates), filter them out
      const existingUsers = querySnapshot.docs.filter(doc => 
        excludeUserId ? doc.id !== excludeUserId : true
      )
      
      if (existingUsers.length > 0) {
        return { available: false, message: 'This username is already taken' }
      }
      
      return { available: true, message: 'Username is available' }
    } catch (error) {
      console.error('Error checking displayName availability:', error)
      return { available: false, message: 'Error checking username availability' }
    }
  }

  // Create or load user profile
  const createUserProfile = async (authUser, explicitDisplayName = null) => {
    if (!authUser) return null

    try {
      const userRef = doc(db, 'users', authUser.uid)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        // Create new user profile
        const newUserProfile = {
          uid: authUser.uid,
          email: authUser.email,
          displayName: explicitDisplayName || authUser.displayName || '',
          photoURL: authUser.photoURL || '',
          createdAt: new Date(),
          updatedAt: new Date(),
          onboardingCompleted: false,
          currency: 'USD',
          salary: 0,
          workDays: [],
          workHours: { start: '09:00', end: '17:00' },
          totalEarnings: 0,
          totalWorkTime: 0,
          isPremium: false
        }

        await setDoc(userRef, newUserProfile)
        setUserProfile(newUserProfile)
        console.log('✅ New user profile created')
        return newUserProfile
      } else {
        // Load existing profile
        const existingProfile = userSnap.data()
        setUserProfile(existingProfile)
        console.log('✅ Existing user profile loaded')
        return existingProfile
      }
    } catch (error) {
      console.error('❌ Error creating/loading user profile:', error)
      toast.error('Failed to load profile')
      return null
    }
  }

  // Update user profile
  const updateUserProfile = async (updates, showToast = true) => {
    if (!user) {
      console.error('❌ No user found for profile update')
      toast.error('Please sign in first')
      return
    }

    try {
      console.log('🔄 Updating profile for user:', user.uid)
      console.log('📝 Updates:', updates)

      // Check displayName availability if it's being updated
      if (updates.displayName && updates.displayName !== userProfile?.displayName) {
        const availability = await checkDisplayNameAvailability(updates.displayName, user.uid)
        if (!availability.available) {
          toast.error(availability.message)
          throw new Error(availability.message)
        }
      }

      const userRef = doc(db, 'users', user.uid)
      const updatedData = {
        ...updates,
        updatedAt: new Date()
      }

      // Use setDoc with merge to handle document creation/update
      await setDoc(userRef, updatedData, { merge: true })
      
      // Update local state
      setUserProfile(prev => ({ ...prev, ...updatedData }))
      
      console.log('✅ Profile updated successfully')
      
      if (showToast && !updates.onboardingCompleted) {
        toast.success('Profile updated successfully!')
      }
    } catch (error) {
      console.error('❌ Profile update failed:', error)
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        userId: user.uid,
        updates
      })
      
      if (error.code === 'permission-denied') {
        toast.error('Permission denied. Please check your authentication.')
      } else if (error.code === 'unavailable') {
        toast.error('Service temporarily unavailable. Please try again.')
      } else {
        toast.error('Failed to update profile')
      }
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      console.log('🔄 Starting Google sign-in...')
      const result = await signInWithPopup(auth, googleProvider)
      console.log('✅ Google sign-in successful')
      
      // Create or load user profile
      await createUserProfile(result.user)
      
      return result.user
    } catch (error) {
      console.error('❌ Google sign-in failed:', error)
      
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-in cancelled')
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Popup blocked. Please allow popups and try again.')
      } else {
        toast.error('Failed to sign in with Google')
      }
      throw error
    }
  }

  // Other auth functions
  const signIn = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      await createUserProfile(result.user)
      return result.user
    } catch (error) {
      console.error('Sign-in error:', error)
      throw error
    }
  }

  const signUp = async (email, password, displayName) => {
    try {
      // Check displayName availability before creating account
      if (displayName) {
        const availability = await checkDisplayNameAvailability(displayName)
        if (!availability.available) {
          throw new Error(availability.message)
        }
      }
      
      const result = await createUserWithEmailAndPassword(auth, email, password)
      if (displayName) {
        await updateProfile(result.user, { displayName })
      }
      // Pass displayName explicitly to ensure it's saved to Firestore
      await createUserProfile(result.user, displayName)
      return result.user
    } catch (error) {
      console.error('Sign-up error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setUserProfile(null)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  const completeOnboarding = async (onboardingData) => {
    await updateUserProfile({ ...onboardingData, onboardingCompleted: true })
  }

  // Test database operations
  const testDatabaseOperations = async () => {
    if (!user) {
      console.error('❌ No user for database test')
      return
    }

    try {
      console.log('🧪 Testing database operations...')
      const userRef = doc(db, 'users', user.uid)
      
      // Test document existence
      const userSnap = await getDoc(userRef)
      console.log('📄 User document exists:', userSnap.exists())
      
      // Test update
      const testUpdate = {
        testField: 'test-value-' + Date.now(),
        updatedAt: new Date()
      }
      
      await setDoc(userRef, testUpdate, { merge: true })
      console.log('✅ Database test successful')
    } catch (error) {
      console.error('❌ Database test failed:', error)
    }
  }

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      console.log('🔄 Auth state changed:', authUser ? 'User signed in' : 'User signed out')
      
      if (authUser) {
        setUser(authUser)
        await createUserProfile(authUser)
        // Initialize notification service only if permission is already granted
        try {
          if (Notification.permission === 'granted') {
            await notificationService.initialize(authUser.uid)
          } else {
            // Just setup the foreground listener without requesting permission
            notificationService.setupForegroundListener()
          }
        } catch (error) {
          console.error('Failed to initialize notifications:', error)
        }
      } else {
        setUser(null)
        setUserProfile(null)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    updateUserProfile,
    createUserProfile,
    completeOnboarding,
    testDatabaseOperations,
    checkDisplayNameAvailability
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}