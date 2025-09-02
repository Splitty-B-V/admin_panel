import '../styles/globals.css'
import { LanguageProvider } from '../contexts/LanguageContext'
import {AuthProvider} from "../contexts/AuthContext";
import AuthGuard from "../components/restaurant/AuthGuard";

export default function App({ Component, pageProps }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AuthGuard>
          <Component {...pageProps} />
        </AuthGuard>
      </AuthProvider>
    </LanguageProvider>
  )
}