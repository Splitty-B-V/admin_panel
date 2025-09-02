import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { HomeIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../contexts/LanguageContext'

export default function Custom404() {
  const router = useRouter()
  const { t } = useLanguage()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Progress bar animation (10 seconds)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 1
      })
    }, 100)

    // Auto redirect after 10 seconds
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 10000)

    return () => {
      clearTimeout(timer)
      clearInterval(progressInterval)
    }
  }, [router])

  return (
    <div className="min-h-screen bg-white">
      <div className="flex flex-col min-h-screen max-w-[500px] mx-auto w-full">
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          <div className="w-full max-w-sm space-y-8">
            {/* Logo */}
            <div className="flex justify-center">
              <Image 
                src="/logo-trans.webp" 
                alt="Splitty" 
                width={120} 
                height={42}
                className="opacity-80"
              />
            </div>

            {/* 404 Number */}
            <div className="text-center">
              <h1 className="text-7xl font-light text-black">404</h1>
            </div>

            {/* Progress Bar */}
            <div className="w-full">
              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-gray-600 to-gray-800 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Text Content */}
            <div className="text-center space-y-2">
              <p className="text-gray-700 text-sm font-medium">
                {t('errors.pageNotFound') || 'Pagina niet gevonden'}
              </p>
              <p className="text-gray-500 text-xs">
                {t('errors.redirectingToDashboard') || 'Je wordt doorgestuurd naar het dashboard'}
              </p>
            </div>

            {/* Loading Spinner */}
            <div className="flex justify-center">
              <div className="w-10 h-10 border-[3px] border-gray-200 border-t-gray-800 rounded-full animate-spin" />
            </div>

            {/* Manual Return Button */}
            <div className="pt-4">
              <Link
                href="/dashboard"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200"
              >
                <HomeIcon className="h-4 w-4" />
                {t('errors.goToDashboard') || 'Ga naar dashboard'}
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}