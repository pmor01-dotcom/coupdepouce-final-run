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

// ----------------------
// TRANSLATIONS
// ----------------------
const translations: Record<Language, Record<string, string>> = {
  fr: {
    // App
    "app.title": "Coup de Pouce",
    "app.createAccount": "Créer un compte",
    "app.connect": "Se connecter",
    "app.back": "Retour",

    // Landing
    "landing.subtitle": "Trouvez un artisan qualifié près de chez vous",

    // Home
    "home.freePromoBanner": "Inscription gratuite pour artisans et clients pendant 6 mois.",
    "home.freePromoBannerSub": "Profitez de toutes les fonctionnalités sans frais pendant une période limitée.",
    "home.qualifiedArtisans": "Artisans qualifiés",
    "home.qualifiedArtisansDesc": "Des professionnels vérifiés et expérimentés à votre service",
    "home.satisfiedClients": "Clients satisfaits",
    "home.satisfiedClientsDesc": "Des milliers de clients nous font confiance",
    "welcome.line1": "Bienvenue sur Coup de Pouce, votre plateforme de mise en relation avec des artisans qualifiés.",
    "welcome.line2": "Trouvez rapidement le professionnel idéal pour tous vos travaux de rénovation, de réparation ou d'entretien.",
    "welcome.line3": "Nos artisans sont vérifiés, notés et prêts à répondre à vos besoins.",

    // About
    "about.title": "À propos de nous",
    "about.subtitle": "Découvrez notre mission et nos valeurs",
    "about.mission": "Notre mission",
    "about.mission1": "Faciliter la mise en relation entre clients et artisans de confiance.",
    "about.mission2": "Garantir la qualité et la fiabilité de tous les professionnels inscrits.",
    "about.commitment": "Notre engagement envers la qualité et la satisfaction client.",
    "about.projects": "Projets réalisés",
    "about.averageRating": "Note moyenne",
    "about.values": "Nos valeurs",
    "about.trust": "Confiance",
    "about.trustDesc": "Vérification rigoureuse de tous les artisans",
    "about.efficiency": "Efficacité",
    "about.efficiencyDesc": "Mise en relation rapide et simple",
    "about.proximity": "Proximité",
    "about.proximityDesc": "Artisans disponibles près de chez vous",
    "about.howItWorks": "Comment ça marche",
    "about.signup": "S'inscrire",
    "about.signupDesc": "Créez votre compte en quelques minutes",
    "about.publish": "Publier",
    "about.publishDesc": "Décrivez votre besoin ou vos services",
    "about.select": "Choisir",
    "about.selectDesc": "Sélectionnez le professionnel idéal",
    "about.realization": "Réalisation",
    "about.realizationDesc": "Concrétisez votre projet ensemble",
    "about.ctaTitle": "Prêt à commencer ?",
    "about.ctaSubtitle": "Rejoignez des milliers de clients satisfaits",
    "about.signUp": "S'inscrire",
    "about.contactUs": "Nous contacter",
    "about.backHome": "← Retour à l'accueil",

    // Login
    "login.title": "Connexion",
    "login.subtitle": "Pas encore de compte ?",
    "login.signup": "S'inscrire",
    "login.email": "Email",
    "login.exampleEmail": "exemple@email.com",
    "login.password": "Mot de passe",
    "login.button": "Se connecter",
    "login.noAccount": "Pas encore de compte ?",

    // Signup
    "signup.title": "Inscription",
    "signup.subtitle": "Je suis un",
    "signup.client": "Client",
    "signup.client.desc": "Je cherche un artisan pour mes travaux",
    "signup.artisan": "Artisan",
    "signup.artisan.desc": "Je propose mes services aux clients",
    "signup.confirmPassword": "Confirmer le mot de passe",
    "signup.forgotPassword": "Mot de passe oublié ?",
    "signup.continue": "Continuer",
    "signup.artisanRedirect": "Redirection vers le formulaire artisan...",
    "signup.selectRole": "Veuillez sélectionner votre type de compte",
    "signup.passwordMismatch": "Les mots de passe ne correspondent pas",
    "signup.acceptTerms": "Vous devez accepter les conditions générales",
    "signup.selectWorkDay": "Veuillez sélectionner au moins un jour de travail",
    "signup.signupError": "Erreur lors de l'inscription",
    "signup.alreadyHaveAccount": "Vous avez déjà un compte ?",
    "signup.goToLogin": "Se connecter",

    // Form
    "form.firstName": "Prénom",
    "form.city": "Ville",
    "form.department": "Département",

    // Common
    "common.loading": "Chargement...",
    "common.error": "Une erreur est survenue",
    "common.redirecting": "Redirection...",

    // Payment
    "payment.title": "Choisissez votre abonnement",
    "payment.subtitle": "Débloquez toutes les fonctionnalités pour trouver plus de clients",
    "payment.cardInfo": "Informations de carte",
    "payment.planSelected": "Plan sélectionné",
    "payment.monthly": "Mensuel",
    "payment.yearly": "Annuel",
    "payment.billing": "Adresse de facturation",
    "payment.streetPlaceholder": "Rue",
    "payment.city": "Ville",
    "payment.cityPlaceholder": "Ville",
    "payment.postal": "Code postal",
    "payment.postalPlaceholder": "Code postal",
    "payment.country": "Pays",
    "payment.subscription": "Abonnement",
    "payment.total": "Total",
    "payment.processing": "Traitement...",
    "payment.pay": "Payer",
    "payment.terms": "En payant, vous acceptez nos conditions générales",
    "payment.secure": "Paiement sécurisé par Stripe",
    "payment.chooseSubscription": "Choisissez votre abonnement",
    "payment.monthlySubscription": "Abonnement mensuel",
    "payment.billedMonthly": "Facturé mensuellement",
    "payment.yearlySubscription": "Abonnement annuel",
    "payment.save": "Économisez",
    "payment.perYear": "par an",
    "payment.included": "Inclus dans l'abonnement",
    "payment.unlimited": "Accès illimité aux demandes",
    "payment.verified": "Badge artisan vérifié",
    "payment.stats": "Statistiques détaillées",
    "payment.support": "Support prioritaire",
    "payment.noCommitment": "Sans engagement",
    "payment.hourlyRate": "Tarif horaire",
    "payment.freePromoTitle": "Accès gratuit pendant 6 mois",
    "payment.freePromoSubtitle": "Toutes les fonctionnalités sont offertes gratuitement pendant une période limitée.",
    "payment.freePromoNote": "Aucun paiement n'est requis pour les six prochains mois.",
    "payment.freePromoContinue": "Continuer vers le tableau de bord",
    "payment.freePromoBack": "Retour à l'inscription",
    "payment.freeStatusTitle": "Service gratuit pendant 6 mois",
    "payment.freeStatusSubtitle": "Profitez de l'accès complet sans abonnement pendant cette période.",

    // Artisan Signup
    "artisanSignup.title": "Inscription Artisan",
    "artisanSignup.subtitle": "Créez votre profil professionnel",
    "artisanSignup.personal": "Informations personnelles",
    "artisanSignup.business": "Informations professionnelles",
    "artisanSignup.creating": "Création en cours...",
    "artisanSignup.submit": "S'inscrire",

    // Dashboard
    "dashboard.logout": "Déconnexion",
    "dashboard.artisans.title": "Artisans disponibles",
    "dashboard.noArtisans": "Aucun artisan disponible",
    "dashboard.contactArtisan": "Contacter",
    "dashboard.responseRate": "taux de réponse",

    // Client Dashboard
    "clientDashboard.artisans": "Artisans",
    "clientDashboard.myDemands": "Mes demandes",
    "clientDashboard.messages": "Messages",
    "clientDashboard.search": "Recherche",

    // Create Demand
    "createDemand.title": "Créer une demande",
    "createDemand.welcome": "Bienvenue",
    "createDemand.artisanSelected": "Artisan sélectionné",

    // Unsubscribe
    "unsubscribe.title": "Se désabonner",
    "unsubscribe.confirm": "Êtes-vous sûr de vouloir vous désabonner ?",

    // Language
    "language": "fr"
  },

  en: {
    // App
    "app.title": "Helping Hand",
    "app.createAccount": "Create account",
    "app.connect": "Connect",
    "app.back": "Back",

    // Landing
    "landing.subtitle": "Find a qualified craftsman near you",

    // Home
    "home.freePromoBanner": "Free sign-ups for artisans and clients for 6 months.",
    "home.freePromoBannerSub": "Enjoy all features free for a limited time.",
    "home.qualifiedArtisans": "Qualified Artisans",
    "home.qualifiedArtisansDesc": "Verified and experienced professionals at your service",
    "home.satisfiedClients": "Satisfied Clients",
    "home.satisfiedClientsDesc": "Thousands of clients trust us",
    "welcome.line1": "Welcome to Helping Hand, your platform for connecting with qualified craftsmen.",
    "welcome.line2": "Quickly find the ideal professional for all your renovation, repair, or maintenance work.",
    "welcome.line3": "Our craftsmen are verified, rated, and ready to meet your needs.",

    // About
    "about.title": "About Us",
    "about.subtitle": "Discover our mission and values",
    "about.mission": "Our Mission",
    "about.mission1": "Facilitate connections between clients and trusted craftsmen.",
    "about.mission2": "Ensure quality and reliability of all registered professionals.",
    "about.commitment": "Our commitment to quality and customer satisfaction.",
    "about.projects": "Projects Completed",
    "about.averageRating": "Average Rating",
    "about.values": "Our Values",
    "about.trust": "Trust",
    "about.trustDesc": "Rigorous verification of all craftsmen",
    "about.efficiency": "Efficiency",
    "about.efficiencyDesc": "Quick and simple connection",
    "about.proximity": "Proximity",
    "about.proximityDesc": "Craftsmen available near you",
    "about.howItWorks": "How It Works",
    "about.signup": "Sign Up",
    "about.signupDesc": "Create your account in minutes",
    "about.publish": "Publish",
    "about.publishDesc": "Describe your need or services",
    "about.select": "Select",
    "about.selectDesc": "Choose the ideal professional",
    "about.realization": "Realization",
    "about.realizationDesc": "Bring your project to life together",
    "about.ctaTitle": "Ready to start?",
    "about.ctaSubtitle": "Join thousands of satisfied customers",
    "about.signUp": "Sign Up",
    "about.contactUs": "Contact Us",
    "about.backHome": "← Back to Home",

    // Login
    "login.title": "Login",
    "login.subtitle": "Don't have an account?",
    "login.signup": "Sign up",
    "login.email": "Email",
    "login.exampleEmail": "example@email.com",
    "login.password": "Password",
    "login.button": "Connect",
    "login.noAccount": "Don't have an account?",

    // Signup
    "signup.title": "Sign Up",
    "signup.subtitle": "I am a",
    "signup.client": "Client",
    "signup.client.desc": "I'm looking for a craftsman for my work",
    "signup.artisan": "Craftsman",
    "signup.artisan.desc": "I offer my services to clients",
    "signup.confirmPassword": "Confirm password",
    "signup.forgotPassword": "Forgot password?",
    "signup.continue": "Continue",
    "signup.artisanRedirect": "Redirecting to craftsman form...",
    "signup.selectRole": "Please select your account type",
    "signup.passwordMismatch": "Passwords do not match",
    "signup.acceptTerms": "You must accept the terms and conditions",
    "signup.selectWorkDay": "Please select at least one work day",
    "signup.signupError": "Error during registration",
    "signup.alreadyHaveAccount": "Already have an account?",
    "signup.goToLogin": "Log in",

    // Form
    "form.firstName": "First name",
    "form.city": "City",
    "form.department": "Department",

    // Common
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.redirecting": "Redirecting...",

    // Payment
    "payment.title": "Choose your subscription",
    "payment.subtitle": "Unlock all features to find more clients",
    "payment.cardInfo": "Card information",
    "payment.planSelected": "Selected plan",
    "payment.monthly": "Monthly",
    "payment.yearly": "Yearly",
    "payment.billing": "Billing address",
    "payment.streetPlaceholder": "Street",
    "payment.city": "City",
    "payment.cityPlaceholder": "City",
    "payment.postal": "Postal code",
    "payment.postalPlaceholder": "Postal code",
    "payment.country": "Country",
    "payment.subscription": "Subscription",
    "payment.total": "Total",
    "payment.processing": "Processing...",
    "payment.pay": "Pay",
    "payment.terms": "By paying, you accept our terms and conditions",
    "payment.secure": "Secure payment by Stripe",
    "payment.chooseSubscription": "Choose your subscription",
    "payment.monthlySubscription": "Monthly subscription",
    "payment.billedMonthly": "Billed monthly",
    "payment.yearlySubscription": "Yearly subscription",
    "payment.save": "Save",
    "payment.perYear": "per year",
    "payment.included": "Included in subscription",
    "payment.unlimited": "Unlimited access to requests",
    "payment.verified": "Verified craftsman badge",
    "payment.stats": "Detailed statistics",
    "payment.support": "Priority support",
    "payment.noCommitment": "No commitment",
    "payment.hourlyRate": "Hourly rate",
    "payment.freePromoTitle": "Free access for 6 months",
    "payment.freePromoSubtitle": "All features are available for free for a limited time.",
    "payment.freePromoNote": "No payment is required for the next six months.",
    "payment.freePromoContinue": "Continue to dashboard",
    "payment.freePromoBack": "Back to sign-up",
    "payment.freeStatusTitle": "Free service for 6 months",
    "payment.freeStatusSubtitle": "Enjoy full access without subscription during this period.",

    // Artisan Signup
    "artisanSignup.title": "Craftsman Sign Up",
    "artisanSignup.subtitle": "Create your professional profile",
    "artisanSignup.personal": "Personal Information",
    "artisanSignup.business": "Business Information",
    "artisanSignup.creating": "Creating...",
    "artisanSignup.submit": "Sign Up",

    // Dashboard
    "dashboard.logout": "Logout",
    "dashboard.artisans.title": "Available Craftsmen",
    "dashboard.noArtisans": "No craftsmen available",
    "dashboard.contactArtisan": "Contact",
    "dashboard.responseRate": "response rate",

    // Client Dashboard
    "clientDashboard.artisans": "Craftsmen",
    "clientDashboard.myDemands": "My Requests",
    "clientDashboard.messages": "Messages",
    "clientDashboard.search": "Search",

    // Create Demand
    "createDemand.title": "Create a request",
    "createDemand.welcome": "Welcome",
    "createDemand.artisanSelected": "Selected craftsman",

    // Unsubscribe
    "unsubscribe.title": "Unsubscribe",
    "unsubscribe.confirm": "Are you sure you want to unsubscribe?",

    // Language
    "language": "en"
  }
}

// ----------------------
// PROVIDER
// ----------------------
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language') as Language
      if (saved === 'fr' || saved === 'en') {
        setLanguage(saved)
      }
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem('language', lang)
    }
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

// ----------------------
// HOOK
// ----------------------
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
