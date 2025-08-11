import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, 
  Clock, 
  Calendar,
  ArrowRight,
  Check,
  Globe
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

// Comprehensive currency list
const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'EGP', symbol: '£', name: 'Egyptian Pound' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'CLP', symbol: '$', name: 'Chilean Peso' },
  { code: 'COP', symbol: '$', name: 'Colombian Peso' },
  { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol' },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
  { code: 'UYU', symbol: '$', name: 'Uruguayan Peso' }
]

const WORK_DAYS = [
  { id: 'monday', label: 'Monday', short: 'Mon' },
  { id: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { id: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { id: 'thursday', label: 'Thursday', short: 'Thu' },
  { id: 'friday', label: 'Friday', short: 'Fri' },
  { id: 'saturday', label: 'Saturday', short: 'Sat' },
  { id: 'sunday', label: 'Sunday', short: 'Sun' }
]

function Onboarding() {
  const { updateUserProfile, user } = useAuth()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    currency: 'USD',
    annualSalary: '',
    workStartTime: '09:00',
    workEndTime: '17:00',
    workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  })
  
  const totalSteps = 3
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  const handleWorkDayToggle = (dayId) => {
    setFormData(prev => ({
      ...prev,
      workDays: prev.workDays.includes(dayId)
        ? prev.workDays.filter(id => id !== dayId)
        : [...prev.workDays, dayId]
    }))
  }
  
  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.currency && formData.annualSalary && parseFloat(formData.annualSalary) > 0
      case 2:
        return formData.workStartTime && formData.workEndTime && formData.workStartTime !== formData.workEndTime
      case 3:
        return formData.workDays.length > 0
      default:
        return false
    }
  }
  
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    } else {
      toast.error('Please fill in all required fields')
    }
  }
  
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }
  
  const handleComplete = async () => {
    if (!validateStep(3)) {
      toast.error('Please complete all steps')
      return
    }
    
    setLoading(true)
    try {
      const selectedCurrency = CURRENCIES.find(c => c.code === formData.currency)
      
      await updateUserProfile({
        currency: formData.currency,
        currencySymbol: selectedCurrency.symbol,
        annualSalary: parseFloat(formData.annualSalary),
        workStartTime: formData.workStartTime,
        workEndTime: formData.workEndTime,
        workDays: formData.workDays,
        onboardingCompleted: true,
        profileCompleted: true
      })
      
      toast.success('Profile setup complete! 🎉')
      navigate('/home')
    } catch (error) {
      console.error('Onboarding error:', error)
      toast.error('Failed to save profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">💰</div>
        <h2 className="text-2xl font-display font-bold text-white mb-2">
          What's your salary?
        </h2>
        <p className="text-gray-400">
          We'll use this to calculate your earnings per bathroom break
        </p>
      </div>
      
      {/* Currency Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Currency
        </label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <select
            value={formData.currency}
            onChange={(e) => handleInputChange('currency', e.target.value)}
            className="input-field pl-10 w-full"
          >
            {CURRENCIES.map(currency => (
              <option key={currency.code} value={currency.code}>
                {currency.symbol} {currency.code} - {currency.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Annual Salary */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Annual Salary
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="number"
            value={formData.annualSalary}
            onChange={(e) => handleInputChange('annualSalary', e.target.value)}
            placeholder="50000"
            className="input-field pl-10 w-full"
            min="0"
            step="1000"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Enter your gross annual salary before taxes
        </p>
      </div>
    </motion.div>
  )
  
  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">⏰</div>
        <h2 className="text-2xl font-display font-bold text-white mb-2">
          Work Schedule
        </h2>
        <p className="text-gray-400">
          When do you typically work? This helps us calculate paid vs unpaid breaks.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Start Time
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="time"
              value={formData.workStartTime}
              onChange={(e) => handleInputChange('workStartTime', e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            End Time
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="time"
              value={formData.workEndTime}
              onChange={(e) => handleInputChange('workEndTime', e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
        </div>
      </div>
      
      {formData.workStartTime && formData.workEndTime && (
        <div className="card p-4 bg-orange-500/10 border-orange-500/30">
          <p className="text-orange-400 text-sm">
            Work hours: {formData.workStartTime} - {formData.workEndTime}
            {' '}({Math.abs(new Date(`2000-01-01T${formData.workEndTime}`) - new Date(`2000-01-01T${formData.workStartTime}`)) / (1000 * 60 * 60)} hours)
          </p>
        </div>
      )}
    </motion.div>
  )
  
  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">📅</div>
        <h2 className="text-2xl font-display font-bold text-white mb-2">
          Work Days
        </h2>
        <p className="text-gray-400">
          Select the days you typically work
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {WORK_DAYS.map(day => (
          <button
            key={day.id}
            onClick={() => handleWorkDayToggle(day.id)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              formData.workDays.includes(day.id)
                ? 'border-orange-500 bg-orange-500/20 text-orange-400'
                : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{day.short}</div>
                <div className="text-xs opacity-75">{day.label}</div>
              </div>
              {formData.workDays.includes(day.id) && (
                <Check size={20} className="text-orange-400" />
              )}
            </div>
          </button>
        ))}
      </div>
      
      {formData.workDays.length > 0 && (
        <div className="card p-4 bg-green-500/10 border-green-500/30">
          <p className="text-green-400 text-sm">
            Selected: {formData.workDays.length} work days per week
          </p>
        </div>
      )}
    </motion.div>
  )
  
  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-md mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-gray-400">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        
        {/* Welcome Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold gradient-text mb-2">
            Welcome to PooDough!
          </h1>
          <p className="text-gray-400">
            Let's set up your profile to start earning
          </p>
        </div>
        
        {/* Step Content */}
        <div className="card mb-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex gap-4">
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="btn-ghost flex-1"
            >
              Back
            </button>
          )}
          
          {currentStep < totalSteps ? (
            <button
              onClick={nextStep}
              disabled={!validateStep(currentStep)}
              className={`btn-primary flex-1 flex items-center justify-center gap-2 ${
                !validateStep(currentStep) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span>Next</span>
              <ArrowRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={loading || !validateStep(3)}
              className={`btn-primary flex-1 flex items-center justify-center gap-2 ${
                loading || !validateStep(3) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <span>Complete Setup</span>
                  <Check size={20} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Onboarding