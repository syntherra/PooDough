import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Home, 
  Timer, 
  History, 
  Trophy, 
  User,
  Crown
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

function Navigation() {
  const { userProfile } = useAuth()
  
  const navItems = [
    {
      path: '/',
      icon: Home,
      label: 'Home',
      exact: true
    },
    {
      path: '/timer',
      icon: Timer,
      label: 'Poop Timer'
    },
    {
      path: '/history',
      icon: History,
      label: 'Poop Log'
    },
    {
      path: '/leaderboard',
      icon: Trophy,
      label: 'Poop Board'
    },
    {
      path: '/profile',
      icon: User,
      label: 'Profile'
    }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 md:relative md:border-t-0 md:bg-transparent z-50">
      <div className="flex items-center justify-around px-2 py-2 md:justify-center md:gap-8 md:py-4">
        {navItems.map((item) => {
          const Icon = item.icon
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 touch-target ${
                  isActive
                    ? 'text-orange-400 bg-orange-500/10'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="relative"
                  >
                    <Icon 
                      size={24} 
                      className={`transition-colors duration-200 ${
                        isActive ? 'text-orange-400' : 'text-current'
                      }`} 
                    />
                    
                    {/* Premium indicator */}
                    {item.path === '/profile' && userProfile?.isPremium && (
                      <Crown 
                        size={12} 
                        className="absolute -top-1 -right-1 text-yellow-400"
                      />
                    )}
                    
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-400 rounded-full"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.div>
                  
                  <span className={`text-xs mt-1 font-medium transition-colors duration-200 ${
                    isActive ? 'text-orange-400' : 'text-current'
                  }`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          )
        })}
        
        {/* Premium upgrade button */}
        {!userProfile?.isPremium && (
          <NavLink
            to="/premium"
            className="flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 touch-target text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 ml-2 md:ml-4"
          >
            <motion.div whileTap={{ scale: 0.9 }}>
              <Crown size={24} className="animate-pulse" />
            </motion.div>
            <span className="text-xs mt-1 font-medium">Premium</span>
          </NavLink>
        )}
      </div>
      
      {/* Gradient overlay for better visibility */}
      <div className="absolute inset-x-0 bottom-full h-4 bg-gradient-to-t from-dark-800/50 to-transparent pointer-events-none md:hidden" />
    </nav>
  )
}

export default Navigation