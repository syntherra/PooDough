# PooDough Mobile App Specification

## App Overview

**PooDough** is a humorous productivity app that tracks bathroom breaks and calculates earnings based on work hours. Users can time their "poop sessions," compete on leaderboards, add friends, and receive push notifications for social interactions and ranking changes.

### Core Concept
- Track bathroom break duration
- Calculate earnings based on hourly rate and work schedule
- Gamify the experience with leaderboards and achievements
- Social features with friends system
- Push notifications for engagement

## Key Features

### 1. Timer System
- **Start/Stop Timer**: Large, prominent buttons for starting and stopping sessions
- **Real-time Display**: Shows elapsed time with millisecond precision during active sessions
- **Earnings Calculator**: Real-time calculation of earnings based on time and hourly rate
- **Session Types**: Distinguishes between "Paid Poop Break" (work hours) vs "Personal Throne Time"
- **Visual Feedback**: Confetti animation and falling dollar signs during sessions

### 2. Session Summary Popup
After stopping timer, displays:
- 🎉 Celebration emoji and congratulatory message
- **Throne Time**: Session duration (HH:MM:SS format)
- **Poop Profit**: Calculated earnings with currency formatting
- **Poop Type**: Paid vs Personal based on work schedule
- **Leaderboard Rank**: Current user ranking with trophy icon
- **Action Buttons**: "View Poop Log" (navigate to history)
- **Sync Status**: Cloud sync confirmation

### 3. User Authentication
- Firebase Authentication integration
- Google Sign-in support
- User profile management
- Onboarding flow for new users

### 4. Onboarding Process
**Step 1: Welcome**
- App introduction with toilet emoji
- Humorous welcome message

**Step 2: Work Schedule Setup**
- Hourly rate input with currency selection
- Work start/end time configuration
- Work days selection (checkboxes for each day)
- Real-time calculation preview

**Step 3: Profile Setup**
- Display name input
- Profile completion

### 5. Home Dashboard
- **Quick Stats Cards**:
  - Total earnings with currency display
  - Total sessions count
  - Total time spent
  - Current streak
- **Recent Activity**: Last few sessions preview
- **Quick Actions**: Start timer, view history, leaderboard
- **Work Status Indicator**: Shows if currently in work hours

### 6. Timer Page
- **Animated Toilet Paper Roll**: Visual timer representation
- **Large Timer Display**: HH:MM:SS.MS format
- **Real-time Earnings**: Updates every second during sessions
- **Start/Stop Buttons**: Large, touch-friendly buttons
- **Falling Dollar Animation**: Visual feedback during active sessions
- **Back Navigation**: Return to home

### 7. History/Analytics
- **Filter Options**: All time, today, this week, this month
- **Session List**: Chronological list of all sessions
- **Daily Summaries**: Grouped by date with totals
- **Session Details**: Duration, earnings, type, timestamp
- **Statistics**: Total sessions, earnings, time, longest session
- **Export Options**: Data export functionality
- **Delete Options**: Clear history with confirmation

### 8. Leaderboard System
- **Global Leaderboard**: Top users by total time
- **Friends Leaderboard**: Competition among friends
- **Ranking System**: Positions 1-50+ with titles
- **Rank Titles**:
  - #1: "Porcelain Emperor" 👑
  - #2: "Flush Master" 🥈
  - #3: "Toilet Titan" 🥉
  - #4-10: "Bathroom Baron" 🏆
  - #11-25: "Restroom Royalty" 👸
  - #26-50: "Loo Legend" ⭐
- **User's Current Rank**: Highlighted position with stats
- **Real-time Updates**: Live rank change monitoring

### 9. Friends System
- **Add Friends**: Search by username
- **Friend Requests**: Send/receive/accept/decline
- **Friends List**: View friends' stats and rankings
- **Social Competition**: Friends-only leaderboard
- **Activity Feed**: Friends' recent sessions (optional)

