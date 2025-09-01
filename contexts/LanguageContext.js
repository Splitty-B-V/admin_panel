import { createContext, useContext, useState, useEffect } from 'react'
import { nl } from '../translations/nl'
import { en } from '../translations/en'

const LanguageContext = createContext()

const translations = {
  nl,
  en
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('nl')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('restaurantLanguage')
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage)
    }
  }, [])

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang)
      localStorage.setItem('restaurantLanguage', lang)
      setIsOpen(false)
    }
  }

  const t = (key) => {
    const keys = key.split('.')
    let value = translations[language]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    return value || key
  }

  const value = {
    language,
    changeLanguage,
    t,
    isOpen,
    setIsOpen,
    availableLanguages: [
      { code: 'nl', name: 'Nederlands' },
      { code: 'en', name: 'English' }
    ]
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}