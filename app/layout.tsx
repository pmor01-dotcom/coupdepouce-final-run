'use client'

import type { Metadata } from 'next'
import './globals.css'   // ← adjust this path if needed
import { Providers } from './providers'
import LanguageToggle from './components/LanguageToggle'
import { AuthProvider } from './components/AuthProvider'

export const metadata: Metadata = {
  title: 'Coup de Pouce - Artisans & Clients',
  description: 'Connectez-vous avec des artisans qualifiés pour vos projets',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <Providers>
            <LanguageToggle />
            {children}
          </Providers>
        </AuthProvider>
      </body>
    </html>
  )
}
