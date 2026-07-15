'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react'

type Language = 'fr' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

/* -------------------------------------------------------
   TRANSLATIONS
------------------------------------------------------- */
const translations: Record<Language, Record<string, string>> = {
  fr: {
    /* ---------------- ARTISAN DASHBOARD ---------------- */
    "artisanHeader": "Tableau de bord artisan",
    "logout": "Se déconnecter",
    "proposals": "Propositions",
    "messages": "Messages",
    "editProfile": "Modifier le profil",
    "unsubscribe": "Se désinscrire",
    "unsubscribeConfirm": "Êtes-vous sûr de vouloir vous désinscrire ?"
  },

  en: {
    /* ---------------- ARTISAN DASHBOARD ---------------- */
    "artisanHeader": "Artisan dashboard",
    "logout": "Logout",
    "proposals": "Proposals",
    "messages": "Messages",
    "editProfile": "Edit Profile",
    "unsubscribe": "Unsubscribe",
    "unsubscribeConfirm": "Are you sure you want to unsubscribe?"
  }
}

/* -------------------------------------------------------
   PROVIDER
------------------------------------------------------- */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('language') as Language
    if (saved === 'fr' || saved === 'en') setLanguage(saved)
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    if (mounted) localStorage.setItem('language', lang)
  }

  const t = (key: string): string => {
    return translations[language]?.[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

/* -------------------------------------------------------
   HOOK
------------------------------------------------------- */
export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}
