import nlTranslations from '@/public/locales/nl/common.json'
import enTranslations from '@/public/locales/en/common.json'
import deTranslations from '@/public/locales/de/common.json'

const translations = {
    nl: nlTranslations,
    en: enTranslations,
    de: deTranslations
}

export function getTranslations(locale: string = 'nl') {
    return translations[locale as keyof typeof translations] || translations.nl
}

export function t(key: string, locale: string = 'nl'): string {
    const trans = getTranslations(locale)
    return trans[key as keyof typeof trans] || key
}