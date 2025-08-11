import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Crown, 
  Check, 
  Star, 
  Zap, 
  TrendingUp,
  Users,
  Palette,
  BarChart3,
  Shield,
  Sparkles
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

function Premium() {
  const { userProfile, updateUserProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('monthly')
  
  const plans = {
    monthly: {
      name: 'Monthly',
      price: 4.99,
      period: 'month',
      savings: null
    },
    yearly: {
      name: 'Yearly',
      price: 39.99,
      period: 'year',
      savings: '33% off'
    }
  }
  
  const premiumFeatures = [
    {
      icon: Palette,
      title: 'Exclusive Toilet Paper Designs',
      description: 'Unlock premium animated toilet paper roll themes and colors',
      color: 'text-purple-400'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Detailed insights, trends, and earning predictions',
      color: 'text-blue-400'
    },
    {
      icon: Users,
      title: 'Private Leaderboards',
      description: 'Create custom competitions with friends and colleagues',
      color: 'text-green-400'
    },
    {
      icon: TrendingUp,
      title: 'Earning Optimization',
      description: 'AI-powered suggestions to maximize your bathroom earnings',
      color: 'text-yellow-400'
    },
    {
      icon: Shield,
      title: 'Priority Support',
      description: 'Get help faster with premium customer support',
      color: 'text-red-400'
    },
    {
      icon: Sparkles,
      title: 'Early Access',
      description: 'Be the first to try new features and updates',
      color: 'text-cyan-400'
    }
  ]
  
  const handleUpgrade = async () => {
    setLoading(true)
    try {
      // In a real app, this would integrate with Stripe
      // For demo purposes, we'll just simulate the upgrade
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      await updateUserProfile({
        isPremium: true,
        premiumSince: new Date(),
        subscriptionPlan: selectedPlan
      })
      
      toast.success('Welcome to Premium! 👑')
    } catch (error) {
      console.error('Upgrade error:', error)
      toast.error('Failed to upgrade. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  // If user is already premium
  if (userProfile?.isPremium) {
    return (
      <div className="min-h-screen bg-dark-900 p-4 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="text-8xl mb-6">👑</div>
          <h1 className="text-4xl font-display font-bold gradient-text mb-4">
            You're Premium!
          </h1>
          <p className="text-dark-400 text-lg mb-8">
            Enjoy all the exclusive features and benefits
          </p>
          
          <div className="card p-6 max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-white mb-4">
              Your Premium Benefits
            </h3>
            <div className="space-y-3">
              {premiumFeatures.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="flex items-center gap-3">
                    <Icon size={20} className={feature.color} />
                    <span className="text-dark-300 text-sm">{feature.title}</span>
                    <Check size={16} className="text-green-400 ml-auto" />
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-dark-900 p-4 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="text-6xl mb-4">👑</div>
        <h1 className="text-4xl font-display font-bold gradient-text mb-2">
          Go Premium
        </h1>
        <p className="text-dark-400 text-lg">
          Unlock exclusive features and maximize your earnings!
        </p>
      </motion.div>
      
      {/* Pricing Plans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex bg-dark-800 rounded-xl p-1 mb-6">
          {Object.entries(plans).map(([key, plan]) => (
            <button
              key={key}
              onClick={() => setSelectedPlan(key)}
              className={`flex-1 relative py-4 px-6 rounded-lg font-medium transition-all ${
                selectedPlan === key
                  ? 'bg-primary-600 text-white'
                  : 'text-dark-400 hover:text-white'
              }`}
            >
              <div className="text-lg font-bold">{plan.name}</div>
              <div className="text-2xl font-bold">${plan.price}</div>
              <div className="text-sm opacity-75">per {plan.period}</div>
              {plan.savings && (
                <div className="absolute -top-2 -right-2 bg-accent-500 text-white text-xs px-2 py-1 rounded-full">
                  {plan.savings}
                </div>
              )}
            </button>
          ))}
        </div>
        
        {/* Upgrade Button */}
        <motion.button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full btn-primary text-xl py-4 relative overflow-hidden"
          whileTap={{ scale: 0.98 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-center gap-3">
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Crown size={24} />
                <span>Upgrade to Premium</span>
              </>
            )}
          </div>
          
          {/* Animated background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-accent-500/20 to-primary-500/20"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.button>
      </motion.div>
      
      {/* Features List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 mb-8"
      >
        <h2 className="text-2xl font-display font-bold text-white mb-6">
          Premium Features
        </h2>
        
        {premiumFeatures.map((feature, index) => {
          const Icon = feature.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="card p-4"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg bg-dark-700`}>
                  <Icon size={24} className={feature.color} />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-dark-400 text-sm">
                    {feature.description}
                  </p>
                </div>
                <div className="text-primary-400">
                  <Star size={20} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
      
      {/* Testimonials */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6 mb-8"
      >
        <h3 className="text-xl font-semibold text-white mb-4 text-center">
          What Premium Users Say
        </h3>
        
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl mb-2">💰</div>
            <p className="text-dark-300 italic mb-2">
              "Premium analytics helped me optimize my bathroom breaks and earn 40% more!"
            </p>
            <p className="text-primary-400 text-sm font-medium">- Sarah K., Marketing Manager</p>
          </div>
          
          <div className="border-t border-dark-700 pt-4 text-center">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-dark-300 italic mb-2">
              "The private leaderboards made our office bathroom breaks so much more fun!"
            </p>
            <p className="text-primary-400 text-sm font-medium">- Mike R., Software Developer</p>
          </div>
        </div>
      </motion.div>
      
      {/* Money Back Guarantee */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card p-4 text-center border border-green-500/30 bg-green-500/5"
      >
        <Shield size={32} className="text-green-400 mx-auto mb-2" />
        <h3 className="text-green-400 font-semibold mb-1">
          30-Day Money Back Guarantee
        </h3>
        <p className="text-dark-300 text-sm">
          Not satisfied? Get a full refund within 30 days, no questions asked.
        </p>
      </motion.div>
    </div>
  )
}

export default Premium