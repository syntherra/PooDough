import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Square, DollarSign, Clock, Zap, AlertCircle } from 'lucide-react'
import { useTimer } from '../contexts/TimerContext'
import { useAuth } from '../hooks/useAuth'
import ToiletPaperRoll from '../components/ToiletPaperRoll'
import LoadingSpinner from '../components/LoadingSpinner'

function Timer() {
  const { 
    isRunning, 
    elapsedTime, 
    currentEarnings, 
    startTimer, 
    stopTimer, 
    formatTime, 
    formatCurrency,
    isWorkHours,
    hourlyRate,
    loading
  } = useTimer()
  
  const { userProfile } = useAuth()
  const [showConfirmStop, setShowConfirmStop] = useState(false)
  
  // Check if user has completed onboarding
  if (!userProfile?.onboardingCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Setup Required</h2>
          <p className="text-gray-400 mb-6">Please complete your profile setup to start earning!</p>
          <button 
            onClick={() => window.location.href = '/onboarding'}
            className="btn-primary"
          >
            Complete Setup
          </button>
        </div>
      </div>
    )
  }
  
  // Calculate progress for toilet paper roll (0-1)
  const progress = Math.min(elapsedTime / 600, 1) // Max progress at 10 minutes
  
  // Handle stop with confirmation
  const handleStop = () => {
    if (elapsedTime < 10) {
      // If less than 10 seconds, stop immediately
      stopTimer()
    } else {
      setShowConfirmStop(true)
    }
  }
  
  const confirmStop = () => {
    stopTimer()
    setShowConfirmStop(false)
  }
  
  // Motivational messages based on time
  const getMotivationalMessage = () => {
    if (elapsedTime < 30) return "Just getting started! 🚀"
    if (elapsedTime < 120) return "You're in the zone! 💪"
    if (elapsedTime < 300) return "Productive session! 📈"
    if (elapsedTime < 600) return "This is dedication! 🏆"
    return "Legendary session! 👑"
  }
  
  // Check if user has set up their profile
  const isProfileComplete = userProfile?.salary > 0
  
  return (
    <div className="min-h-screen bg-dark-900 p-4 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h1 className="text-3xl font-display font-bold gradient-text mb-2">
          Bathroom Timer
        </h1>
        <p className="text-dark-400">
          {isRunning ? getMotivationalMessage() : 'Ready to start earning?'}
        </p>
      </motion.div>
      
      {/* Profile Setup Warning */}
      {!isProfileComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-4 mb-6 border-l-4 border-yellow-500 bg-yellow-500/5"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="text-yellow-500" size={20} />
            <div>
              <p className="text-yellow-400 font-medium">Setup Required</p>
              <p className="text-dark-300 text-sm">
                Set your salary in Profile to see accurate earnings!
              </p>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Work Hours Status */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className={`card p-4 mb-6 text-center ${
          isWorkHours 
            ? 'border border-green-500/30 bg-green-500/5' 
            : 'border border-dark-700'
        }`}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          {isWorkHours ? (
            <>
              <Zap className="text-green-400" size={20} />
              <span className="text-green-400 font-semibold">Work Hours Active</span>
            </>
          ) : (
            <>
              <Clock className="text-dark-400" size={20} />
              <span className="text-dark-400 font-semibold">Off Hours</span>
            </>
          )}
        </div>
        <p className="text-sm text-dark-300">
          {isWorkHours 
            ? `Earning ${formatCurrency(hourlyRate)}/hour` 
            : 'No earnings during off hours'
          }
        </p>
      </motion.div>
      
      {/* 3D Toilet Paper Roll */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <ToiletPaperRoll 
          progress={progress} 
          isRunning={isRunning}
          className="mx-auto"
        />
      </motion.div>
      
      {/* Timer Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-8"
      >
        <div className="text-6xl font-display font-bold text-white mb-4 font-mono">
          {formatTime(elapsedTime)}
        </div>
        
        {/* Earnings Display */}
        <motion.div
          animate={{ scale: isRunning && currentEarnings > 0 ? [1, 1.05, 1] : 1 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center justify-center gap-2 text-2xl font-bold"
        >
          <DollarSign className="text-green-400" size={28} />
          <span className="text-green-400">
            {formatCurrency(currentEarnings)}
          </span>
        </motion.div>
        
        {isRunning && currentEarnings > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-dark-400 text-sm mt-2"
          >
            You're earning money right now! 💰
          </motion.p>
        )}
      </motion.div>
      
      {/* Control Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex gap-4 justify-center mb-8"
      >
        {!isRunning ? (
          <motion.button
            onClick={startTimer}
            disabled={loading}
            className="btn-primary flex items-center gap-3 text-xl py-4 px-8"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Play size={24} />
                <span>Start Session</span>
              </>
            )}
          </motion.button>
        ) : (
          <motion.button
            onClick={handleStop}
            disabled={loading}
            className="btn-secondary flex items-center gap-3 text-xl py-4 px-8"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Square size={24} />
                <span>End Session</span>
              </>
            )}
          </motion.button>
        )}
      </motion.div>
      
      {/* Session Stats */}
      {isRunning && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="card p-4 text-center">
            <Clock className="text-blue-400 mx-auto mb-2" size={24} />
            <p className="text-dark-400 text-sm">Duration</p>
            <p className="text-white text-lg font-bold">{formatTime(elapsedTime)}</p>
          </div>
          
          <div className="card p-4 text-center">
            <DollarSign className="text-green-400 mx-auto mb-2" size={24} />
            <p className="text-dark-400 text-sm">Earnings</p>
            <p className="text-green-400 text-lg font-bold">
              {formatCurrency(currentEarnings)}
            </p>
          </div>
        </motion.div>
      )}
      
      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmStop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowConfirmStop(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">🚽</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  End Session?
                </h3>
                <p className="text-dark-400 mb-6">
                  You've been going for {formatTime(elapsedTime)} and earned {formatCurrency(currentEarnings)}!
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmStop(false)}
                    className="btn-ghost flex-1"
                  >
                    Keep Going
                  </button>
                  <button
                    onClick={confirmStop}
                    className="btn-primary flex-1"
                  >
                    End Session
                  </button>
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