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
   CLEAN, GROUPED, MAINTAINABLE TRANSLATIONS
------------------------------------------------------- */
const translations: Record<Language, Record<string, string>> = {
  fr: {
    /* ---------------- APP ---------------- */
    "app.title": "Coup de Pouce",
    "app.createAccount": "Créer un compte",
    "app.connect": "Se connecter",
    "app.back": "Retour",

    /* ---------------- LOGIN ---------------- */
    "login.title": "Connexion",
    "login.subtitle": "Pas encore de compte ?",
    "login.signup": "S'inscrire",
    "login.email": "Email",
    "login.password": "Mot de passe",
    "login.button": "Se connecter",
    "login.noAccount": "Pas encore de compte ?",
    "login.backToLogin": "Retour à la connexion",

    /* LOGIN ERRORS */
    "login.incorrectCredentials": "Email ou mot de passe incorrect",
    "login.sessionError": "Impossible de charger votre session",
    "login.profileError": "Impossible de charger votre profil",
    "login.noRole": "Votre compte n’a aucun rôle assigné",
    "login.genericError": "Erreur lors de la connexion",

    /* ---------------- FORGOT PASSWORD ---------------- */
    "forgotPassword.title": "Mot de passe oublié ?",
    "forgotPassword.subtitle": "Entrez votre email pour recevoir un lien de réinitialisation",
    "forgotPassword.email": "Email",
    "forgotPassword.send": "Envoyer le lien de réinitialisation",
    "forgotPassword.sending": "Envoi en cours...",
    "forgotPassword.backToLogin": "Retour à la connexion",
    "forgotPassword.emailSent": "Email envoyé !",
    "forgotPassword.emailSentDesc": "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.",
    "forgotPassword.checkInbox": "Vérifiez votre boîte de réception et les spam.",

    /* ---------------- SIGNUP ---------------- */
    "signup.title": "Inscription",
    "signup.subtitle": "Je suis un",
    "signup.client": "Client",
    "signup.artisan": "Artisan",
    "signup.confirmPassword": "Confirmer le mot de passe",
    "signup.continue": "Continuer",
    "signup.passwordMismatch": "Les mots de passe ne correspondent pas",
    "signup.acceptTerms": "Vous devez accepter les conditions générales",
    "signup.signupError": "Erreur lors de l'inscription",
    "signup.alreadyHaveAccount": "Vous avez déjà un compte ?",
    "signup.goToLogin": "Se connecter",

    /* ---------------- COMMON ---------------- */
    "common.loading": "Chargement...",
    "common.error": "Une erreur est survenue",
    "common.redirecting": "Redirection...",
    "common.welcome": "Bienvenue",

    /* ---------------- HOME ---------------- */
    "home.qualifiedArtisans": "Artisans qualifiés",
    "home.satisfiedClients": "Clients satisfaits",
    "home.artisanAlt": "Artisans professionnels au travail",
    "home.clientAlt": "Clients satisfaits recevant de l'aide",

    /* ---------------- LANGUAGE ---------------- */
    "language": "fr",
  },

  en: {
    /* ---------------- APP ---------------- */
    "app.title": "Helping Hand",
    "app.createAccount": "Create account",
    "app.connect": "Connect",
    "app.back": "Back",

    /* ---------------- LOGIN ---------------- */
    "login.title": "Login",
    "login.subtitle": "Don't have an account?",
    "login.signup": "Sign up",
    "login.email": "Email",
    "login.password": "Password",
    "login.button": "Connect",
    "login.noAccount": "Don't have an account?",
    "login.backToLogin": "Back to login",

    /* LOGIN ERRORS */
    "email ou mot de passe incorrect": "Incorrect email or password",
    "login.sessionError": "Unable to load your session",
    "login.profileError": "Unable to load your profile",
    "login.noRole": "Your account has no role assigned",
    "login.genericError": "Error during login",

    /* ---------------- FORGOT PASSWORD ---------------- */
    "forgotPassword.title": "Forgot password?",
    "forgotPassword.subtitle": "Enter your email to receive a reset link",
    "forgotPassword.email": "Email",
    "forgotPassword.send": "Send reset link",
    "forgotPassword.sending": "Sending...",
    "forgotPassword.backToLogin": "Back to login",
    "forgotPassword.emailSent": "Email sent!",
    "forgotPassword.emailSentDesc": "If an account exists with this email, you will receive a password reset link.",
    "forgotPassword.checkInbox": "Check your inbox and spam folder.",

    /* ---------------- SIGNUP ---------------- */
    "signup.title": "Sign Up",
    "signup.subtitle": "I am a",
    "signup.client": "Client",
    "signup.artisan": "Craftsman",
    "signup.confirmPassword": "Confirm password",
    "signup.continue": "Continue",
    "signup.passwordMismatch": "Passwords do not match",
    "signup.acceptTerms": "You must accept the terms and conditions",
    "signup.signupError": "Error during registration",
    "signup.alreadyHaveAccount": "Already have an account?",
    "signup.goToLogin": "Log in",

    /* ---------------- COMMON ---------------- */
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.redirecting": "Redirecting...",
    "common.welcome": "Welcome",

    /* ---------------- HOME ---------------- */
    "home.qualifiedArtisans": "Qualified artisans",
    "home.satisfiedClients": "Satisfied clients",
    "home.artisanAlt": "Professional artisans working",
    "home.clientAlt": "Happy clients receiving help",

    /* ---------------- LANGUAGE ---------------- */
    "language": "en",
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
