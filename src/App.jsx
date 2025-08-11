import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Home from './pages/Home'
import Timer from './pages/Timer'
import History from './pages/History'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import Premium from './pages/Premium'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const { user, loading, userProfile } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/onboarding" element={user ? <Onboarding /> : <Navigate to="/login" />} />
        
        {/* Protected routes */}
        <Route path="/*" element={
          !user ? <Navigate to="/login" replace /> :
          userProfile === null ? (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
              <LoadingSpinner size="xl" />
            </div>
          ) :
          !userProfile.onboardingCompleted ? <Navigate to="/onboarding" replace /> :
          <Layout />
        }>
          <Route path="" element={<Navigate to="home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="timer" element={<Timer />} />
          <Route path="history" element={<History />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="premium" element={<Premium />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App