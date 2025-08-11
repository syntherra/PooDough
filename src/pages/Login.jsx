import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Chrome } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/LoadingSpinner'

function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: ''
  })
  
  const { signIn, signUp, signInWithGoogle } = useAuth()
  
  const handleSubmit = async (e) => {
    e.preventDefault()
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
            Get paid to poop! 💩💰
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
                  className="input-field w-full"
                  placeholder="Enter your display name"
                  required={isSignUp}
                />
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