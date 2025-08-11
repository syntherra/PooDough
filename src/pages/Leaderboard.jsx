import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  Crown, 
  Users, 
  Globe, 
  Medal,
  TrendingUp,
  Star,
  Zap
} from 'lucide-react'
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

function Leaderboard() {
  const { user, userProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('global')
  const [globalLeaders, setGlobalLeaders] = useState([])
  const [friendsLeaders, setFriendsLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [userRank, setUserRank] = useState(null)
  
  // Fetch global leaderboard
  const fetchGlobalLeaderboard = async () => {
    try {
      const q = query(
        collection(db, 'users'),
        orderBy('totalEarnings', 'desc'),
        limit(50)
      )
      
      const querySnapshot = await getDocs(q)
      const leaders = querySnapshot.docs.map((doc, index) => ({
        id: doc.id,
        rank: index + 1,
        ...doc.data()
      }))
      
      setGlobalLeaders(leaders)
      
      // Find current user's rank
      const currentUserRank = leaders.findIndex(leader => leader.id === user?.uid)
      if (currentUserRank !== -1) {
        setUserRank(currentUserRank + 1)
      }
      
    } catch (error) {
      console.error('Error fetching global leaderboard:', error)
    }
  }
  
  // Fetch friends leaderboard (placeholder - would need friends system)
  const fetchFriendsLeaderboard = async () => {
    // For now, just show a subset of global leaders as "friends"
    // In a real app, you'd have a friends collection
    const friendsData = globalLeaders.slice(0, 10).map((leader, index) => ({
      ...leader,
      rank: index + 1,
      isFriend: true
    }))
    
    setFriendsLeaders(friendsData)
  }
  
  useEffect(() => {
    const loadLeaderboards = async () => {
      setLoading(true)
      await fetchGlobalLeaderboard()
      setLoading(false)
    }
    
    loadLeaderboards()
  }, [user])
  
  useEffect(() => {
    if (globalLeaders.length > 0) {
      fetchFriendsLeaderboard()
    }
  }, [globalLeaders])
  
  // Get rank title based on position
  const getRankTitle = (rank, totalEarnings) => {
    if (rank === 1) return { title: 'Porcelain Emperor', icon: '👑', color: 'text-yellow-400' }
    if (rank === 2) return { title: 'Flush Master', icon: '🥈', color: 'text-gray-300' }
    if (rank === 3) return { title: 'Toilet Titan', icon: '🥉', color: 'text-amber-600' }
    if (rank <= 10) return { title: 'Bathroom Baron', icon: '🏆', color: 'text-purple-400' }
    if (rank <= 25) return { title: 'Restroom Royalty', icon: '👸', color: 'text-blue-400' }
    if (rank <= 50) return { title: 'Loo Legend', icon: '⭐', color: 'text-green-400' }
    if (totalEarnings >= 100) return { title: 'Poop Prodigy', icon: '💎', color: 'text-cyan-400' }
    if (totalEarnings >= 50) return { title: 'Toilet Trainee', icon: '🎯', color: 'text-orange-400' }
    return { title: 'Bathroom Beginner', icon: '🚽', color: 'text-dark-400' }
  }
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }
  
  const currentLeaders = activeTab === 'global' ? globalLeaders : friendsLeaders
  
  return (
    <div className="min-h-screen bg-dark-900 p-4 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h1 className="text-3xl font-display font-bold gradient-text mb-2">
          Leaderboard
        </h1>
        <p className="text-dark-400">
          See who's earning the most on the throne!
        </p>
      </motion.div>
      
      {/* User's Current Rank */}
      {userProfile && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card p-4 mb-6 border border-primary-500/30 bg-primary-500/5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">
                {getRankTitle(userRank || 999, userProfile.totalEarnings || 0).icon}
              </div>
              <div>
                <p className="text-white font-semibold">
                  {user?.displayName || 'You'}
                </p>
                <p className={`text-sm ${getRankTitle(userRank || 999, userProfile.totalEarnings || 0).color}`}>
                  {getRankTitle(userRank || 999, userProfile.totalEarnings || 0).title}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-primary-400 font-bold text-lg">
                {formatCurrency(userProfile.totalEarnings || 0)}
              </p>
              <p className="text-dark-400 text-sm">
                {userRank ? `#${userRank}` : 'Unranked'}
              </p>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Tab Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex bg-dark-800 rounded-xl p-1 mb-6"
      >
        <button
          onClick={() => setActiveTab('global')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'global'
              ? 'bg-primary-600 text-white'
              : 'text-dark-400 hover:text-white'
          }`}
        >
          <Globe size={20} />
          <span>Global</span>
        </button>
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'friends'
              ? 'bg-primary-600 text-white'
              : 'text-dark-400 hover:text-white'
          }`}
        >
          <Users size={20} />
          <span>Friends</span>
        </button>
      </motion.div>
      
      {/* Leaderboard */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {currentLeaders.length > 0 ? (
            currentLeaders.map((leader, index) => {
              const rankInfo = getRankTitle(leader.rank, leader.totalEarnings || 0)
              const isCurrentUser = leader.id === user?.uid
              
              return (
                <motion.div
                  key={leader.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className={`card p-4 ${
                    isCurrentUser ? 'border border-primary-500/50 bg-primary-500/5' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="flex items-center justify-center w-8 h-8">
                        {leader.rank <= 3 ? (
                          <div className="text-2xl">
                            {leader.rank === 1 && '🥇'}
                            {leader.rank === 2 && '🥈'}
                            {leader.rank === 3 && '🥉'}
                          </div>
                        ) : (
                          <span className="text-dark-400 font-bold text-lg">
                            #{leader.rank}
                          </span>
                        )}
                      </div>
                      
                      {/* User Info */}
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{rankInfo.icon}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-white font-semibold">
                              {leader.displayName || 'Anonymous Pooper'}
                              {isCurrentUser && (
                                <span className="text-primary-400 text-sm ml-2">(You)</span>
                              )}
                            </p>
                            {leader.isPremium && (
                              <Crown size={16} className="text-accent-400" />
                            )}
                          </div>
                          <p className={`text-sm ${rankInfo.color}`}>
                            {rankInfo.title}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="text-right">
                      <p className="text-primary-400 font-bold text-lg">
                        {formatCurrency(leader.totalEarnings || 0)}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-dark-400">
                        <span>{leader.totalSessions || 0} sessions</span>
                        {leader.currentStreak > 0 && (
                          <span className="flex items-center gap-1">
                            <Zap size={12} className="text-yellow-400" />
                            {leader.currentStreak}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="card p-8 text-center"
            >
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                No rankings yet
              </h3>
              <p className="text-dark-400">
                {activeTab === 'friends' 
                  ? 'Add friends to see their rankings!' 
                  : 'Be the first to start earning!'
                }
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
      
      {/* Rank Titles Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card p-4 mt-8"
      >
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Medal size={20} className="text-yellow-400" />
          Rank Titles
        </h3>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-dark-300">👑 Porcelain Emperor</span>
            <span className="text-yellow-400">#1</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dark-300">🥈 Flush Master</span>
            <span className="text-gray-300">#2</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dark-300">🥉 Toilet Titan</span>
            <span className="text-amber-600">#3</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dark-300">🏆 Bathroom Baron</span>
            <span className="text-purple-400">#4-10</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dark-300">👸 Restroom Royalty</span>
            <span className="text-blue-400">#11-25</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Leaderboard