### 10. Push Notifications
- **Friend Requests**: New friend request notifications
- **Friend Accepted**: Friend acceptance confirmations
- **Rank Overtaken**: When someone passes you in rankings
- **Notification Settings**: User control over notification types
- **Opt-in System**: Non-intrusive permission requests

### 11. Profile Management
- **Personal Info**: Display name, email (read-only)
- **Work Schedule**: Modify hourly rate, work hours, work days
- **Currency Settings**: Select preferred currency
- **Premium Status**: Upgrade options and benefits
- **Notification Preferences**: Manage push notification settings
- **Account Actions**: Sign out, delete account
- **Statistics Display**: Personal achievements and totals

### 12. Premium Features
- **Enhanced Analytics**: Detailed charts and insights
- **Custom Themes**: Additional UI themes
- **Export Data**: Advanced export options
- **Priority Support**: Enhanced customer support
- **Ad-free Experience**: Remove advertisements

## Technical Architecture

### Frontend Technology Stack
- **Framework**: React Native for cross-platform mobile development
- **Navigation**: React Navigation for screen transitions
- **State Management**: Context API for global state
- **Animations**: React Native Reanimated for smooth animations
- **UI Components**: Custom components with consistent styling
- **Icons**: React Native Vector Icons (Lucide icons equivalent)

### Backend Services
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Auth
- **Cloud Functions**: Firebase Functions for server-side logic
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **File Storage**: Firebase Storage (if needed)
- **Analytics**: Firebase Analytics

### Database Schema

