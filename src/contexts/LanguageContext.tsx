'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { t as translate } from '@/lib/i18n'

interface LanguageOption {
  code: string
  name: string
}

interface LanguageContextType {
  locale: string
  setLocale: (locale: string) => void
  t: (key: string) => string
  availableLanguages: LanguageOption[]
}

// Определяем доступные языки на основе ваших локалей
const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: 'nl', name: 'Nederlands' },
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' }
]

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState('nl')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const savedLocale = localStorage.getItem('locale') || 'nl'
    setLocale(savedLocale)
  }, [])

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('locale', locale)
    }
  }, [locale, isClient])

  const t = (key: string) => translate(key, locale)

  return (
      <LanguageContext.Provider value={{
        locale,
        setLocale,
        t,
        availableLanguages: AVAILABLE_LANGUAGES
      }}>
        {children}
      </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}