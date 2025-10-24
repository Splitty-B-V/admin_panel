import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import './globals.css'
import {ToastProvider} from "@/contexts/ToastContext";

export default function RootLayout({
   children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="nl">
            <body>
                <ToastProvider>
                    <LanguageProvider>
                        <AuthProvider>
                            {children}
                        </AuthProvider>
                    </LanguageProvider>
                </ToastProvider>
            </body>
        </html>
    )
}