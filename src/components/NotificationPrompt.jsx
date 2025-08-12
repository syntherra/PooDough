import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import notificationService from '../services/notificationService'
import toast from 'react-hot-toast'

const NotificationPrompt = () => {
  const { user } = useAuth()
  const [showPrompt, setShowPrompt] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const checkNotificationStatus = () => {
      if (!user || !notificationService.isSupported) return

      // Check if user has already granted or denied permission
      const permission = Notification.permission
      const hasSeenPrompt = localStorage.getItem(`notification-prompt-seen-${user.uid}`)
      
      // Show prompt if permission is default (not granted/denied) and user hasn't seen prompt
      if (permission === 'default' && !hasSeenPrompt) {
        setShowPrompt(true)
      }
    }

    // Check immediately and also after a short delay to ensure user is fully loaded
    checkNotificationStatus()
    const timer = setTimeout(checkNotificationStatus, 2000)

    return () => clearTimeout(timer)
  }, [user])

  const handleEnableNotifications = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const granted = await notificationService.requestPermission()
      
      if (granted) {
        // Get FCM token and save to user profile
        await notificationService.getFCMToken(user.uid)
        toast.success('🔔 Notifications enabled! You\'ll now receive updates about friend requests and leaderboard changes.')
      } else {
        toast.error('Notifications were denied. You can enable them later in your browser settings.')
      }
      
      // Mark that user has seen the prompt
      localStorage.setItem(`notification-prompt-seen-${user.uid}`, 'true')
      setShowPrompt(false)
    } catch (error) {
      console.error('Error enabling notifications:', error)
      toast.error('Failed to enable notifications')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = () => {
    if (!user) return
    
    // Mark that user has seen the prompt
    localStorage.setItem(`notification-prompt-seen-${user.uid}`, 'true')
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-4 text-white">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              🔔
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold mb-1">
              Stay in the Loop!
            </h3>
            <p className="text-xs text-white/90 mb-3">
              Get notified when friends send requests or when someone overtakes your leaderboard position!
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleEnableNotifications}
                disabled={isLoading}
                className="flex-1 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded text-xs font-medium transition-colors"
              >
                {isLoading ? 'Enabling...' : 'Enable'}
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 text-xs text-white/70 hover:text-white transition-colors"
              >
                Later
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotificationPrompt