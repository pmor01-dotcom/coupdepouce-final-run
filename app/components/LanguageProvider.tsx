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
    "forgotPassword.newPassword": "Nouveau mot de passe",
    "forgotPassword.updatePassword": "Mettre à jour le mot de passe",
    "forgotPassword.passwordUpdated": "Mot de passe mis à jour avec succès",

    /* ---------------- SIGNUP ---------------- */
    "signup.title": "Inscription",
    "signup.subtitle": "Je suis un",
    "signup.client": "Client",
    "signup.client.desc": "Je cherche un artisan pour mes travaux",
    "signup.artisan": "Artisan",
    "signup.artisan.desc": "Je propose mes services aux clients",
    "signup.confirmPassword": "Confirmer le mot de passe",
    "signup.continue": "Continuer",
    "signup.passwordMismatch": "Les mots de passe ne correspondent pas",
    "signup.acceptTerms": "Vous devez accepter les conditions générales",
    "signup.signupError": "Erreur lors de l'inscription",
    "signup.alreadyHaveAccount": "Vous avez déjà un compte ?",
    "signup.goToLogin": "Se connecter",
    "signup.back": "Retour",

    /* ---------------- CLIENT SIGNUP ---------------- */
    "clientSignup.title": "Créer un compte client",
    "clientSignup.firstName": "Prénom",
    "clientSignup.lastName": "Nom",
    "clientSignup.email": "Email",
    "clientSignup.password": "Mot de passe",
    "clientSignup.confirmPassword": "Confirmer le mot de passe",
    "clientSignup.city": "Ville",
    "clientSignup.create": "Créer mon compte",
    "clientSignup.creating": "Création en cours...",

    /* ---------------- ARTISAN SIGNUP ---------------- */
    "artisanSignup.title": "Créer un compte artisan",
    "artisanSignup.subtitle": "Offrez vos services aux clients",
    "artisanSignup.fullName": "Nom complet",
    "artisanSignup.email": "Email",
    "artisanSignup.password": "Mot de passe",
    "artisanSignup.confirmPassword": "Confirmer le mot de passe",
    "artisanSignup.trade": "Métier/Profession",
    "artisanSignup.city": "Ville",
    "artisanSignup.phone": "Téléphone",
    "artisanSignup.create": "Créer mon compte",
    "artisanSignup.creating": "Création en cours...",

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

    /* ---------------- WORK/TRADE ---------------- */
    "work.select": "Sélectionnez votre métier",
    "work.plumber": "Plombier",
    "work.electrician": "Électricien",
    "work.carpenter": "Menuisier",
    "work.painter": "Peintre",
    "work.mason": "Maçon",
    "work.roofer": "Couvreur",
    "work.locksmith": "Serrurier",
    "work.heating": "Chauffagiste",
    "work.plasterer": "Plâtrier",
    "work.tiler": "Carreleur",
    "work.toolRental": "Location d'outils",
    "work.babysitting": "Garde d'enfants",
    "work.gardening": "Jardinage",
    "work.shopping": "Courses",
    "work.other": "Autre",

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
    "login.forgotPassword": "Forgot password?",

    /* LOGIN ERRORS */
    "login.incorrectCredentials": "Incorrect email or password",
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
    "forgotPassword.newPassword": "New password",
    "forgotPassword.updatePassword": "Update password",
    "forgotPassword.passwordUpdated": "Password updated successfully",

    /* ---------------- SIGNUP ---------------- */
    "signup.title": "Sign Up",
    "signup.subtitle": "I am a",
    "signup.client": "Client",
    "signup.client.desc": "I'm looking for a craftsman for my work",
    "signup.artisan": "Craftsman",
    "signup.artisan.desc": "I offer my services to clients",
    "signup.confirmPassword": "Confirm password",
    "signup.continue": "Continue",
    "signup.passwordMismatch": "Passwords do not match",
    "signup.acceptTerms": "You must accept the terms and conditions",
    "signup.signupError": "Error during registration",
    "signup.alreadyHaveAccount": "Already have an account?",
    "signup.goToLogin": "Log in",
    "signup.back": "Back",

    /* ---------------- CLIENT SIGNUP ---------------- */
    "clientSignup.title": "Create client account",
    "clientSignup.firstName": "First name",
    "clientSignup.lastName": "Last name",
    "clientSignup.email": "Email",
    "clientSignup.password": "Password",
    "clientSignup.confirmPassword": "Confirm password",
    "clientSignup.city": "City",
    "clientSignup.create": "Create my account",
    "clientSignup.creating": "Creating...",

    /* ---------------- ARTISAN SIGNUP ---------------- */
    "artisanSignup.title": "Create artisan account",
    "artisanSignup.subtitle": "Offer your services to clients",
    "artisanSignup.fullName": "Full name",
    "artisanSignup.email": "Email",
    "artisanSignup.password": "Password",
    "artisanSignup.confirmPassword": "Confirm password",
    "artisanSignup.trade": "Trade/Profession",
    "artisanSignup.city": "City",
    "artisanSignup.phone": "Phone",
    "artisanSignup.create": "Create my account",
    "artisanSignup.creating": "Creating...",

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
    "home.welcome": "Welcome",

    /* ---------------- WORK/TRADE ---------------- */
    "work.select": "Select your trade",
    "work.plumber": "Plumber",
    "work.electrician": "Electrician",
    "work.carpenter": "Carpenter",
    "work.painter": "Painter",
    "work.mason": "Mason",
    "work.roofer": "Roofer",
    "work.locksmith": "Locksmith",
    "work.heating": "Heating technician",
    "work.plasterer": "Plasterer",
    "work.tiler": "Tiler",
    "work.toolRental": "Tool rental",
    "work.babysitting": "Babysitting",
    "work.gardening": "Gardening",
    "work.shopping": "Shopping",
    "work.other": "Other",

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
