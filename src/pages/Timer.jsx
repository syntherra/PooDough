import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Square, ArrowLeft, DollarSign, Clock } from 'lucide-react'
import { useTimer } from '../hooks/useTimer'
import { useAuth } from '../hooks/useAuth'
import { useCurrency } from '../contexts/CurrencyContext'
import { useNavigate } from 'react-router-dom'
import Confetti from 'react-confetti'
import LoadingSpinner from '../components/LoadingSpinner'

function Timer() {
  const { 
    isRunning, 
    elapsedTime, 
    currentEarnings, 
    startTimer, 
    stopTimer, 
    formatTime,
    isWorkHours,
    hourlyRate,
    loading
  } = useTimer()
  
  const { formatCurrency } = useCurrency()
  const { userProfile } = useAuth()
  const navigate = useNavigate()
  
  const [showSessionSummary, setShowSessionSummary] = useState(false)
  const [lastSession, setLastSession] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight })
  
  // Update window size for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  // Check if user has completed onboarding
  if (!userProfile?.onboardingCompleted) {
    navigate('/onboarding')
    return null
  }
  
  // Handle stop session
  const handleStop = async () => {
    // Capture session data before stopping
    const sessionData = {
      duration: elapsedTime,
      earnings: currentEarnings,
      wasWorkHours: isWorkHours,
      endTime: new Date()
    }
    
    setLastSession(sessionData)
    
    // Stop timer and show summary with confetti
    await stopTimer()
    setShowConfetti(true)
    setShowSessionSummary(true)
    
    // Stop confetti after 3 seconds
    setTimeout(() => {
      setShowConfetti(false)
    }, 3000)
  }
  
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={200}
            gravity={0.3}
          />
        </div>
      )}
      
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 left-6 z-10"
      >
        <button
          onClick={() => navigate('/home')}
          className="p-3 rounded-full bg-dark-800 hover:bg-dark-700 text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
      </motion.div>
      
      {/* Main Timer Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Timer Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-12"
        >
          <div className="text-8xl md:text-9xl font-display font-bold text-white mb-8 font-mono">
            {formatTime(elapsedTime)}
          </div>
          
          {/* Earnings Display */}
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-3 text-3xl font-bold mb-4"
            >
              <DollarSign className="text-green-400" size={36} />
              <span className="text-green-400">
                {formatCurrency(currentEarnings)}
              </span>
            </motion.div>
          )}
        </motion.div>
        
        {/* Control Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {!isRunning ? (
            <motion.button
              onClick={startTimer}
              disabled={loading}
              className="btn-primary flex items-center gap-4 text-2xl py-6 px-12 rounded-2xl"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              {loading ? (
                <LoadingSpinner size="md" />
              ) : (
                <>
                  <Play size={32} />
                  <span>Start Session</span>
                </>
              )}
            </motion.button>
          ) : (
            <motion.button
              onClick={handleStop}
              disabled={loading}
              className="btn-secondary flex items-center gap-4 text-2xl py-6 px-12 rounded-2xl"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              {loading ? (
                <LoadingSpinner size="md" />
              ) : (
                <>
                  <Square size={32} />
                  <span>Stop Session</span>
                </>
              )}
            </motion.button>
          )}
        </motion.div>
      </div>
      
      {/* Session Summary Modal */}
      <AnimatePresence>
        {showSessionSummary && lastSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card p-8 max-w-md w-full"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Session Complete!
                </h3>
                <p className="text-dark-400 mb-4">
                  Awesome work! Here's your session summary:
                </p>
                
                {/* Session Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center p-3 bg-dark-800 rounded-lg">
                    <span className="text-dark-300">Duration</span>
                    <span className="text-white font-bold">{formatTime(lastSession.duration)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-dark-800 rounded-lg">
                    <span className="text-dark-300">Earnings</span>
                    <span className="text-green-400 font-bold">{formatCurrency(lastSession.earnings)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-dark-800 rounded-lg">
                    <span className="text-dark-300">Session Type</span>
                    <span className={`font-bold ${
                      lastSession.wasWorkHours ? 'text-green-400' : 'text-orange-400'
                    }`}>
                      {lastSession.wasWorkHours ? 'Work Time Sessions' : 'Off Hours'}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setShowSessionSummary(false)
                    navigate('/history')
                  }}
                  className="btn-primary w-full text-lg py-3 mb-3"
                >
                  View History
                </button>
                
                {/* Sync Status */}
                <div className="text-green-400 text-sm">
                  ✓ Synced to Cloud
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Timer