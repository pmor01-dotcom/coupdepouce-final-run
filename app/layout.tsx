import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthProvider from './components/AuthProvider'
import { LanguageProvider } from './components/LanguageProvider'
import LanguageToggle from './components/LanguageToggle'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Coup de Pouce - Artisans & Clients',
  description: 'Connectez-vous avec des artisans qualifiés pour vos projets',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
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
