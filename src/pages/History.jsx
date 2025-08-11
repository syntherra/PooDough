import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  DollarSign, 
  Clock, 
  Filter, 
  TrendingUp,
  Award,
  Target,
  ChevronDown
} from 'lucide-react'
import { useTimer } from '../contexts/TimerContext'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'

function History() {
  const { sessions, formatTime, formatCurrency } = useTimer()
  const [filterPeriod, setFilterPeriod] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter sessions based on selected period
  const filteredSessions = useMemo(() => {
    if (filterPeriod === 'all') return sessions
    
    const now = new Date()
    let startDate, endDate
    
    switch (filterPeriod) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
        break
      case 'week':
        startDate = startOfWeek(now)
        endDate = endOfWeek(now)
        break
      case 'month':
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        break
      default:
        return sessions
    }
    
    return sessions.filter(session => {
      const sessionDate = new Date(session.createdAt.seconds * 1000)
      return isWithinInterval(sessionDate, { start: startDate, end: endDate })
    })
  }, [sessions, filterPeriod])
  
  // Calculate statistics
  const stats = useMemo(() => {
    const totalSessions = filteredSessions.length
    const totalEarnings = filteredSessions.reduce((sum, session) => sum + (session.earnings || 0), 0)
    const totalTime = filteredSessions.reduce((sum, session) => sum + (session.duration || 0), 0)
    const longestSession = Math.max(...filteredSessions.map(s => s.duration || 0), 0)
    const averageSession = totalSessions > 0 ? totalTime / totalSessions : 0
    const workHoursSessions = filteredSessions.filter(s => s.wasWorkHours).length
    
    return {
      totalSessions,
      totalEarnings,
      totalTime,
      longestSession,
      averageSession,
      workHoursSessions
    }
  }, [filteredSessions])
  
  const filterOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ]
  
  const statCards = [
    {
      title: 'Total Earnings',
      value: formatCurrency(stats.totalEarnings),
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Total Sessions',
      value: stats.totalSessions.toString(),
      icon: Target,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Total Time',
      value: formatTime(stats.totalTime),
      icon: Clock,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Longest Session',
      value: formatTime(stats.longestSession),
      icon: Award,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10'
    }
  ]
  
  return (
    <div className="min-h-screen bg-dark-900 p-4 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
            Session History
          </h1>
          <p className="text-dark-400 mt-1">
            Track your bathroom break earnings
          </p>
        </div>
        
        {/* Filter Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-ghost p-3"
        >
          <Filter size={20} />
        </button>
      </motion.div>
      
      {/* Filter Dropdown */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="card p-4 mb-6"
        >
          <h3 className="text-white font-semibold mb-3">Filter by Period</h3>
          <div className="grid grid-cols-2 gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setFilterPeriod(option.value)
                  setShowFilters(false)
                }}
                className={`p-3 rounded-lg text-sm font-medium transition-all ${
                  filterPeriod === option.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-4 mb-8"
      >
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="card p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={stat.color} size={20} />
                </div>
              </div>
              <div>
                <p className="text-dark-400 text-sm mb-1">{stat.title}</p>
                <p className="text-white text-lg font-bold">{stat.value}</p>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
      
      {/* Additional Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-4 mb-6"
      >
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-primary-400" />
          Insights
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex justify-between items-center">
            <span className="text-dark-300">Average Session</span>
            <span className="text-white font-medium">{formatTime(stats.averageSession)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-dark-300">Work Hours Sessions</span>
            <span className="text-green-400 font-medium">
              {stats.workHoursSessions} / {stats.totalSessions}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-dark-300">Average Earnings per Session</span>
            <span className="text-primary-400 font-medium">
              {formatCurrency(stats.totalSessions > 0 ? stats.totalEarnings / stats.totalSessions : 0)}
            </span>
          </div>
        </div>
      </motion.div>
      
      {/* Sessions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-white font-semibold mb-4">
          Sessions ({filteredSessions.length})
        </h3>
        
        {filteredSessions.length > 0 ? (
          <div className="space-y-3">
            {filteredSessions.map((session, index) => {
              const sessionDate = new Date(session.createdAt.seconds * 1000)
              const isToday = sessionDate.toDateString() === new Date().toDateString()
              
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="card p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">
                        {session.wasWorkHours ? '💰' : '🚽'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">
                            {formatTime(session.duration)}
                          </span>
                          {session.duration >= 300 && (
                            <Award size={16} className="text-yellow-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-dark-400">
                          <Calendar size={14} />
                          <span>
                            {isToday ? 'Today' : format(sessionDate, 'MMM d, yyyy')}
                          </span>
                          <span>•</span>
                          <span>{format(sessionDate, 'h:mm a')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-bold text-lg ${
                        session.wasWorkHours ? 'text-green-400' : 'text-dark-400'
                      }`}>
                        {formatCurrency(session.earnings)}
                      </p>
                      <p className="text-xs text-dark-500">
                        {session.wasWorkHours ? 'Work hours' : 'Off hours'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="card p-8 text-center"
          >
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No sessions found
            </h3>
            <p className="text-dark-400 mb-4">
              {filterPeriod === 'all' 
                ? 'Start your first bathroom break timer!' 
                : `No sessions found for ${filterOptions.find(o => o.value === filterPeriod)?.label.toLowerCase()}`
              }
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default History