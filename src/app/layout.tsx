import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import './globals.css'

export default function RootLayout({
   children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="nl">
            <body>
                <LanguageProvider>
                    <AuthProvider>
                        {children}
                    </AuthProvider>
                </LanguageProvider>
            </body>
        </html>
    )
}