import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Square, ArrowLeft, Coins, Clock } from 'lucide-react'
import { useTimer } from '../hooks/useTimer'
import { useAuth } from '../hooks/useAuth'
import { useCurrency } from '../contexts/CurrencyContext'
import { useNavigate } from 'react-router-dom'
import Confetti from 'react-confetti'
import LoadingSpinner from '../components/LoadingSpinner'
import PoopClockTimer from '../components/PoopClockTimer'
import FallingDollars from '../components/FallingDollars'

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
  const [milliseconds, setMilliseconds] = useState(0)
  
  // Update window size for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Update milliseconds counter for more engaging display during sessions
  useEffect(() => {
    let interval = null
    
    if (isRunning) {
      interval = setInterval(() => {
        setMilliseconds(prev => (prev + 1) % 100)
      }, 10) // Update every 10ms
    } else {
      setMilliseconds(0)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning])
  
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
      
      {/* Falling Dollars Animation */}
      <FallingDollars isActive={isRunning} />
      
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-2 left-2 z-10"
      >
        <button
          onClick={() => navigate('/home')}
          className="p-3 rounded-full bg-dark-800 hover:bg-dark-700 text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
      </motion.div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-0 sm:p-1 pt-4 pb-4 min-h-0">
        {/* Toilet Paper Animation with top spacing for status text */}
        <div className="flex-1 flex items-center justify-center relative min-h-0 -mb-24">
          <PoopClockTimer 
                  isRunning={isRunning}
                  elapsedTime={elapsedTime}
                />
        </div>
        
        {/* Bottom Stats and Controls */}
        <div className="space-y-1 flex-shrink-0 mb-1">
          {/* Timer Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-lg sm:text-xl md:text-2xl font-display font-bold text-white mb-1 font-mono">
              {isRunning ? `${formatTime(elapsedTime)}.${milliseconds.toString().padStart(2, '0')}` : formatTime(elapsedTime)}
            </div>
            
            {/* Earnings Display */}
            {isRunning && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-1 text-sm sm:text-base font-bold mb-0"
              >
                <span className="text-green-400 text-base">💰</span>
                <span className="text-green-400">
                  {isRunning ? formatCurrency(currentEarnings, { maximumFractionDigits: 4 }) : formatCurrency(currentEarnings)}
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Control Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            {!isRunning ? (
              <motion.button
                onClick={startTimer}
                disabled={loading}
                className="btn-primary flex items-center gap-2 text-base sm:text-lg py-3 px-6 sm:py-4 sm:px-8 rounded-xl"
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Play size={24} />
                    <span>Start Pooping! 💩</span>
                  </>
                )}
              </motion.button>
            ) : (
              <motion.button
                onClick={handleStop}
                disabled={loading}
                className="btn-secondary flex items-center gap-2 text-base sm:text-lg py-3 px-6 sm:py-4 sm:px-8 rounded-xl"
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Square size={24} />
                    <span>Flush & Finish! 🚽</span>
                  </>
                )}
              </motion.button>
            )}
          </motion.div>
        </div>
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
                  Poop Session Complete! 💩
                </h3>
                <p className="text-dark-400 mb-4">
                  Holy crap! You just got paid to poop! Here's your bathroom breakdown:
                </p>
                
                {/* Session Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center p-3 bg-dark-800 rounded-lg">
                    <span className="text-dark-300">Throne Time</span>
                    <span className="text-white font-bold">{formatTime(lastSession.duration)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-dark-800 rounded-lg">
                    <span className="text-dark-300">Poop Profit</span>
                    <span className="text-green-400 font-bold">{formatCurrency(lastSession.earnings)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-dark-800 rounded-lg">
                    <span className="text-dark-300">Poop Type</span>
                    <span className={`font-bold ${
                      lastSession.wasWorkHours ? 'text-green-400' : 'text-orange-400'
                    }`}>
                      {lastSession.wasWorkHours ? 'Paid Poop Break! 💰' : 'Personal Throne Time 🚽'}
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
                  View Poop Log 📜
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