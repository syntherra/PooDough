// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIhBlnJcYDGftYIzhLPawqjvSzbbMz2b4",
  authDomain: "poodough-404e5.firebaseapp.com",
  projectId: "poodough-404e5",
  storageBucket: "poodough-404e5.firebasestorage.app",
  messagingSenderId: "891825182935",
  appId: "1:891825182935:web:fe5861213fb5d02148f892",
  measurementId: "G-11912L727M"
}

// Initialize Firebase in service worker
firebase.initializeApp(firebaseConfig)

// Get messaging instance
const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload)
  
  const notificationTitle = payload.notification?.title || 'PooDough'
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: payload.data?.type || 'general',
    data: payload.data,
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/favicon.ico'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()
  
  if (event.action === 'view' || !event.action) {
    const notificationData = event.notification.data
    let targetUrl = '/'
    
    // Route to specific pages based on notification type
    if (notificationData?.type === 'rank_overtaken') {
      targetUrl = '/leaderboard'
    } else if (notificationData?.type === 'friend_request' || notificationData?.type === 'friend_accepted') {
      targetUrl = '/leaderboard' // Friends are managed on leaderboard page
    }
    
    // Open the app when notification is clicked
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // If app is already open, focus it and navigate
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              client.postMessage({
                type: 'NOTIFICATION_CLICK',
                data: notificationData,
                targetUrl: targetUrl
              })
              return client.focus()
            }
          }
          // If app is not open, open it with the target URL
          if (clients.openWindow) {
            return clients.openWindow(targetUrl)
          }
        })
    )
  }
})