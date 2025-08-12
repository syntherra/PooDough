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
  Zap,
  UserPlus,
  Search,
  Check,
  X,
  Bell,
  UserCheck,
  UserX
} from 'lucide-react'
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import { useCurrency } from '../contexts/CurrencyContext'
import { useTimer } from '../hooks/useTimer'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

function Leaderboard() {
  const { user, userProfile } = useAuth()
  const { getCurrencyDisplay } = useCurrency()
  const { formatTime } = useTimer()
  const [activeTab, setActiveTab] = useState('global')
  const [globalLeaders, setGlobalLeaders] = useState([])
  const [friendsLeaders, setFriendsLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [userRank, setUserRank] = useState(null)
  
  // Friends system state
  const [friends, setFriends] = useState([])
  const [friendRequests, setFriendRequests] = useState([])
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [pendingRequests, setPendingRequests] = useState([])
  
  // Fetch global leaderboard
  const fetchGlobalLeaderboard = async () => {
    try {
      const q = query(
        collection(db, 'users'),
        orderBy('totalTime', 'desc'),
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
  
  // Real-time listeners are now handled in useEffect
  
  // Search users for adding friends
  const searchUsers = async (searchTerm) => {
    if (!searchTerm.trim() || !user) {
      setSearchResults([])
      return
    }
    
    setSearchLoading(true)
    try {
      // Convert search term to lowercase for case-insensitive search
      const searchTermLower = searchTerm.toLowerCase()
      
      // Get all users (we'll filter client-side for case-insensitive search)
      const usersQuery = query(
        collection(db, 'users'),
        limit(50) // Get more users to filter from
      )
      
      const usersSnapshot = await getDocs(usersQuery)
      const allUsers = usersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.id !== user.uid) // Exclude current user
      
      // Case-insensitive filtering
      const matchingUsers = allUsers.filter(u => 
        u.displayName && u.displayName.toLowerCase().includes(searchTermLower)
      )
      
      // Filter out existing friends and pending requests
      const friendIds = friends.map(f => f.id)
      const pendingIds = pendingRequests.map(r => r.toUserId)
      const incomingIds = friendRequests.map(r => r.fromUserId)
      
      const filteredUsers = matchingUsers
        .filter(u => 
          !friendIds.includes(u.id) && 
          !pendingIds.includes(u.id) &&
          !incomingIds.includes(u.id)
        )
        .slice(0, 10) // Limit to 10 results
      
      setSearchResults(filteredUsers)
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setSearchLoading(false)
    }
  }
  
  // Send friend request
  const sendFriendRequest = async (toUserId, toUserName) => {
    if (!user) return
    
    try {
      await addDoc(collection(db, 'friendRequests'), {
        fromUserId: user.uid,
        fromUserName: user.displayName || 'Anonymous',
        toUserId,
        toUserName,
        status: 'pending',
        createdAt: serverTimestamp()
      })
      
      // Add to pending requests
      setPendingRequests(prev => [...prev, { toUserId, toUserName }])
      
      // Remove from search results
      setSearchResults(prev => prev.filter(u => u.id !== toUserId))
      
      toast.success(`Friend request sent to ${toUserName}!`)
    } catch (error) {
      console.error('Error sending friend request:', error)
      toast.error('Failed to send friend request')
    }
  }
  
  // Accept friend request
  const acceptFriendRequest = async (requestId, fromUserId, fromUserName) => {
    if (!user) return
    
    try {
      // Create friendship
      await addDoc(collection(db, 'friends'), {
        users: [user.uid, fromUserId],
        createdAt: serverTimestamp()
      })
      
      // Update request status
      await updateDoc(doc(db, 'friendRequests', requestId), {
        status: 'accepted',
        acceptedAt: serverTimestamp()
      })
      
      // Remove from friend requests
      setFriendRequests(prev => prev.filter(r => r.id !== requestId))
      
      // Refresh friends list
      fetchFriends()
      
      toast.success(`You are now friends with ${fromUserName}!`)
    } catch (error) {
      console.error('Error accepting friend request:', error)
      toast.error('Failed to accept friend request')
    }
  }
  
  // Reject friend request
  const rejectFriendRequest = async (requestId, fromUserName) => {
    if (!user) return
    
    try {
      await updateDoc(doc(db, 'friendRequests', requestId), {
        status: 'rejected',
        rejectedAt: serverTimestamp()
      })
      
      // Remove from friend requests
      setFriendRequests(prev => prev.filter(r => r.id !== requestId))
      
      toast.success(`Friend request from ${fromUserName} rejected`)
    } catch (error) {
      console.error('Error rejecting friend request:', error)
      toast.error('Failed to reject friend request')
    }
  }
  
  // Remove friend
  const removeFriend = async (friendshipId, friendName) => {
    if (!user) return
    
    try {
      await deleteDoc(doc(db, 'friends', friendshipId))
      
      // Refresh friends list
      fetchFriends()
      
      toast.success(`Removed ${friendName} from friends`)
    } catch (error) {
      console.error('Error removing friend:', error)
      toast.error('Failed to remove friend')
    }
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
    if (!user) return

    // Real-time listener for friend requests
    const friendRequestsQuery = query(
      collection(db, 'friendRequests'),
      where('toUserId', '==', user.uid),
      where('status', '==', 'pending')
    )

    const unsubscribeFriendRequests = onSnapshot(friendRequestsQuery, async (snapshot) => {
      const requests = []
      
      for (const requestDoc of snapshot.docs) {
        const requestData = requestDoc.data()
        
        // Get sender's profile
        try {
          const senderQuery = query(
            collection(db, 'users'),
            where('__name__', '==', requestData.fromUserId)
          )
          const senderSnapshot = await getDocs(senderQuery)
          
          if (!senderSnapshot.empty) {
            const senderProfile = senderSnapshot.docs[0].data()
            requests.push({
              id: requestDoc.id,
              ...requestData,
              senderProfile
            })
          }
        } catch (error) {
          console.error('Error fetching sender profile:', error)
        }
      }
      
      setFriendRequests(requests)
    }, (error) => {
      console.error('Error listening to friend requests:', error)
    })

    // Real-time listener for friends
    const friendsQuery = query(
      collection(db, 'friends'),
      where('users', 'array-contains', user.uid)
    )

    const unsubscribeFriends = onSnapshot(friendsQuery, async (snapshot) => {
      const friendsList = []
      
      for (const friendDoc of snapshot.docs) {
        const friendData = friendDoc.data()
        const friendId = friendData.users.find(id => id !== user.uid)
        
        // Get friend's profile
        try {
          const friendProfileQuery = query(
            collection(db, 'users'),
            where('__name__', '==', friendId)
          )
          const friendProfileSnapshot = await getDocs(friendProfileQuery)
          
          if (!friendProfileSnapshot.empty) {
            const friendProfile = friendProfileSnapshot.docs[0].data()
            friendsList.push({
              id: friendId,
              ...friendProfile,
              friendshipId: friendDoc.id
            })
          }
        } catch (error) {
          console.error('Error fetching friend profile:', error)
        }
      }
      
      // Sort friends by total time for leaderboard
      const sortedFriends = friendsList.sort((a, b) => (b.totalTime || 0) - (a.totalTime || 0))
      setFriends(sortedFriends)
      setFriendsLeaders(sortedFriends)
    }, (error) => {
      console.error('Error listening to friends:', error)
    })

    // Cleanup listeners on unmount
    return () => {
      unsubscribeFriendRequests()
      unsubscribeFriends()
    }
  }, [user])
  
  // Search users when search query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery)
    }, 300) // Debounce search
    
    return () => clearTimeout(timeoutId)
  }, [searchQuery, friends, pendingRequests, friendRequests])
  
  // Get rank title based on position
  const getRankTitle = (rank, totalTime) => {
    if (rank === 1) return { title: 'Porcelain Emperor', icon: '👑', color: 'text-yellow-400' }
    if (rank === 2) return { title: 'Flush Master', icon: '🥈', color: 'text-gray-300' }
    if (rank === 3) return { title: 'Toilet Titan', icon: '🥉', color: 'text-amber-600' }
    if (rank <= 10) return { title: 'Bathroom Baron', icon: '🏆', color: 'text-purple-400' }
    if (rank <= 25) return { title: 'Restroom Royalty', icon: '👸', color: 'text-blue-400' }
    if (rank <= 50) return { title: 'Loo Legend', icon: '⭐', color: 'text-green-400' }
    if (totalTime >= 36000) return { title: 'Poop Prodigy', icon: '💎', color: 'text-cyan-400' } // 10+ hours
    if (totalTime >= 18000) return { title: 'Toilet Trainee', icon: '🎯', color: 'text-orange-400' } // 5+ hours
    return { title: 'Bathroom Beginner', icon: '🚽', color: 'text-dark-400' }
  }
  
  // Currency formatting is now handled by CurrencyContext
  
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
          🏆 Poop Champions Board
        </h1>
        <p className="text-dark-400">
          See who's making the most toilet treasure! 💩💰
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
                {getRankTitle(userRank || 999, userProfile.totalTime || 0).icon}
              </div>
              <div>
                <p className="text-white font-semibold">
                  {user?.displayName || 'You'}
                </p>
                <p className={`text-sm ${getRankTitle(userRank || 999, userProfile.totalTime || 0).color}`}>
                  {getRankTitle(userRank || 999, userProfile.totalTime || 0).title}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-primary-400 font-bold text-xl">
                {formatTime(userProfile.totalTime || 0)}
              </p>
              <p className="text-dark-400 text-sm">
                {userRank ? `#${userRank}` : 'Unranked'}
              </p>
              {(() => {
                const currencyDisplay = getCurrencyDisplay(userProfile.totalEarnings || 0, userProfile.currency || 'USD');
                return (
                  <div className="mt-2">
                    <p className="text-dark-300 text-sm">
                      {currencyDisplay.local || currencyDisplay.usd}
                    </p>
                  </div>
                );
              })()}
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
      
      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : activeTab === 'global' ? (
        /* Global Leaderboard */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {globalLeaders.length > 0 ? (
            globalLeaders.map((leader, index) => {
              const rankInfo = getRankTitle(leader.rank, leader.totalTime || 0)
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
                    <div className="flex items-center gap-2">
                      {/* Rank Number */}
                      <div className="flex items-center justify-center w-8 h-8">
                        <span className="text-dark-400 font-bold text-lg">
                          {leader.rank}
                        </span>
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
                      <p className="text-primary-400 font-bold text-xl">
                        {formatTime(leader.totalTime || 0)}
                      </p>
                      {leader.currentStreak > 0 && (
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <Zap size={14} className="text-yellow-400" />
                          <span className="text-yellow-400 text-sm font-medium">{leader.currentStreak}</span>
                        </div>
                      )}
                      {(() => {
                        const currencyDisplay = getCurrencyDisplay(leader.totalEarnings || 0, leader.currency || 'USD')
                        return (
                          <div className="mt-2">
                            <p className="text-dark-300 text-sm">
                              {currencyDisplay.local || currencyDisplay.usd}
                            </p>
                          </div>
                        )
                      })()}
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
                Be the first to start earning!
              </p>
            </motion.div>
          )}
        </motion.div>
      ) : (
        /* Friends Tab */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {/* Friend Requests Notifications */}
          {friendRequests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card p-4 border border-yellow-500/30 bg-yellow-500/5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Bell size={20} className="text-yellow-400" />
                <h3 className="text-white font-semibold">
                  Friend Requests ({friendRequests.length})
                </h3>
              </div>
              <div className="space-y-2">
                {friendRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">👤</div>
                      <div>
                        <p className="text-white font-medium">
                          {request.senderProfile?.displayName || 'Anonymous'}
                        </p>
                        <p className="text-dark-400 text-sm">
                          wants to be your friend
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptFriendRequest(request.id, request.fromUserId, request.senderProfile?.displayName)}
                        className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                      >
                        <Check size={16} className="text-white" />
                      </button>
                      <button
                        onClick={() => rejectFriendRequest(request.id, request.senderProfile?.displayName)}
                        className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                      >
                        <X size={16} className="text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          
          {/* Add Friend Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={() => setShowAddFriend(!showAddFriend)}
              className="w-full card p-4 hover:bg-dark-700 transition-colors border border-primary-500/30"
            >
              <div className="flex items-center justify-center gap-2">
                <UserPlus size={20} className="text-primary-400" />
                <span className="text-white font-medium">
                  {showAddFriend ? 'Cancel' : 'Add Friends'}
                </span>
              </div>
            </button>
          </motion.div>
          
          {/* Add Friend Search */}
          {showAddFriend && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="card p-4"
            >
              <div className="relative mb-4">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400" />
                <input
                  type="text"
                  placeholder="Search users by username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:border-primary-500 focus:outline-none"
                />
              </div>
              
              {/* Search Results */}
              {searchLoading ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner size="sm" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">👤</div>
                        <div>
                          <p className="text-white font-medium">
                            {user.displayName || 'Anonymous'}
                          </p>
                          <p className="text-dark-400 text-sm">
                            {formatTime(user.totalTime || 0)} throne time
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => sendFriendRequest(user.id, user.displayName)}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                      >
                        Add Friend
                      </button>
                    </div>
                  ))}
                </div>
              ) : searchQuery.trim() && !searchLoading ? (
                <p className="text-dark-400 text-center py-4">
                  No users found matching "{searchQuery}"
                </p>
              ) : null}
            </motion.div>
          )}
          
          {/* Friends List */}
          {friendsLeaders.length > 0 || userProfile ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Users size={20} className="text-primary-400" />
                Poop Buddy Rankings ({friendsLeaders.length + (userProfile ? 1 : 0)})
              </h3>
              {(() => {
                // Create combined list with user and friends
                const combinedList = [...friendsLeaders]
                if (userProfile) {
                  combinedList.push({
                    id: user.uid,
                    ...userProfile,
                    isCurrentUser: true
                  })
                }
                // Sort by total time
                combinedList.sort((a, b) => (b.totalTime || 0) - (a.totalTime || 0))
                
                return combinedList.map((person, index) => {
                  const rankInfo = getRankTitle(person.rank, person.totalTime || 0)
                  const isCurrentUser = person.id === user?.uid
                  
                  return (
                    <motion.div
                      key={person.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className={`card p-3 ${
                        isCurrentUser ? 'border border-primary-500/50 bg-primary-500/5' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {/* Rank Number */}
                          <div className="flex items-center justify-center w-8 h-8">
                            <span className="text-dark-400 font-bold text-lg">
                              {index + 1}
                            </span>
                          </div>
                          
                          {/* User Info */}
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{rankInfo.icon}</div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-white font-semibold">
                                  {person.displayName || 'Anonymous Pooper'}
                                  {isCurrentUser && (
                                    <span className="text-primary-400 text-sm ml-2">(You)</span>
                                  )}
                                </p>
                                {person.isPremium && (
                                  <Crown size={16} className="text-accent-400" />
                                )}
                              </div>
                              <p className={`text-sm ${rankInfo.color}`}>
                                {rankInfo.title}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Stats and Actions */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-primary-400 font-bold text-xl">
                              {formatTime(person.totalTime || 0)}
                            </p>
                            {person.currentStreak > 0 && (
                              <div className="flex items-center justify-end gap-1 mt-1">
                                <Zap size={14} className="text-yellow-400" />
                                <span className="text-yellow-400 text-sm font-medium">{person.currentStreak}</span>
                              </div>
                            )}
                            {(() => {
                              const currencyDisplay = getCurrencyDisplay(person.totalEarnings || 0, person.currency || 'USD');
                              return (
                                <div className="mt-2">
                                  <p className="text-dark-300 text-sm">
                                    {currencyDisplay.local || currencyDisplay.usd}
                                  </p>
                                </div>
                              );
                            })()}
                          </div>
                          
                          {/* Remove Friend Button - only for friends, not current user */}
                          {!isCurrentUser && (
                            <button
                              onClick={() => removeFriend(person.friendshipId, person.displayName)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Remove friend"
                            >
                              <UserX size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              })()}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="card p-8 text-center"
            >
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                No friends yet
              </h3>
              <p className="text-dark-400 mb-4">
                Add friends to compete and see their rankings!
              </p>
              <button
                onClick={() => setShowAddFriend(true)}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
              >
                <UserPlus size={20} />
                Add Your First Friend
              </button>
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