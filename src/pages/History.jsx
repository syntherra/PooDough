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
  ChevronDown,
  List,
  Grid3X3,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react'
import { useTimer } from '../hooks/useTimer'
import { useCurrency } from '../contexts/CurrencyContext'
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  isWithinInterval,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  isSameMonth,
  isToday
} from 'date-fns'

function History() {
  const { sessions, formatTime } = useTimer()
  const { formatCurrency } = useCurrency()
  const [filterPeriod, setFilterPeriod] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'calendar'
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)
  const [showDayModal, setShowDayModal] = useState(false)
  
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
  
  // Get sessions by date for calendar view
  const sessionsByDate = useMemo(() => {
    const dateMap = new Map()
    sessions.forEach(session => {
      const sessionDate = new Date(session.createdAt.seconds * 1000)
      const dateKey = format(sessionDate, 'yyyy-MM-dd')
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, [])
      }
      dateMap.get(dateKey).push(session)
    })
    return dateMap
  }, [sessions])

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const startDate = startOfWeek(start)
    const endDate = endOfWeek(end)
    
    return eachDayOfInterval({ start: startDate, end: endDate })
  }, [currentMonth])

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
        
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex bg-dark-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'list'
                  ? 'bg-primary-600 text-white'
                  : 'text-dark-400 hover:text-white'
              }`}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'calendar'
                  ? 'bg-primary-600 text-white'
                  : 'text-dark-400 hover:text-white'
              }`}
            >
              <Grid3X3 size={18} />
            </button>
          </div>
          
          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-ghost p-3"
          >
            <Filter size={20} />
          </button>
        </div>
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
          {viewMode === 'calendar' ? 'Monthly Insights' : 'Insights'}
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
          {viewMode === 'calendar' && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-dark-300">Days with Sessions</span>
                <span className="text-blue-400 font-medium">
                  {Array.from(sessionsByDate.keys()).filter(dateKey => {
                    const date = new Date(dateKey)
                    return isSameMonth(date, currentMonth)
                  }).length} days
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-dark-300">Best Day</span>
                <span className="text-yellow-400 font-medium">
                  {(() => {
                    let bestDay = null
                    let maxEarnings = 0
                    sessionsByDate.forEach((sessions, dateKey) => {
                      const date = new Date(dateKey)
                      if (isSameMonth(date, currentMonth)) {
                        const dayEarnings = sessions.reduce((sum, s) => sum + (s.earnings || 0), 0)
                        if (dayEarnings > maxEarnings) {
                          maxEarnings = dayEarnings
                          bestDay = format(date, 'MMM d')
                        }
                      }
                    })
                    return bestDay ? `${bestDay} (${formatCurrency(maxEarnings)})` : 'No data'
                  })()}
                </span>
              </div>
            </>
          )}
        </div>
      </motion.div>
      
      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dark-800 rounded-xl p-6"
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-white transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-3 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-white transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center text-dark-400 text-sm font-medium">
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {(() => {
              return calendarDays.map(day => {
                const dateKey = format(day, 'yyyy-MM-dd')
                const daySessions = sessionsByDate.get(dateKey) || []
                const totalDuration = daySessions.reduce((sum, session) => sum + (session.duration || 0), 0)
                const isCurrentMonth = isSameMonth(day, currentMonth)
                const isTodayDate = isToday(day)
                
                // Generate background color based on absolute time brackets (in seconds)
                const getHeatMapColor = (totalSeconds) => {
                  if (totalSeconds === 0) return 'bg-dark-800'
                  if (totalSeconds < 60) return 'bg-orange-950/30'        // < 1 minute
                  if (totalSeconds < 300) return 'bg-orange-900/50'       // < 5 minutes
                  if (totalSeconds < 900) return 'bg-orange-800/60'       // < 15 minutes
                  if (totalSeconds < 1800) return 'bg-orange-700/70'      // < 30 minutes
                  if (totalSeconds < 3600) return 'bg-orange-600/80'      // < 1 hour
                  if (totalSeconds < 7200) return 'bg-orange-500/90'      // < 2 hours
                  return 'bg-orange-400'                                  // 2+ hours
                }
                
                return (
                  <div
                    key={dateKey}
                    onClick={() => {
                      if (daySessions.length > 0) {
                        setSelectedDay({ day, sessions: daySessions })
                        setShowDayModal(true)
                      }
                    }}
                    className={`p-3 min-h-[80px] border border-dark-700 rounded-lg transition-all duration-300 hover:border-primary-500 hover:shadow-lg ${
                      isCurrentMonth ? getHeatMapColor(totalDuration) : 'bg-dark-900 opacity-50'
                    } ${
                      isTodayDate ? 'ring-2 ring-primary-500' : ''
                    } ${
                      daySessions.length > 0 ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                    }`}
                  >
                    {/* Date Number */}
                    <div className={`text-sm font-semibold mb-2 ${
                      isCurrentMonth ? (totalDuration > 1800 ? 'text-white' : 'text-white') : 'text-dark-500'
                    } ${
                      isTodayDate ? 'text-primary-300' : ''
                    }`}>
                      {format(day, 'd')}
                    </div>
                    
                    {/* Pure heatmap - no text indicators */}
                  </div>
                )
              })
            })()}
          </div>
          
          {/* Heat Map Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-dark-700">
            <div className="flex items-center gap-2">
              <span className="text-sm text-dark-300">Daily Total:</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-dark-800 border border-dark-600 rounded"></div>
              <span className="text-xs text-dark-400">0</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-950/30 rounded"></div>
              <span className="text-xs text-dark-400">&lt;1m</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-900/50 rounded"></div>
              <span className="text-xs text-dark-400">&lt;5m</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-800/60 rounded"></div>
              <span className="text-xs text-dark-400">&lt;15m</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-700/70 rounded"></div>
              <span className="text-xs text-dark-400">&lt;30m</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-600/80 rounded"></div>
              <span className="text-xs text-dark-400">&lt;1h</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500/90 rounded"></div>
              <span className="text-xs text-dark-400">&lt;2h</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-400 rounded"></div>
              <span className="text-xs text-dark-400">2h+</span>
            </div>
            <div className="text-xs text-dark-400 italic ml-2">
              Click days for details
            </div>
          </div>
        </motion.div>
      )}

      {/* Sessions List */}
      {viewMode === 'list' && (
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
                const sessionDate = session.createdAt?.seconds ? new Date(session.createdAt.seconds * 1000) : new Date()
                const isToday = sessionDate.toDateString() === new Date().toDateString()
                const isValidDate = !isNaN(sessionDate.getTime())
                
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
                              {isValidDate ? (isToday ? 'Today' : format(sessionDate, 'MMM d, yyyy')) : 'Date not available'}
                            </span>
                            <span>•</span>
                            <span>{isValidDate ? format(sessionDate, 'h:mm a') : 'Time not available'}</span>
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
                          {session.wasWorkHours ? 'Work time session' : 'Off hours'}
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
      )}
      
      {/* Day Details Modal */}
      {showDayModal && selectedDay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-dark-800 rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                {format(selectedDay.day, 'EEEE, MMMM d, yyyy')}
              </h3>
              <button
                onClick={() => setShowDayModal(false)}
                className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Day Summary */}
            <div className="bg-dark-700 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-dark-400">Total Sessions</div>
                  <div className="text-xl font-bold text-white">
                    {selectedDay.sessions.length}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-dark-400">Total Duration</div>
                  <div className="text-xl font-bold text-white">
                    {(() => {
                      const totalSeconds = selectedDay.sessions.reduce((sum, session) => sum + (session.duration || 0), 0)
                      const hours = Math.floor(totalSeconds / 3600)
                      const minutes = Math.floor((totalSeconds % 3600) / 60)
                      const seconds = totalSeconds % 60
                      
                      if (hours > 0) {
                        return `${hours}h ${minutes}m ${seconds}s`
                      } else if (minutes > 0) {
                        return `${minutes}m ${seconds}s`
                      } else {
                        return `${seconds}s`
                      }
                    })()} 
                  </div>
                </div>
                <div>
                  <div className="text-sm text-dark-400">Total Earnings</div>
                  <div className="text-xl font-bold text-green-400">
                    {formatCurrency(selectedDay.sessions.reduce((sum, session) => sum + (session.earnings || 0), 0))}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-dark-400">Work Time Sessions</div>
                  <div className="text-xl font-bold text-white">
                    {selectedDay.sessions.filter(s => s.wasWorkHours).length}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Session List */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-dark-300 uppercase tracking-wide">
                Sessions
              </h4>
              {selectedDay.sessions.map((session, index) => (
                <div key={session.id || index} className="bg-dark-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        session.wasWorkHours ? 'bg-green-500' : 'bg-blue-500'
                      }`}></div>
                      <span className="text-sm font-medium text-white">
                        {session.wasWorkHours ? 'Work Time Sessions' : 'Off Hours'}
                      </span>
                    </div>
                    <span className="text-sm text-green-400 font-medium">
                      {formatCurrency(session.earnings || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-dark-300">
                    <span>
                      {(() => {
                          try {
                            let startTime, endTime
                            
                            // Handle different timestamp formats
                            if (session.startTime) {
                              if (session.startTime.seconds) {
                                startTime = new Date(session.startTime.seconds * 1000)
                              } else {
                                startTime = new Date(session.startTime)
                              }
                            }
                            
                            if (session.endTime) {
                              if (session.endTime.seconds) {
                                endTime = new Date(session.endTime.seconds * 1000)
                              } else {
                                endTime = new Date(session.endTime)
                              }
                            }
                            
                            if (startTime && endTime && !isNaN(startTime.getTime()) && !isNaN(endTime.getTime())) {
                              return `${format(startTime, 'h:mm:ss a')} - ${format(endTime, 'h:mm:ss a')}`
                            }
                            
                            // Fallback: calculate from createdAt if available
                            if (session.createdAt && session.duration) {
                              const sessionEnd = session.createdAt.seconds 
                                ? new Date(session.createdAt.seconds * 1000)
                                : new Date(session.createdAt)
                              const sessionStart = new Date(sessionEnd.getTime() - (session.duration * 1000))
                              
                              if (!isNaN(sessionStart.getTime()) && !isNaN(sessionEnd.getTime())) {
                                return `${format(sessionStart, 'h:mm:ss a')} - ${format(sessionEnd, 'h:mm:ss a')}`
                              }
                            }
                            
                            return 'Time not available'
                          } catch (error) {
                            return 'Time not available'
                          }
                        })()} 
                    </span>
                    <span>
                      {formatTime(session.duration || 0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default History