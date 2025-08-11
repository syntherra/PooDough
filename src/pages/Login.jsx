import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Chrome } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null, message: '' })
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: ''
  })
  
  const { signIn, signUp, signInWithGoogle, checkDisplayNameAvailability } = useAuth()
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Check username availability for signup
    if (isSignUp) {
      if (usernameStatus.available === false) {
        toast.error('Please choose a different username')
        return
      }
      
      if (usernameStatus.checking) {
        toast.error('Please wait while we check username availability')
        return
      }
    }
    
    setLoading(true)
    
    try {
      if (isSignUp) {
        await signUp(formData.email, formData.password, formData.displayName)
      } else {
        await signIn(formData.email, formData.password)
      }
    } catch (error) {
      console.error('Auth error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Google sign in error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Debounced username availability check
  const checkUsernameAvailability = useCallback(
    async (displayName) => {
      if (!displayName || !isSignUp) {
        setUsernameStatus({ checking: false, available: null, message: '' })
        return
      }

      setUsernameStatus({ checking: true, available: null, message: 'Checking availability...' })
      
      try {
        const result = await checkDisplayNameAvailability(displayName)
        setUsernameStatus({
          checking: false,
          available: result.available,
          message: result.message
        })
      } catch (error) {
        setUsernameStatus({
          checking: false,
          available: false,
          message: 'Error checking availability'
        })
      }
    },
    [checkDisplayNameAvailability, isSignUp]
  )

  // Debounce the username check
  useEffect(() => {
    if (!isSignUp) {
      setUsernameStatus({ checking: false, available: null, message: '' })
      return
    }
    
    const timeoutId = setTimeout(() => {
      checkUsernameAvailability(formData.displayName)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [formData.displayName, checkUsernameAvailability, isSignUp])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }
  
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-6xl mb-4"
          >
            🧻
          </motion.div>
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">
            PooDough
          </h1>
          <p className="text-gray-400 text-lg">
            Turn your bathroom breaks into cold hard cash! 💩💰
          </p>
        </div>
        
        {/* Auth Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display Name (Sign Up Only) */}
            {isSignUp && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className={`input-field w-full ${
                    usernameStatus.available === false ? 'border-red-500' : 
                    usernameStatus.available === true ? 'border-green-500' : ''
                  }`}
                  placeholder="Enter your display name"
                  required={isSignUp}
                />
                {usernameStatus.message && (
                  <p className={`text-xs mt-1 ${
                    usernameStatus.checking ? 'text-gray-400' :
                    usernameStatus.available === false ? 'text-red-400' :
                    usernameStatus.available === true ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    {usernameStatus.message}
                  </p>
                )}
              </motion.div>
            )}
            
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field w-full pl-12"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-field w-full pl-12 pr-12"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              )}
            </motion.button>
          </form>
          
          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-700"></div>
            <span className="px-4 text-gray-400 text-sm">or</span>
            <div className="flex-1 border-t border-gray-700"></div>
          </div>
          
          {/* Google Sign In */}
          <motion.button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="btn-ghost w-full flex items-center justify-center gap-3"
            whileTap={{ scale: 0.98 }}
          >
            <Chrome size={20} className="text-blue-400" />
            <span>Continue with Google</span>
          </motion.button>
          
          {/* Toggle Sign Up/Sign In */}
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-orange-400 hover:text-orange-300 transition-colors text-sm"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </motion.div>
        
        {/* Fun Facts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-dark-400 text-sm"
        >
          <p>💡 Fun fact: The average person spends 3 years of their life on the toilet!</p>
          <p className="mt-2">Why not get paid for it? 😄</p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Login