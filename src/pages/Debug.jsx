import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

function Debug() {
  const { user, userProfile, updateUserProfile, testDatabaseOperations, signInWithGoogle } = useAuth()
  const [testResult, setTestResult] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      await signInWithGoogle()
      toast.success('Sign-in successful!')
    } catch (error) {
      console.error('Sign-in failed:', error)
      toast.error('Sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  const handleTestDatabase = async () => {
    try {
      setLoading(true)
      setTestResult('Running database tests...')
      await testDatabaseOperations()
      setTestResult('Database tests completed - check console for details')
    } catch (error) {
      setTestResult(`Database test failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleTestProfileUpdate = async () => {
    if (!user) {
      toast.error('Please sign in first')
      return
    }

    try {
      setLoading(true)
      setTestResult('Testing profile update...')
      
      const testData = {
        testField: 'debug-test-' + Date.now(),
        currency: 'USD',
        salary: 50000,
        onboardingCompleted: true
      }

      await updateUserProfile(testData, false)
      setTestResult('Profile update successful!')
      toast.success('Profile updated successfully!')
    } catch (error) {
      setTestResult(`Profile update failed: ${error.message}`)
      toast.error('Profile update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <h1 className="text-2xl font-bold text-white mb-6">Debug Page</h1>
          
          {/* User Status */}
          <div className="mb-6 p-4 bg-slate-800 rounded-lg">
            <h2 className="text-lg font-semibold text-white mb-2">User Status</h2>
            <p className="text-gray-300">Authenticated: {user ? '✅ Yes' : '❌ No'}</p>
            {user && (
              <>
                <p className="text-gray-300">User ID: {user.uid}</p>
                <p className="text-gray-300">Email: {user.email}</p>
                <p className="text-gray-300">Display Name: {user.displayName}</p>
              </>
            )}
            <p className="text-gray-300">Profile Loaded: {userProfile ? '✅ Yes' : '❌ No'}</p>
            {userProfile && (
              <div className="mt-2">
                <p className="text-gray-300">Profile Data:</p>
                <pre className="text-xs text-gray-400 bg-slate-900 p-2 rounded mt-1 overflow-auto">
                  {JSON.stringify(userProfile, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Test Buttons */}
          <div className="space-y-4">
            {!user && (
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Signing in...' : 'Sign in with Google'}
              </button>
            )}

            {user && (
              <>
                <button
                  onClick={handleTestDatabase}
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? 'Testing...' : 'Test Database Operations'}
                </button>

                <button
                  onClick={handleTestProfileUpdate}
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? 'Testing...' : 'Test Profile Update'}
                </button>
              </>
            )}
          </div>

          {/* Test Results */}
          {testResult && (
            <div className="mt-6 p-4 bg-slate-800 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Test Results</h3>
              <p className="text-gray-300">{testResult}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">Instructions</h3>
            <ol className="text-blue-300 text-sm space-y-1">
              <li>1. Sign in with Google first</li>
              <li>2. Test database operations to check connectivity</li>
              <li>3. Test profile update to identify issues</li>
              <li>4. Check browser console for detailed logs</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Debug