import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import notificationService from '../services/notificationService'
import toast from 'react-hot-toast'

const NotificationSettings = () => {
  const { user } = useAuth()
  const [notificationStatus, setNotificationStatus] = useState('checking')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    checkNotificationStatus()
  }, [user])

  const checkNotificationStatus = () => {
    if (!user || !notificationService.isSupported) {
      setNotificationStatus('unsupported')
      return
    }

    const permission = Notification.permission
    setNotificationStatus(permission)
  }

  const handleEnableNotifications = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const granted = await notificationService.requestPermission()
      
      if (granted) {
        // Get FCM token and save to user profile
        await notificationService.getFCMToken(user.uid)
        setNotificationStatus('granted')
        toast.success('🔔 Notifications enabled successfully!')
      } else {
        setNotificationStatus('denied')
        toast.error('Notifications were denied. Please enable them in your browser settings.')
      }
    } catch (error) {
      console.error('Error enabling notifications:', error)
      toast.error('Failed to enable notifications')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusDisplay = () => {
    switch (notificationStatus) {
      case 'granted':
        return {
          icon: '✅',
          text: 'Enabled',
          description: 'You\'ll receive notifications for friend requests and leaderboard changes.',
          color: 'text-green-400'
        }
      case 'denied':
        return {
          icon: '❌',
          text: 'Disabled',
          description: 'Notifications are blocked. Enable them in your browser settings to receive updates.',
          color: 'text-red-400'
        }
      case 'default':
        return {
          icon: '⚠️',
          text: 'Not Set',
          description: 'Click to enable notifications for friend requests and leaderboard updates.',
          color: 'text-yellow-400'
        }
      case 'unsupported':
        return {
          icon: '🚫',
          text: 'Unsupported',
          description: 'Your browser or device doesn\'t support push notifications.',
          color: 'text-gray-400'
        }
      default:
        return {
          icon: '⏳',
          text: 'Checking...',
          description: 'Checking notification status...',
          color: 'text-gray-400'
        }
    }
  }

  const status = getStatusDisplay()

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{status.icon}</span>
            <h3 className="text-lg font-semibold text-white">
              Push Notifications
            </h3>
            <span className={`text-sm font-medium ${status.color}`}>
              {status.text}
            </span>
          </div>
          <p className="text-sm text-gray-300 mb-4">
            {status.description}
          </p>
          
          {notificationStatus === 'granted' && (
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <span>👥</span>
                <span>Friend request notifications</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🏆</span>
                <span>Leaderboard rank change alerts (Top 5)</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex-shrink-0 ml-4">
          {(notificationStatus === 'default' || notificationStatus === 'denied') && (
            <button
              onClick={handleEnableNotifications}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-white font-medium transition-colors"
            >
              {isLoading ? 'Enabling...' : 'Enable'}
            </button>
          )}
          
          {notificationStatus === 'granted' && (
            <button
              onClick={checkNotificationStatus}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white font-medium transition-colors"
            >
              Refresh
            </button>
          )}
        </div>
      </div>
      
      {notificationStatus === 'denied' && (
        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
          <p className="text-sm text-yellow-300">
            <strong>How to enable notifications:</strong>
          </p>
          <ol className="text-xs text-yellow-200 mt-1 space-y-1 ml-4">
            <li>1. Click the lock icon in your browser's address bar</li>
            <li>2. Set "Notifications" to "Allow"</li>
            <li>3. Refresh this page and click "Enable" again</li>
          </ol>
        </div>
      )}
    </div>
  )
}

export default NotificationSettings