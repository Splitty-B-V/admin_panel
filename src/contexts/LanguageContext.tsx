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
  t: (key: string, params?: Record<string, any>) => string
  availableLanguages: LanguageOption[]
}

const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: 'nl', name: 'Nederlands' },
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' }
]

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState('nl') // Дефолт для сервера
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

  // Используем дефолтный язык до загрузки клиента
  const effectiveLocale = isClient ? locale : 'nl'

  const t = (key: string, params?: Record<string, any>) => {
    let translation = translate(key, effectiveLocale)

    // Если есть параметры, заменяем плейсхолдеры простой заменой строк
    if (params) {
      for (const [paramKey, paramValue] of Object.entries(params)) {
        translation = translation.replaceAll(`{{${paramKey}}}`, String(paramValue))
      }
    }

    return translation
  }

  return (
      <LanguageContext.Provider value={{
        locale: effectiveLocale, // Возвращаем эффективный locale
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