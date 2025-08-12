import { messaging, getToken, onMessage } from '../lib/firebase'
import { doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import toast from 'react-hot-toast'

// VAPID key - you'll need to generate this in Firebase Console
// Go to Project Settings > Cloud Messaging > Web configuration
// For now using a placeholder - replace with your actual VAPID key
const VAPID_KEY = 'YOUR_VAPID_KEY_HERE'

class NotificationService {
  constructor() {
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator
    this.permission = this.isSupported ? Notification.permission : 'denied'
  }

  // Request notification permission
  async requestPermission() {
    if (!this.isSupported) {
      console.warn('Notifications not supported')
      return false
    }

    if (this.permission === 'granted') {
      return true
    }

    try {
      const permission = await Notification.requestPermission()
      this.permission = permission
      return permission === 'granted'
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }

  // Get FCM token
  async getFCMToken(userId) {
    if (!messaging || !this.isSupported) {
      console.warn('FCM not available')
      return null
    }

    try {
      const hasPermission = await this.requestPermission()
      if (!hasPermission) {
        console.warn('Notification permission denied')
        return null
      }

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY
      })

      if (token && userId) {
        // Save token to user profile
        await updateDoc(doc(db, 'users', userId), {
          fcmToken: token,
          tokenUpdatedAt: serverTimestamp()
        })
      }

      return token
    } catch (error) {
      console.error('Error getting FCM token:', error)
      return null
    }
  }

  // Listen for foreground messages
  setupForegroundListener() {
    if (!messaging) return

    onMessage(messaging, (payload) => {
      console.log('Received foreground message:', payload)
      
      const { notification, data } = payload
      
      // Show toast notification
      if (notification) {
        toast.success(notification.body || 'New notification', {
          duration: 5000,
          icon: '🔔'
        })
      }

      // Handle different notification types
      if (data?.type === 'friend_request') {
        // Could trigger a refresh of friend requests
        window.dispatchEvent(new CustomEvent('friendRequestReceived', { detail: data }))
      } else if (data?.type === 'friend_accepted') {
        // Could trigger a refresh of friends list
        window.dispatchEvent(new CustomEvent('friendRequestAccepted', { detail: data }))
      } else if (data?.type === 'rank_overtaken') {
        // Could trigger a refresh of leaderboard
        window.dispatchEvent(new CustomEvent('rankOvertaken', { detail: data }))
      }
    })
  }

  // Send notification via Firebase Functions (you'll need to create this)
  async sendNotification(toUserId, notification, data = {}) {
    try {
      // This would typically call a Firebase Function
      // For now, we'll create a notification document that triggers a function
      await addDoc(collection(db, 'notifications'), {
        toUserId,
        title: notification.title,
        body: notification.body,
        data,
        status: 'pending',
        createdAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  // Send friend request notification
  async sendFriendRequestNotification(toUserId, fromUserName) {
    await this.sendNotification(toUserId, {
      title: 'New Friend Request! 👥',
      body: `${fromUserName} wants to be your poop buddy!`
    }, {
      type: 'friend_request',
      fromUserName
    })
  }

  // Send friend request accepted notification
  async sendFriendAcceptedNotification(toUserId, acceptedByName) {
    await this.sendNotification(toUserId, {
      title: 'Friend Request Accepted! 🎉',
      body: `${acceptedByName} accepted your friend request!`
    }, {
      type: 'friend_accepted',
      acceptedByName
    })
  }

  // Send rank overtaken notification (for top 5 positions only)
  async sendRankOvertakenNotification(toUserId, overtakenByName, newRank, oldRank) {
    // Only send notifications for top 5 positions
    if (oldRank > 5) return
    
    const rankTitles = {
      1: 'Porcelain Emperor 👑',
      2: 'Flush Master 🥈', 
      3: 'Toilet Titan 🥉',
      4: 'Bathroom Baron 🏆',
      5: 'Restroom Royalty 👸'
    }
    
    const lostTitle = rankTitles[oldRank] || `#${oldRank}`
    
    await this.sendNotification(toUserId, {
      title: 'You\'ve Been Overtaken! 😱',
      body: `${overtakenByName} just passed you! You lost your ${lostTitle} position.`
    }, {
      type: 'rank_overtaken',
      overtakenByName,
      newRank,
      oldRank,
      lostTitle
    })
  }

  // Check if user has previously dismissed notifications
  hasUserDismissedPrompt(userId) {
    return localStorage.getItem(`notification-prompt-seen-${userId}`) === 'true'
  }

  // Reset user's notification prompt preference (useful for re-prompting)
  resetPromptPreference(userId) {
    localStorage.removeItem(`notification-prompt-seen-${userId}`)
  }

  // Get current notification status with detailed info
  getNotificationStatus() {
    if (!this.isSupported) {
      return { status: 'unsupported', canPrompt: false }
    }

    const permission = Notification.permission
    return {
      status: permission,
      canPrompt: permission === 'default',
      isBlocked: permission === 'denied',
      isEnabled: permission === 'granted'
    }
  }

  // Initialize service
  async initialize(userId) {
    if (!this.isSupported) {
      console.warn('Notifications not supported on this device')
      return false
    }

    try {
      // Register service worker
      await navigator.serviceWorker.register('/firebase-messaging-sw.js')
      
      // Get FCM token (this will request permission if needed)
      const token = await this.getFCMToken(userId)
      
      // Setup foreground listener
      this.setupForegroundListener()
      
      console.log('Notification service initialized', { token })
      return true
    } catch (error) {
      console.error('Error initializing notification service:', error)
      return false
    }
  }
}

export default new NotificationService()