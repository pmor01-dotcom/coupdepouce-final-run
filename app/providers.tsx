'use client'

import {useAuth } from './components/AuthProvider'

import { LanguageProvider } from './components/LanguageProvider'

export function Providers({ children }) {
  return (
    
      <LanguageProvider>
        {children}
      </LanguageProvider>
    
  )
}