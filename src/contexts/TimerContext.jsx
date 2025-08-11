import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { collection, addDoc, query, where, orderBy, getDocs, updateDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const TimerContext = createContext()

function TimerProvider({ children }) {
  const { user, userProfile, updateUserProfile } = useAuth()
  const [isRunning, setIsRunning] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [currentEarnings, setCurrentEarnings] = useState(0)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)

  // Calculate if user is currently in work hours
  const isWorkHours = useCallback(() => {
    if (!userProfile) return false
    
    const now = new Date()
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const currentTime = now.toTimeString().slice(0, 5)
    
    const workDays = userProfile.workDays || []
    const workStart = userProfile.workHoursStart || '09:00'
    const workEnd = userProfile.workHoursEnd || '17:00'
    
    const isWorkDay = workDays.some(day => 
      currentDay.includes(day.toLowerCase().slice(0, 3))
    )
    
    return isWorkDay && currentTime >= workStart && currentTime <= workEnd
  }, [userProfile])

  // Calculate hourly rate
  const getHourlyRate = useCallback(() => {
    if (!userProfile?.salary) return 0
    
    // Assuming 40 hours per week, 52 weeks per year
    const annualWorkHours = 40 * 52
    return userProfile.salary / annualWorkHours
  }, [userProfile])

  // Calculate current earnings
  const calculateEarnings = useCallback((timeInSeconds) => {
    const hourlyRate = getHourlyRate()
    if (hourlyRate === 0) return 0
    
    const hoursWorked = timeInSeconds / 3600
    return hourlyRate * hoursWorked
  }, [getHourlyRate])

  // Start timer
  const startTimer = useCallback(() => {
    if (!user) {
      toast.error('Please log in to start tracking')
      return
    }
    
    const now = Date.now()
    setStartTime(now)
    setIsRunning(true)
    setElapsedTime(0)
    setCurrentEarnings(0)
    
    toast.success('Timer started! 💩')
  }, [user])

  // Stop timer and save session
  const stopTimer = useCallback(async () => {
    if (!isRunning || !startTime || !user) return
    
    const endTime = Date.now()
    const totalTime = Math.floor((endTime - startTime) / 1000)
    const earnings = calculateEarnings(totalTime)
    
    setIsRunning(false)
    setLoading(true)
    
    try {
      // Save session to Firestore
      const sessionData = {
        userId: user.uid,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        duration: totalTime,
        earnings: earnings,
        wasWorkHours: isWorkHours(),
        createdAt: new Date()
      }
      
      await addDoc(collection(db, 'sessions'), sessionData)
      
      // Update user stats
      const newTotalSessions = (userProfile?.totalSessions || 0) + 1
      const newTotalEarnings = (userProfile?.totalEarnings || 0) + earnings
      const newTotalTime = (userProfile?.totalTime || 0) + totalTime
      const newLongestSession = Math.max(userProfile?.longestSession || 0, totalTime)
      
      await updateUserProfile({
        totalSessions: newTotalSessions,
        totalEarnings: newTotalEarnings,
        totalTime: newTotalTime,
        longestSession: newLongestSession,
        lastSessionAt: new Date()
      })
      
      // Add to local sessions
      setSessions(prev => [sessionData, ...prev])
      
      toast.success(`Session saved! You earned $${earnings.toFixed(2)}! 🎉`)
      
      // Reset timer state
      setStartTime(null)
      setElapsedTime(0)
      setCurrentEarnings(0)
      
    } catch (error) {
      console.error('Error saving session:', error)
      if (error.code === 'permission-denied') {
        toast.error('Please sign in to save your session')
      } else {
        toast.error('Failed to save session')
      }
    } finally {
      setLoading(false)
    }
  }, [isRunning, startTime, user, userProfile, calculateEarnings, isWorkHours, updateUserProfile])

  // Load user sessions
  const loadSessions = useCallback(async () => {
    if (!user) {
      setSessions([])
      return
    }
    
    try {
      const q = query(
        collection(db, 'sessions'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const userSessions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      setSessions(userSessions)
    } catch (error) {
      console.error('Error loading sessions:', error)
      // Set empty sessions array on error to prevent app crash
      setSessions([])
      // Only show toast for non-permission errors
      if (error.code !== 'permission-denied' && !error.message?.includes('permissions')) {
        toast.error('Failed to load session history')
      }
    }
  }, [user])

  // Update timer every second when running
  useEffect(() => {
    let interval = null
    
    if (isRunning && startTime) {
      interval = setInterval(() => {
        const now = Date.now()
        const elapsed = Math.floor((now - startTime) / 1000)
        setElapsedTime(elapsed)
        setCurrentEarnings(calculateEarnings(elapsed))
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, startTime, calculateEarnings])

  // Load sessions when user and profile are ready
  useEffect(() => {
    if (user && userProfile) {
      loadSessions()
    } else {
      setSessions([])
    }
  }, [user, userProfile, loadSessions])

  // Format time helper - always shows HH:MM:SS format
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Delete all user sessions
  const deleteAllSessions = useCallback(async () => {
    if (!user) {
      toast.error('Please log in to delete sessions')
      return false
    }
    
    setLoading(true)
    
    try {
      // Get all user sessions
      const q = query(
        collection(db, 'sessions'),
        where('userId', '==', user.uid)
      )
      
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        toast.success('No sessions to delete')
        setLoading(false)
        return true
      }
      
      // Use batch to delete all sessions
      const batch = writeBatch(db)
      querySnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref)
      })
      
      await batch.commit()
      
      // Reset user stats
      await updateUserProfile({
        totalSessions: 0,
        totalEarnings: 0,
        totalTime: 0,
        longestSession: 0,
        lastSessionAt: null
      })
      
      // Clear local sessions
      setSessions([])
      
      toast.success('All session history deleted successfully! 🗑️')
      return true
      
    } catch (error) {
      console.error('Error deleting sessions:', error)
      if (error.code === 'permission-denied') {
        toast.error('Permission denied. Please sign in again.')
      } else {
        toast.error('Failed to delete session history')
      }
      return false
    } finally {
      setLoading(false)
    }
  }, [user, updateUserProfile])

  // Currency formatting is now handled by CurrencyContext

  const value = {
    isRunning,
    elapsedTime,
    currentEarnings,
    sessions,
    loading,
    startTimer,
    stopTimer,
    loadSessions,
    deleteAllSessions,
    formatTime,
    isWorkHours: isWorkHours(),
    hourlyRate: getHourlyRate()
  }

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  )
}

export { TimerContext }
export default TimerProvider