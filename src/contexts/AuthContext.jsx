import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, googleProvider, db } from '../lib/firebase'
import toast from 'react-hot-toast'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)

  // Create user profile in Firestore
  const createUserProfile = async (user, additionalData = {}) => {
    console.log('👤 Creating/loading user profile for:', user?.uid)
    if (!user) return
    
    const userRef = doc(db, 'users', user.uid)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
      console.log('🆕 Creating new user profile')
      const { displayName, email, photoURL } = user
      const createdAt = new Date()
      
      const profileData = {
        displayName: displayName || '',
        email,
        photoURL: photoURL || '',
        createdAt,
        salary: 0,
        currency: 'USD',
        workHoursStart: '09:00',
        workHoursEnd: '17:00',
        workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        totalSessions: 0,
        totalEarnings: 0,
        totalTime: 0,
        longestSession: 0,
        currentStreak: 0,
        bestStreak: 0,
        isPremium: false,
        onboardingCompleted: false,
        ...additionalData
      }
      
      try {
        await setDoc(userRef, profileData)
        setUserProfile(profileData) // Set the profile in state immediately
        return profileData
      } catch (error) {
        console.error('❌ Error creating user profile:', error)
        toast.error('Failed to create user profile')
        return null
      }
    } else {
      // Profile exists, load it into state
      const existingProfile = userSnap.data()
      console.log('📋 Existing profile found and set in state:', existingProfile)
      setUserProfile(existingProfile)
      return existingProfile
    }
  }

  // Get user profile from Firestore
  const getUserProfile = async (userId) => {
    if (!userId) {
      console.warn('getUserProfile called without userId')
      setUserProfile({})
      return {}
    }
    
    try {
      const userRef = doc(db, 'users', userId)
      const userSnap = await getDoc(userRef)
      
      if (userSnap.exists()) {
        const profileData = userSnap.data()
        setUserProfile(profileData)
        return profileData
      } else {
        setUserProfile({})
        return {}
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error)
      if (error.code !== 'permission-denied') {
        toast.error('Failed to load user profile')
      }
      setUserProfile({})
    }
    return null
  }

  // Update user profile
  const updateUserProfile = async (updates, showToast = true) => {
    if (!user) return
    
    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date()
      })
      
      // Update local state immediately
      setUserProfile(prev => ({ ...prev, ...updates }))
      
      if (showToast && !updates.onboardingCompleted) {
        toast.success('Profile updated successfully!')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
      throw error
    }
  }

  // Sign up with email and password
  const signUp = async (email, password, displayName) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      
      if (displayName) {
        await updateProfile(user, { displayName })
      }
      
      await createUserProfile(user, { displayName })
      toast.success('Account created successfully!')
      return user
    } catch (error) {
      console.error('Sign up error:', error)
      toast.error(error.message)
      throw error
    }
  }

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password)
      toast.success('Welcome back!')
      return user
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error('Invalid email or password')
      throw error
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      
      const profile = await createUserProfile(user)
      console.log('📋 Profile creation/loading result:', profile)
      
      toast.success('Welcome to PooDough!')
      return user
    } catch (error) {
      console.error('❌ Google sign in error:', error)
      toast.error('Failed to sign in with Google')
      throw error
    }
  }

  // Complete onboarding
  const completeOnboarding = async (onboardingData) => {
    if (!user) return
    
    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        ...onboardingData,
        onboardingCompleted: true
      })
      
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        ...onboardingData,
        onboardingCompleted: true
      }))
      
      toast.success('Profile setup completed!')
      return true
    } catch (error) {
      console.error('Error completing onboarding:', error)
      toast.error('Failed to save profile data')
      return false
    }
  }

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth)
      setUserProfile(null)
      toast.success('Signed out successfully')
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out')
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔥 Auth state changed:', user ? `User: ${user.uid}` : 'No user')
      setUser(user)
      
      if (user) {
        const profile = await getUserProfile(user.uid)
        setUserProfile(profile)
      } else {
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
    getUserProfile,
    completeOnboarding
  }
  


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider