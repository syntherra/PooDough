import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  DollarSign, 
  Clock, 
  Calendar,
  Settings,
  LogOut,
  Edit3,
  Save,
  X,
  Crown,
  Camera,
  Trash2
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useCurrency } from '../contexts/CurrencyContext'
import { useTimer } from '../hooks/useTimer'
import LoadingSpinner from '../components/LoadingSpinner'
import NotificationSettings from '../components/NotificationSettings'
import toast from 'react-hot-toast'

function Profile() {
  const { user, userProfile, updateUserProfile, logout, checkDisplayNameAvailability } = useAuth()
  const { formatCurrency } = useCurrency()
  const { deleteAllSessions, loading: timerLoading } = useTimer()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null, message: '' })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteCountdown, setDeleteCountdown] = useState(5)
  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || '',
    salary: userProfile?.salary || '',
    workHoursStart: userProfile?.workHoursStart || '09:00',
    workHoursEnd: userProfile?.workHoursEnd || '17:00',
    workDays: userProfile?.workDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  })
  
  const weekDays = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ]
  
  // Debounced username availability check
  const checkUsernameAvailability = useCallback(
    async (displayName) => {
      if (!displayName || displayName === userProfile?.displayName) {
        setUsernameStatus({ checking: false, available: null, message: '' })
        return
      }

      setUsernameStatus({ checking: true, available: null, message: 'Checking availability...' })
      
      try {
        const result = await checkDisplayNameAvailability(displayName, user?.uid)
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
    [checkDisplayNameAvailability, user?.uid, userProfile?.displayName]
  )

  // Debounce the username check
  useEffect(() => {
    if (!isEditing) return
    
    const timeoutId = setTimeout(() => {
      checkUsernameAvailability(formData.displayName)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [formData.displayName, checkUsernameAvailability, isEditing])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleWorkDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      workDays: prev.workDays.includes(day)
        ? prev.workDays.filter(d => d !== day)
        : [...prev.workDays, day]
    }))
  }
  
  const handleSave = async () => {
    // Check if username is available before saving
    if (formData.displayName !== userProfile?.displayName && usernameStatus.available === false) {
      toast.error('Please choose a different username')
      return
    }

    // If username is still being checked, wait for it
    if (usernameStatus.checking) {
      toast.error('Please wait while we check username availability')
      return
    }

    setLoading(true)
    try {
      await updateUserProfile({
        displayName: formData.displayName,
        salary: parseFloat(formData.salary) || 0,
        workHoursStart: formData.workHoursStart,
        workHoursEnd: formData.workHoursEnd,
        workDays: formData.workDays
      })
      setIsEditing(false)
      setUsernameStatus({ checking: false, available: null, message: '' })
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleCancel = () => {
    setFormData({
      displayName: userProfile?.displayName || '',
      salary: userProfile?.salary || '',
      workHoursStart: userProfile?.workHoursStart || '09:00',
      workHoursEnd: userProfile?.workHoursEnd || '17:00',
      workDays: userProfile?.workDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    })
    setIsEditing(false)
  }
  
  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
  
  // Handle delete history confirmation
  const handleDeleteHistory = () => {
    setShowDeleteConfirm(true)
    setDeleteCountdown(5)
  }
  
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
    setDeleteCountdown(5)
  }
  
  const handleConfirmDelete = async () => {
    const success = await deleteAllSessions()
    if (success) {
      setShowDeleteConfirm(false)
      setDeleteCountdown(5)
    }
  }
  
  // Countdown timer for delete button
  useEffect(() => {
    let interval = null
    if (showDeleteConfirm && deleteCountdown > 0) {
      interval = setInterval(() => {
        setDeleteCountdown(prev => prev - 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [showDeleteConfirm, deleteCountdown])
  
  // Calculate hourly rate
  const hourlyRate = userProfile?.salary ? userProfile.salary / (40 * 52) : 0
  
  // Currency formatting is now handled by CurrencyContext
  
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
            💩 Poop Profile
          </h1>
          <p className="text-dark-400 mt-1">
            Manage your toilet treasure settings and poop stats
          </p>
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="btn-ghost p-3"
          >
            <Edit3 size={20} />
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="btn-ghost p-3"
            >
              <X size={20} />
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="btn-primary p-3"
            >
              {loading ? <LoadingSpinner size="sm" /> : <Save size={20} />}
            </button>
          </div>
        )}
      </motion.div>
      
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="card p-6 mb-6"
      >
        <div className="flex items-center gap-4 mb-6">
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                user?.displayName?.charAt(0)?.toUpperCase() || '👤'
              )}
            </div>
            {userProfile?.isPremium && (
              <Crown 
                size={16} 
                className="absolute -top-1 -right-1 text-accent-400 bg-dark-800 rounded-full p-1" 
              />
            )}
          </div>
          
          {/* User Info */}
          <div className="flex-1">
            {isEditing ? (
              <div className="mb-2">
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className={`input-field w-full ${
                    usernameStatus.available === false ? 'border-red-500' : 
                    usernameStatus.available === true ? 'border-green-500' : ''
                  }`}
                  placeholder="Display Name"
                />
                {usernameStatus.message && (
                  <p className={`text-xs mt-1 ${
                    usernameStatus.checking ? 'text-dark-400' :
                    usernameStatus.available === false ? 'text-red-400' :
                    usernameStatus.available === true ? 'text-green-400' : 'text-dark-400'
                  }`}>
                    {usernameStatus.message}
                  </p>
                )}
              </div>
            ) : (
              <h2 className="text-2xl font-bold text-white mb-1">
                {userProfile?.displayName || 'Anonymous Pooper'}
              </h2>
            )}
            <p className="text-dark-400">{user?.email}</p>
            {userProfile?.isPremium && (
              <div className="flex items-center gap-1 mt-2">
                <Crown size={16} className="text-accent-400" />
                <span className="text-accent-400 text-sm font-medium">Premium Member</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-dark-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-400">
              {formatCurrency(userProfile?.totalEarnings || 0)}
            </p>
            <p className="text-dark-400 text-sm">Toilet Treasure</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">
              {userProfile?.totalSessions || 0}
            </p>
            <p className="text-dark-400 text-sm">Poop Sessions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent-400">
              {userProfile?.currentStreak || 0}
            </p>
            <p className="text-dark-400 text-sm">Poop Streak</p>
          </div>
        </div>
      </motion.div>
      
      {/* Salary Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6 mb-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <DollarSign size={24} className="text-green-400" />
          💰 Poop Profit Settings
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Annual Salary (Your Poop Worth!)
            </label>
            {isEditing ? (
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                className="input-field w-full"
                placeholder="Enter your annual salary"
                min="0"
                step="1000"
              />
            ) : (
              <p className="text-white text-lg font-medium">
                {userProfile?.salary ? formatCurrency(userProfile.salary) : 'Not set'}
              </p>
            )}
          </div>
          
          {userProfile?.salary > 0 && (
            <div className="bg-dark-700 rounded-lg p-4">
              <p className="text-dark-300 text-sm mb-1">Your poop rate per hour:</p>
              <p className="text-primary-400 text-xl font-bold">
                {formatCurrency(hourlyRate)}/hour
              </p>
            </div>
          )}
        </div>
      </motion.div>
      
      {/* Work Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6 mb-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Clock size={24} className="text-blue-400" />
          🕘 Paid Poop Hours
        </h3>
        
        <div className="space-y-4">
          {/* Work Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Start Time
              </label>
              {isEditing ? (
                <input
                  type="time"
                  name="workHoursStart"
                  value={formData.workHoursStart}
                  onChange={handleInputChange}
                  className="input-field w-full"
                />
              ) : (
                <p className="text-white font-medium">
                  {userProfile?.workHoursStart || '09:00'}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                End Time
              </label>
              {isEditing ? (
                <input
                  type="time"
                  name="workHoursEnd"
                  value={formData.workHoursEnd}
                  onChange={handleInputChange}
                  className="input-field w-full"
                />
              ) : (
                <p className="text-white font-medium">
                  {userProfile?.workHoursEnd || '17:00'}
                </p>
              )}
            </div>
          </div>
          
          {/* Work Days */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-3">
              Work Days
            </label>
            <div className="grid grid-cols-2 gap-2">
              {weekDays.map((day) => {
                const isSelected = (isEditing ? formData.workDays : userProfile?.workDays || []).includes(day.value)
                return (
                  <button
                    key={day.value}
                    onClick={() => isEditing && handleWorkDayToggle(day.value)}
                    disabled={!isEditing}
                    className={`p-3 rounded-lg text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                    } ${!isEditing ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    {day.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <NotificationSettings />
      </motion.div>
      
      {/* Account Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        {!userProfile?.isPremium && (
          <button className="w-full btn-secondary flex items-center justify-center gap-3 py-4">
            <Crown size={20} />
            <span>Upgrade to Premium</span>
          </button>
        )}
        
        <button 
          onClick={handleDeleteHistory}
          className="w-full btn-ghost flex items-center justify-center gap-3 py-4 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
        >
          <Trash2 size={20} />
          <span>Delete All History</span>
        </button>
        
        <button 
          onClick={handleLogout}
          className="w-full btn-ghost flex items-center justify-center gap-3 py-4 text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </motion.div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-800 rounded-2xl p-6 max-w-md w-full border border-dark-700"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} className="text-red-400" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">
                Delete All History?
              </h3>
              
              <p className="text-dark-300 mb-6">
                This will permanently delete all your session history and reset your stats. This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={handleCancelDelete}
                  className="flex-1 btn-ghost py-3"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteCountdown > 0 || timerLoading}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                    deleteCountdown > 0 || timerLoading
                      ? 'bg-dark-700 text-dark-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {timerLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : deleteCountdown > 0 ? (
                    `Delete (${deleteCountdown}s)`
                  ) : (
                    'Yes, Delete'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Profile