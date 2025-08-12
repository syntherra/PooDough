# Push Notifications Setup Guide

This guide will help you set up push notifications for friend requests, acceptances, and leaderboard rank changes in PooDough.

## Prerequisites

- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project with Firestore and Authentication enabled
- Web app registered in Firebase Console

## Step 1: Generate VAPID Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon)
4. Click on **Cloud Messaging** tab
5. Scroll down to **Web configuration**
6. Click **Generate key pair** to create a VAPID key
7. Copy the generated key

## Step 2: Update VAPID Key in Code

1. Open `src/services/notificationService.js`
2. Replace `YOUR_VAPID_KEY_HERE` with your actual VAPID key:

```javascript
const VAPID_KEY = 'your-actual-vapid-key-here'
```

## Step 3: Deploy Firebase Functions

1. Install Firebase CLI if not already installed:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project (if not done already):
```bash
firebase init
```
- Select **Functions** and **Firestore**
- Choose your existing Firebase project
- Select JavaScript for functions
- Install dependencies when prompted

4. Install function dependencies:
```bash
cd functions
npm install
cd ..
```

5. Deploy the functions:
```bash
firebase deploy --only functions
```

## Step 4: Update Firestore Security Rules

Add these rules to your `firestore.rules` file to allow the notification system:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ... your existing rules ...
    
    // Allow users to create notifications
    match /notifications/{notificationId} {
      allow create: if request.auth != null;
      allow read, update: if request.auth != null && 
        (resource.data.toUserId == request.auth.uid || 
         resource.data.fromUserId == request.auth.uid);
    }
  }
}
```

## Step 5: Test Push Notifications

1. Build and serve your app:
```bash
npm run build
npm run preview
```

2. Open the app in two different browsers or incognito windows
3. Create two different user accounts
4. Send a friend request from one user to another
5. Check if the notification appears

## How It Works

1. **User Login**: When a user logs in, the notification service initializes and:
   - Requests notification permission
   - Gets an FCM token
   - Saves the token to the user's profile in Firestore
   - Sets up foreground message listener

2. **Friend Request**: When a user sends a friend request:
   - A friend request document is created in Firestore
   - A notification document is created with the recipient's user ID
   - The Firebase Function detects the new notification document
   - The function looks up the recipient's FCM token
   - A push notification is sent to the recipient's device

3. **Friend Acceptance**: When a user accepts a friend request:
   - The friendship is created in Firestore
   - A notification document is created for the original sender
   - The Firebase Function sends a push notification to the sender

4. **Rank Overtaken**: When a user is surpassed in the top 5 leaderboard positions:
   - The leaderboard component monitors real-time changes in user rankings
   - When a top 5 user is overtaken, a notification document is created
   - The Firebase Function sends a push notification to the overtaken user
   - The notification includes details about who overtook them and their new rank

## Troubleshooting

### Notifications Not Appearing

1. **Check browser permissions**: Ensure notifications are allowed for your domain
2. **Check VAPID key**: Make sure you're using the correct VAPID key
3. **Check FCM token**: Look in browser console for FCM token generation errors
4. **Check function logs**: Use `firebase functions:log` to see function execution logs

### Service Worker Issues

1. **Clear cache**: Clear browser cache and reload
2. **Check service worker registration**: Look in browser DevTools > Application > Service Workers
3. **Verify file location**: Ensure `firebase-messaging-sw.js` is in the `public` folder

### Function Deployment Issues

1. **Check Node.js version**: Functions require Node.js 18
2. **Check billing**: Cloud Functions require a paid Firebase plan (Blaze)
3. **Check permissions**: Ensure your Firebase account has proper permissions

## Testing in Development

For local testing, you can use Firebase Emulators:

```bash
firebase emulators:start
```

This will start local emulators for Functions, Firestore, and other Firebase services.

## Production Considerations

1. **Rate Limiting**: Consider implementing rate limiting for friend requests
2. **Error Handling**: Monitor function errors and failed notifications
3. **Token Refresh**: Implement FCM token refresh handling
4. **Unsubscribe**: Allow users to disable notifications in settings
5. **Batch Processing**: For high volume, consider batching notifications

## Security Notes

- Never expose your VAPID key in client-side code
- Validate all notification data on the server side
- Implement proper authentication checks in Firestore rules
- Consider implementing notification preferences per user