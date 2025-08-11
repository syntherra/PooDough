import React, { useState } from 'react'
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
  Camera
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

function Profile() {
  const { user, userProfile, updateUserProfile, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
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
  
  // Calculate hourly rate
  const hourlyRate = userProfile?.salary ? userProfile.salary / (40 * 52) : 0
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }
  
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
            Profile
          </h1>
          <p className="text-dark-400 mt-1">
            Manage your account and earnings settings
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
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                className="input-field w-full mb-2"
                placeholder="Display Name"
              />
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
            <p className="text-dark-400 text-sm">Total Earned</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">
              {userProfile?.totalSessions || 0}
            </p>
            <p className="text-dark-400 text-sm">Sessions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent-400">
              {userProfile?.currentStreak || 0}
            </p>
            <p className="text-dark-400 text-sm">Day Streak</p>
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
          Salary Settings
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Annual Salary
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
              <p className="text-dark-300 text-sm mb-1">Your hourly rate:</p>
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
          Work Schedule
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
          onClick={handleLogout}
          className="w-full btn-ghost flex items-center justify-center gap-3 py-4 text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </motion.div>
    </div>
  )
}

export default Profile