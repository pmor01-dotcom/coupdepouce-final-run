'use client'

import { AuthProvider } from './components/AuthProvider'

import { LanguageProvider } from './components/LanguageProvider'

export function Providers({ children }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </AuthProvider>
  )
}