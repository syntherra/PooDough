import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

// Comprehensive currency list with country names for alphabetical sorting
const CURRENCIES = [
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', country: 'United Arab Emirates' },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso', country: 'Argentina' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', country: 'Australia' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', country: 'Brazil' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', country: 'Canada' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', country: 'Switzerland' },
  { code: 'CLP', symbol: '$', name: 'Chilean Peso', country: 'Chile' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', country: 'China' },
  { code: 'COP', symbol: '$', name: 'Colombian Peso', country: 'Colombia' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', country: 'Czech Republic' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', country: 'Denmark' },
  { code: 'EGP', symbol: '£', name: 'Egyptian Pound', country: 'Egypt' },
  { code: 'EUR', symbol: '€', name: 'Euro', country: 'European Union' },
  { code: 'GBP', symbol: '£', name: 'British Pound', country: 'United Kingdom' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', country: 'Hong Kong' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', country: 'Hungary' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', country: 'Indonesia' },
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel', country: 'Israel' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', country: 'India' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', country: 'Japan' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', country: 'South Korea' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso', country: 'Mexico' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', country: 'Malaysia' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', country: 'Norway' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', country: 'New Zealand' },
  { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol', country: 'Peru' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', country: 'Philippines' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', country: 'Poland' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', country: 'Russia' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', country: 'Saudi Arabia' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', country: 'Sweden' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', country: 'Singapore' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', country: 'Thailand' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', country: 'Turkey' },
  { code: 'USD', symbol: '$', name: 'US Dollar', country: 'United States' },
  { code: 'UYU', symbol: '$', name: 'Uruguayan Peso', country: 'Uruguay' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', country: 'Vietnam' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', country: 'South Africa' }
].sort((a, b) => a.country.localeCompare(b.country))

const CurrencyContext = createContext()

export const useCurrency = () => {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}

// Exchange rate service
class ExchangeRateService {
  constructor() {
    this.rates = {}
    this.lastUpdate = null
    this.apiKey = null // We'll use a free API that doesn't require a key
  }

  async fetchRates() {
    try {
      // Using exchangerate-api.com free tier (1500 requests/month)
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
      const data = await response.json()
      
      if (data.rates) {
        this.rates = data.rates
        this.lastUpdate = new Date()
        
        // Cache rates in localStorage for offline use
        localStorage.setItem('exchangeRates', JSON.stringify({
          rates: this.rates,
          lastUpdate: this.lastUpdate.toISOString()
        }))
        
        console.log('✅ Exchange rates updated successfully')
        return true
      }
    } catch (error) {
      console.error('❌ Failed to fetch exchange rates:', error)
      
      // Try to load cached rates
      const cached = localStorage.getItem('exchangeRates')
      if (cached) {
        const { rates, lastUpdate } = JSON.parse(cached)
        this.rates = rates
        this.lastUpdate = new Date(lastUpdate)
        console.log('📦 Using cached exchange rates')
        return true
      }
    }
    return false
  }

  convert(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount
    
    // Convert to USD first if not already USD
    let usdAmount = amount
    if (fromCurrency !== 'USD') {
      const fromRate = this.rates[fromCurrency]
      if (!fromRate) return amount // Fallback if rate not available
      usdAmount = amount / fromRate
    }
    
    // Convert from USD to target currency
    if (toCurrency === 'USD') {
      return usdAmount
    }
    
    const toRate = this.rates[toCurrency]
    if (!toRate) return amount // Fallback if rate not available
    
    return usdAmount * toRate
  }

  shouldUpdate() {
    if (!this.lastUpdate) return true
    
    // Update once per day
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)
    
    return this.lastUpdate < oneDayAgo
  }
}

const exchangeService = new ExchangeRateService()

export function CurrencyProvider({ children }) {
  const { userProfile } = useAuth()
  const [exchangeRates, setExchangeRates] = useState({})
  const [ratesLoading, setRatesLoading] = useState(false)
  const [lastRateUpdate, setLastRateUpdate] = useState(null)

  // Get user's selected currency or default to USD
  const userCurrency = userProfile?.currency || 'USD'
  const userCurrencyData = CURRENCIES.find(c => c.code === userCurrency) || CURRENCIES.find(c => c.code === 'USD')

  // Update exchange rates
  const updateExchangeRates = async () => {
    if (ratesLoading) return
    
    setRatesLoading(true)
    try {
      const success = await exchangeService.fetchRates()
      if (success) {
        setExchangeRates(exchangeService.rates)
        setLastRateUpdate(exchangeService.lastUpdate)
      }
    } catch (error) {
      console.error('Failed to update exchange rates:', error)
    } finally {
      setRatesLoading(false)
    }
  }

  // Initialize exchange rates on mount
  useEffect(() => {
    if (exchangeService.shouldUpdate()) {
      updateExchangeRates()
    } else {
      setExchangeRates(exchangeService.rates)
      setLastRateUpdate(exchangeService.lastUpdate)
    }
  }, [])

  // Format currency with user's selected currency
  const formatCurrency = (amount, currencyCode = userCurrency, options = {}) => {
    const currency = CURRENCIES.find(c => c.code === currencyCode) || userCurrencyData
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: options.minimumFractionDigits ?? 2,
        maximumFractionDigits: options.maximumFractionDigits ?? 2,
        ...options
      }).format(amount)
    } catch (error) {
      // Fallback for unsupported currencies
      return `${currency.symbol}${amount.toFixed(2)}`
    }
  }

  // Convert amount between currencies
  const convertCurrency = (amount, fromCurrency, toCurrency = userCurrency) => {
    return exchangeService.convert(amount, fromCurrency, toCurrency)
  }

  // Format currency with conversion info for leaderboard
  const formatCurrencyWithUSD = (amount, originalCurrency = userCurrency) => {
    const localFormatted = formatCurrency(amount, originalCurrency)
    
    if (originalCurrency === 'USD') {
      return localFormatted
    }
    
    const usdAmount = convertCurrency(amount, originalCurrency, 'USD')
    const usdFormatted = formatCurrency(usdAmount, 'USD')
    
    return `${localFormatted} (${usdFormatted})`
  }

  // Get separate USD and local currency values for leaderboard
  const getCurrencyDisplay = (amount, leaderCurrency = userCurrency) => {
    const localFormatted = formatCurrency(amount, leaderCurrency)
    
    if (leaderCurrency === 'USD') {
      return {
        usd: localFormatted,
        local: null
      }
    }
    
    const usdAmount = convertCurrency(amount, leaderCurrency, 'USD')
    const usdFormatted = formatCurrency(usdAmount, 'USD')
    
    return {
      usd: usdFormatted,
      local: localFormatted
    }
  }

  const value = {
    // Currency data
    currencies: CURRENCIES,
    userCurrency,
    userCurrencyData,
    
    // Exchange rates
    exchangeRates,
    ratesLoading,
    lastRateUpdate,
    updateExchangeRates,
    
    // Formatting functions
    formatCurrency,
    convertCurrency,
    formatCurrencyWithUSD,
    getCurrencyDisplay
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export default CurrencyProvider