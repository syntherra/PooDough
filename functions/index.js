const { onDocumentCreated } = require('firebase-functions/v2/firestore')
const { initializeApp } = require('firebase-admin/app')
const { getMessaging } = require('firebase-admin/messaging')
const { getFirestore } = require('firebase-admin/firestore')

// Initialize Firebase Admin
initializeApp()

const db = getFirestore()
const messaging = getMessaging()

// Function to send push notifications when a notification document is created
exports.sendPushNotification = onDocumentCreated('notifications/{notificationId}', async (event) => {
  const notification = event.data.data()
  const { toUserId, title, body, data } = notification

  try {
    // Get the user's FCM token
    const userDoc = await db.collection('users').doc(toUserId).get()
    
    if (!userDoc.exists) {
      console.error('User not found:', toUserId)
      return
    }

    const userData = userDoc.data()
    const fcmToken = userData.fcmToken

    if (!fcmToken) {
      console.log('No FCM token found for user:', toUserId)
      return
    }

    // Prepare the message
    const message = {
      token: fcmToken,
      notification: {
        title: title,
        body: body,
      },
      data: {
        ...data,
        // Convert all data values to strings (FCM requirement)
        type: data.type || '',
        fromUserName: data.fromUserName || '',
        acceptedByName: data.acceptedByName || '',
        overtakenByName: data.overtakenByName || '',
        newRank: data.newRank ? data.newRank.toString() : '',
        oldRank: data.oldRank ? data.oldRank.toString() : '',
        lostTitle: data.lostTitle || ''
      },
      // Configure for both Android and iOS
      android: {
        notification: {
          icon: 'ic_notification',
          color: '#8B5CF6', // Primary purple color
          sound: 'default'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    }

    // Send the message
    const response = await messaging.send(message)
    console.log('Successfully sent message:', response)

    // Update the notification status
    await event.data.ref.update({
      status: 'sent',
      sentAt: new Date(),
      messageId: response
    })

  } catch (error) {
    console.error('Error sending push notification:', error)
    
    // Update the notification status with error
    await event.data.ref.update({
      status: 'failed',
      error: error.message,
      failedAt: new Date()
    })
  }
})

// Function to clean up old notifications (optional)
exports.cleanupOldNotifications = require('firebase-functions').pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 7) // Delete notifications older than 7 days

    const oldNotifications = await db.collection('notifications')
      .where('createdAt', '<', cutoff)
      .get()

    const batch = db.batch()
    oldNotifications.docs.forEach(doc => {
      batch.delete(doc.ref)
    })

    await batch.commit()
    console.log(`Cleaned up ${oldNotifications.size} old notifications`)
  })