#### Users Collection
```javascript
{
  uid: string, // Firebase Auth UID
  displayName: string,
  email: string,
  hourlyRate: number,
  currency: string, // 'USD', 'EUR', etc.
  workHoursStart: string, // '09:00'
  workHoursEnd: string, // '17:00'
  workDays: array, // [1,2,3,4,5] (Monday-Friday)
  totalSessions: number,
  totalEarnings: number,
  totalTime: number, // in seconds
  longestSession: number, // in seconds
  currentStreak: number,
  lastSessionAt: timestamp,
  isPremium: boolean,
  onboardingCompleted: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Sessions Collection
```javascript
{
  id: string,
  userId: string,
  startTime: timestamp,
  endTime: timestamp,
  duration: number, // in seconds
  earnings: number,
  wasWorkHours: boolean,
  createdAt: timestamp
}
```

#### Friends Collection
```javascript
{
  id: string,
  userId: string,
  friendId: string,
  status: string, // 'pending', 'accepted'
  createdAt: timestamp
}
```

#### Notifications Collection
```javascript
{
  id: string,
  userId: string, // recipient
  type: string, // 'friend_request', 'friend_accepted', 'rank_overtaken'
  title: string,
  body: string,
  data: object, // additional data
  read: boolean,
  createdAt: timestamp
}
```

### Key Contexts/State Management

#### AuthContext
- User authentication state
- User profile data
- Login/logout functions
- Profile update functions

#### TimerContext
- Timer state (running, elapsed time)
- Session management
- Earnings calculation
- Work hours detection
- Session history

#### CurrencyContext
- Currency formatting
- Multi-currency support
- Locale-specific formatting

### Core Utilities

#### Time Formatting
```javascript
formatTime(seconds) {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
```

#### Earnings Calculation
```javascript
calculateEarnings(timeInSeconds, hourlyRate) {
  const hoursWorked = timeInSeconds / 3600
  return hourlyRate * hoursWorked
}
```

#### Work Hours Detection
```javascript
isWorkHours(workStart, workEnd, workDays) {
  const now = new Date()
  const currentDay = now.getDay() // 0 = Sunday
  const currentTime = now.getHours() * 60 + now.getMinutes()
  
  // Check if current day is a work day
  if (!workDays.includes(currentDay)) return false
  
  // Check if current time is within work hours
  const [startHour, startMin] = workStart.split(':').map(Number)
  const [endHour, endMin] = workEnd.split(':').map(Number)
  const startTime = startHour * 60 + startMin
  const endTime = endHour * 60 + endMin
  
  return currentTime >= startTime && currentTime <= endTime
}
```

## UI/UX Design Specifications

### Color Scheme
- **Primary**: Blue tones (#3B82F6, #1D4ED8)
- **Secondary**: Green for earnings (#10B981, #059669)
- **Accent**: Yellow for highlights (#F59E0B, #D97706)
- **Background**: Dark theme (#111827, #1F2937, #374151)
- **Text**: White (#FFFFFF), Gray (#9CA3AF, #6B7280)
- **Error**: Red (#EF4444)
- **Success**: Green (#10B981)

### Typography
- **Headers**: Bold, large text for titles
- **Body**: Regular weight for content
- **Monospace**: For timer displays and numerical data
- **Font Sizes**: Responsive scaling for different screen sizes

### Component Styling

#### Buttons
- **Primary**: Blue background, white text, rounded corners
- **Secondary**: Gray background, white text
- **Large Touch Targets**: Minimum 44px height for mobile
- **Hover/Press States**: Visual feedback on interaction

#### Cards
- **Background**: Dark gray (#1F2937)
- **Border**: Subtle border or shadow
- **Padding**: Consistent spacing (16px)
- **Rounded Corners**: 8px border radius

#### Input Fields
- **Background**: Dark background with border
- **Focus State**: Blue border highlight
- **Placeholder**: Gray text
- **Validation**: Red border for errors

### Animations
- **Page Transitions**: Smooth slide animations
- **Loading States**: Spinner animations
- **Success Feedback**: Confetti and celebration animations
- **Micro-interactions**: Button press feedback, hover effects
- **Timer Animation**: Rotating toilet paper roll
- **Falling Dollars**: Animated dollar signs during sessions

### Mobile-Specific Considerations
- **Touch Targets**: Large, finger-friendly buttons
- **Swipe Gestures**: Navigation and actions
- **Pull-to-Refresh**: Data refresh functionality
- **Haptic Feedback**: Vibration for important actions
- **Safe Areas**: Respect device notches and home indicators
- **Orientation**: Portrait-first design with landscape support
- **Keyboard Handling**: Proper input field behavior

## Screen Layouts

### Navigation Structure
- **Tab Navigation**: Bottom tabs for main sections
  - Home (🏠)
  - Timer (⏱️)
  - History (📊)
  - Leaderboard (🏆)
  - Profile (👤)

### Home Screen
- **Header**: Welcome message, current time
- **Stats Grid**: 2x2 grid of key statistics
- **Quick Actions**: Large buttons for common tasks
- **Recent Activity**: Scrollable list of recent sessions

### Timer Screen
- **Full Screen**: Immersive timer experience
- **Central Animation**: Large toilet paper roll animation
- **Timer Display**: Prominent time and earnings
- **Control Button**: Large start/stop button
- **Back Button**: Top-left navigation

### History Screen
- **Filter Bar**: Time period selection
- **Session List**: Scrollable list with pull-to-refresh
- **Session Cards**: Individual session details
- **Summary Stats**: Daily/weekly/monthly totals

### Leaderboard Screen
- **Tab Switcher**: Global vs Friends leaderboards
- **User Rank Card**: Highlighted current position
- **Leaderboard List**: Ranked list of users
- **Add Friends**: Search and add functionality

### Profile Screen
- **User Info**: Display name, stats overview
- **Settings Sections**: Organized configuration options
- **Premium Upgrade**: Subscription options
- **Account Actions**: Sign out, delete account

## Push Notification System

### Notification Types
1. **Friend Request**: "👋 [Name] wants to be your poop buddy!"
2. **Friend Accepted**: "🎉 [Name] accepted your friend request!"
3. **Rank Overtaken**: "😱 [Name] just passed you on the leaderboard! You're now #[rank]"

### Implementation
- **FCM Integration**: Firebase Cloud Messaging
- **Token Management**: Store FCM tokens in user profiles
- **Server-side Triggers**: Cloud Functions for sending notifications
- **Client-side Handling**: Foreground and background notification handling
- **Deep Linking**: Navigate to specific screens from notifications

### Notification Settings
- **Granular Control**: Enable/disable by type
- **Quiet Hours**: Time-based notification blocking
- **Frequency Limits**: Prevent notification spam

## Data Synchronization

### Real-time Updates
- **Firestore Listeners**: Real-time data synchronization
- **Leaderboard Updates**: Live ranking changes
- **Friend Activity**: Real-time friend status updates
- **Session Sync**: Immediate session data upload

### Offline Support
- **Local Storage**: Cache critical data locally
- **Sync on Reconnect**: Upload pending data when online
- **Offline Indicators**: Show connection status
- **Graceful Degradation**: Limited functionality when offline

## Security & Privacy

### Data Protection
- **Firebase Security Rules**: Restrict data access
- **User Data Isolation**: Users can only access their own data
- **Friend Data Sharing**: Limited sharing of public profile data
- **Input Validation**: Sanitize all user inputs

### Privacy Features
- **Data Export**: Allow users to export their data
- **Account Deletion**: Complete data removal option
- **Minimal Data Collection**: Only collect necessary information
- **Transparent Privacy Policy**: Clear data usage explanation

## Performance Optimization

### Mobile Performance
- **Lazy Loading**: Load screens and data on demand
- **Image Optimization**: Compressed images and icons
- **Bundle Splitting**: Reduce initial app size
- **Memory Management**: Efficient component lifecycle

### Database Optimization
- **Query Limits**: Paginated data loading
- **Indexing**: Proper Firestore indexes for queries
- **Caching**: Cache frequently accessed data
- **Batch Operations**: Efficient bulk data operations

## Testing Strategy

### Unit Testing
- **Utility Functions**: Time formatting, calculations
- **Component Logic**: State management, user interactions
- **API Integration**: Firebase operations

### Integration Testing
- **User Flows**: Complete user journeys
- **Cross-platform**: iOS and Android compatibility
- **Device Testing**: Various screen sizes and capabilities

### User Testing
- **Usability Testing**: Interface intuitiveness
- **Performance Testing**: App responsiveness
- **Accessibility Testing**: Screen reader compatibility

## Deployment & Distribution

### App Store Requirements
- **iOS App Store**: Apple guidelines compliance
- **Google Play Store**: Android requirements
- **App Icons**: Multiple sizes and formats
- **Screenshots**: Store listing images
- **App Description**: Marketing copy and features

### Version Management
- **Semantic Versioning**: Clear version numbering
- **Release Notes**: Feature and bug fix documentation
- **Staged Rollouts**: Gradual feature releases
- **A/B Testing**: Feature variation testing

## Future Enhancements

### Potential Features
- **Apple Watch/Wear OS**: Smartwatch timer control
- **Widgets**: Home screen timer widgets
- **Siri/Google Assistant**: Voice commands
- **Social Sharing**: Share achievements on social media
- **Challenges**: Weekly/monthly competitions
- **Achievements**: Unlock badges and rewards
- **Dark/Light Themes**: Multiple UI themes
- **Localization**: Multi-language support

### Analytics & Insights
- **Usage Analytics**: App usage patterns
- **Performance Monitoring**: Crash reporting and performance metrics
- **User Feedback**: In-app feedback collection
- **Feature Usage**: Track feature adoption

## Development Guidelines

### Code Structure
- **Component Organization**: Logical file structure
- **Reusable Components**: Shared UI components
- **Custom Hooks**: Shared logic extraction
- **Type Safety**: TypeScript for type checking
- **Code Style**: Consistent formatting and naming

### Error Handling
- **Graceful Failures**: User-friendly error messages
- **Retry Logic**: Automatic retry for failed operations
- **Fallback UI**: Alternative content for errors
- **Error Reporting**: Crash and error tracking

### Accessibility
- **Screen Reader Support**: Proper ARIA labels
- **High Contrast**: Accessible color combinations
- **Font Scaling**: Respect system font size settings
- **Voice Control**: Voice navigation support

This specification provides a comprehensive blueprint for recreating PooDough as a mobile application while maintaining all the core functionality, user experience, and technical architecture of the original web application.