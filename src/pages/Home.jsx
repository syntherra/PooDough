import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Timer, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Calendar,
  Target,
  Award,
  Zap
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTimer } from '../hooks/useTimer'
import { useCurrency } from '../contexts/CurrencyContext'

function Home() {
  const { user, userProfile } = useAuth()
  const { sessions, formatTime, isWorkHours } = useTimer()
  const { formatCurrency } = useCurrency()
  
  // Debug logging
  console.log('🏠 Home component rendering:', { user: !!user, userProfile: !!userProfile, sessionsCount: sessions?.length || 0 })
  
  // Calculate today's stats
  const today = new Date().toDateString()
  const todaySessions = sessions.filter(session => 
    new Date(session.createdAt.seconds * 1000).toDateString() === today
  )
  
  const todayEarnings = todaySessions.reduce((sum, session) => sum + (session.earnings || 0), 0)
  const todayTime = todaySessions.reduce((sum, session) => sum + (session.duration || 0), 0)
  
  // Get recent sessions (last 3)
  const recentSessions = sessions.slice(0, 3)
  
  // Calculate streak
  const currentStreak = userProfile?.currentStreak || 0
  
  const statsCards = [
    {
      title: '💰 Today\'s Poop Profit',
      value: formatCurrency(todayEarnings),
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      change: todaySessions.length > 0 ? `${todaySessions.length} royal visits` : 'No throne time yet!'
    },
    {
      title: '🏆 Total Toilet Treasure',
      value: formatCurrency(userProfile?.totalEarnings || 0),
      icon: TrendingUp,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      change: `${userProfile?.totalSessions || 0} bathroom breaks`
    },
    {
      title: '⏰ Today\'s Throne Time',
      value: formatTime(todayTime),
      icon: Clock,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      change: todayTime > 0 ? 'Quality time! 🚽' : 'Time to drop some logs!'
    },
    {
      title: '🔥 Poop Streak',
      value: `${currentStreak} days`,
      icon: Award,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      change: currentStreak > 0 ? 'You\'re on a roll! 🧻' : 'Start your streak!'
    }
  ]
  
  return (
    <div className="min-h-screen bg-gray-900 p-4 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">
              Welcome back, {user?.displayName?.split(' ')[0] || 'Poop Master'}! 💩
            </h1>
            <p className="text-dark-400 mt-1">
              {isWorkHours ? (
                <span className="text-green-400 flex items-center gap-1">
                  <Zap size={16} />
                  Ka-ching! You're making money on the toilet! 🤑
                </span>
              ) : (
                'Ready to turn your bathroom breaks into cash? 🚽💰'
              )}
            </p>
          </div>
          <div className="text-4xl animate-bounce-slow">
            🧻
          </div>
        </div>
      </motion.div>
      
      {/* Quick Action Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Link to="/timer">
          <motion.button
            className="w-full btn-primary text-xl py-6 relative overflow-hidden"
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-center gap-3">
              <Timer size={28} />
              <span className="font-bold">Make Some Dough! 💩💰</span>
            </div>
            {isWorkHours && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-primary-500/20"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.button>
        </Link>
      </motion.div>
      
      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-4 mb-8"
      >
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={`stat-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="card p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={stat.color} size={20} />
                </div>
              </div>
              <div>
                <p className="text-dark-400 text-sm mb-1">{stat.title}</p>
                <p className="text-white text-xl font-bold mb-1">{stat.value}</p>
                <p className="text-dark-500 text-xs">{stat.change}</p>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
      
      {/* Recent Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-semibold text-white">
            🧻 Recent Bathroom Breaks
          </h2>
          <Link 
            to="/history" 
            className="text-orange-400 hover:text-orange-300 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        
        {recentSessions.length > 0 ? (
          <div className="space-y-3">
            {recentSessions.map((session, index) => {
              const sessionDate = new Date(session.createdAt.seconds * 1000)
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="card p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {session.wasWorkHours ? '💰' : '🚽'}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {formatTime(session.duration)}
                      </p>
                      <p className="text-dark-400 text-sm">
                        {sessionDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-400 font-bold">
                      {formatCurrency(session.earnings)}
                    </p>
                    <p className="text-dark-500 text-xs">
                      {session.wasWorkHours ? 'Paid poop break! 💰' : 'Personal throne time 🚽'}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="card p-8 text-center"
          >
            <div className="text-6xl mb-4">🚽</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Your throne awaits! 👑
            </h3>
            <p className="text-dark-400 mb-4">
              Time to drop your first log and start making that sweet toilet treasure! 💩💰
            </p>
            <Link to="/timer">
              <button className="btn-primary">
                Drop Your First Log! 🚽
              </button>
            </Link>
          </motion.div>
        )}
      </motion.div>
      
      {/* Quick Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card p-4"
      >
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Target size={20} className="text-orange-400" />
          💩 Poop Pro Tips
        </h3>
        <div className="space-y-2 text-sm text-dark-300">
          <p>💰 Set your salary to see how much your bathroom breaks are worth!</p>
          <p>🕘 Poop during work hours = getting paid to poop! 💸</p>
          <p>🔥 Build daily streaks to become the ultimate poop champion!</p>
          <p>👑 Go Premium for exclusive toilet features and bragging rights!</p>
        </div>
      </motion.div>
    </div>
  )
}

export default Home