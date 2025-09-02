interface EnvConfig {
    // API
    apiUrl: string
    apiVersion: string

    // App
    appUrl: string
    defaultLocale: string

    // Sentry
    sentryDsn?: string

    // Stripe
    stripePublishableKey?: string

    // Environment
    isDevelopment: boolean
}

// Function for validation and getting variables
function getEnvConfig(): EnvConfig {
    // Checking required variables
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (!apiUrl) {
        throw new Error('NEXT_PUBLIC_API_URL is required')
    }

    return {
        // API
        apiUrl,
        apiVersion: process.env.NEXT_PUBLIC_API_VERSION || 'v2',

        // App
        appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000/api',
        defaultLocale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'nl',

        // Sentry
        sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

        // Stripe
        stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,

        // Environment
        isDevelopment: process.env.NODE_ENV === 'development'
    }
}

// Export config
export const env = getEnvConfig()
