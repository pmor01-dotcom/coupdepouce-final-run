import type { Metadata } from 'next'
import './globals.css'
import AuthProvider from './components/AuthProvider'
import { LanguageProvider } from './components/LanguageProvider'
import LanguageToggle from './components/LanguageToggle'

export const metadata: Metadata = {
  title: 'Coup de Pouce - Artisans & Clients',
  description: 'Connectez-vous avec des artisans qualifiés pour vos projets',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <LanguageProvider>
          <LanguageToggle />
          <AuthProvider>
            {children}
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}