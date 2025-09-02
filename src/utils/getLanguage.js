// Helper function to get the current language from localStorage
// Used for pages that don't have access to the LanguageContext (like login pages)

import { nl } from '../translations/nl'
import { en } from '../translations/en'

export function getLanguage() {
  // Check if we're in the browser
  if (typeof window === 'undefined') {
    return 'nl' // Default for SSR
  }
  
  // Get language from localStorage, default to 'nl'
  const language = localStorage.getItem('restaurant_language') || 'nl'
  return language
}

export function getTranslations() {
  const language = getLanguage()
  return language === 'en' ? en : nl
}

export function t(key) {
  const translations = getTranslations()
  
  // Navigate through the key path (e.g., 'login.title')
  const keys = key.split('.')
  let value = translations
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      // Return the key itself if translation not found
      console.warn(`Translation not found for key: ${key}`)
      return key
    }
  }
  
  return value
}