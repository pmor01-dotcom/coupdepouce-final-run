'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'fr' | 'en'

interface Translations {
  [key: string]: {
    fr: string
    en: string
  }
}

const translations: Translations = {
  // Navigation
  'app.title': { fr: 'Coup de Pouce', en: 'A helping hand' },
  'app.connect': { fr: 'Connectez-vous', en: 'Sign in' },
  'app.createAccount': { fr: 'Créer un compte', en: 'Create account' },
  'app.back': { fr: 'Retour', en: 'Back' },
  'app.next': { fr: 'Suivant', en: 'Next' },
  'app.submit': { fr: 'Soumettre', en: 'Submit' },
  'app.cancel': { fr: 'Annuler', en: 'Cancel' },
  'app.save': { fr: 'Enregistrer', en: 'Save' },
  
  // Landing page
  'landing.subtitle': { fr: 'Connectez-vous', en: 'Get connected' },
  'landing.clients.title': { fr: 'Pour les Clients', en: 'For Clients' },
  'landing.clients.desc': { fr: 'Trouvez des artisans et contactez-les directement pour vos projets', en: 'Find artisans and contact them directly for your projects' },
  'landing.clients.space': { fr: 'Espace Client', en: 'Client Space' },
  'landing.artisans.title': { fr: 'Pour les Artisans', en: 'For Artisans' },
  'landing.artisans.desc': { fr: 'Consultez les demandes et proposez vos services aux clients', en: 'View requests and offer your services to clients' },
  'landing.artisans.space': { fr: 'Espace Artisan', en: 'Artisan Space' },
  
  // Login page
  'login.title': { fr: 'Se connecter', en: 'Sign in' },
  'login.subtitle': { fr: 'Ou créer un nouveau compte', en: 'Or create a new account' },
  'login.email': { fr: 'Email', en: 'Email' },
  'login.password': { fr: 'Mot de passe', en: 'Password' },
  'login.remember': { fr: 'Se souvenir de moi', en: 'Remember me' },
  'login.forgot': { fr: 'Mot de passe oublié?', en: 'Forgot password?' },
  'login.button': { fr: 'Se connecter', en: 'Sign in' },
  'login.noAccount': { fr: 'Pas de compte?', en: 'No account?' },
  'login.signup': { fr: 'créer un nouveau compte', en: 'create a new account' },
  
  // Signup page
  'signup.title': { fr: 'Créer un compte', en: 'Create account' },
  'signup.subtitle': { fr: 'Choisissez votre type de compte', en: 'Choose your account type' },
  'signup.client': { fr: 'Client', en: 'Client' },
  'signup.artisan': { fr: 'Artisan', en: 'Artisan' },
  'signup.client.desc': { fr: 'Je cherche des artisans pour mes projets', en: 'I am looking for artisans for my projects' },
  'signup.artisan.desc': { fr: 'Je suis un artisan et je propose mes services', en: 'I am an artisan and I offer my services' },
  'signup.continue': { fr: 'S\'inscrire comme client', en: 'Sign up as client' },
  'signup.confirmPassword': { fr: 'Confirmer le mot de passe', en: 'Confirm password' },
  'signup.passwordMismatch': { fr: 'Les mots de passe ne correspondent pas', en: 'Passwords do not match' },
  'signup.acceptTerms': { fr: 'Vous devez accepter les conditions générales', en: 'You must accept the terms and conditions' },
  'signup.selectWorkDay': { fr: 'Veuillez sélectionner au moins un jour de travail', en: 'Please select at least one work day' },
  'signup.signupError': { fr: 'Une erreur est survenue lors de l\'inscription', en: 'An error occurred during registration' },
  'signup.artisanRedirect': { fr: 'Vous serez redirigé vers le formulaire d\'inscription complet pour les artisans.', en: 'You will be redirected to the complete registration form for artisans.' },
  'signup.selectRole': { fr: 'Veuillez sélectionner votre type de compte pour continuer', en: 'Please select your account type to continue' },
  
  // Artisan signup
  'artisanSignup.title': { fr: 'Inscription Artisan', en: 'Artisan Registration' },
  'artisanSignup.subtitle': { fr: 'Créez votre compte artisan et rejoignez notre réseau', en: 'Create your artisan account and join our network' },
  'artisanSignup.personal': { fr: 'Informations personnelles', en: 'Personal Information' },
  'artisanSignup.business': { fr: 'Informations professionnelles', en: 'Business Information' },
  'artisanSignup.work': { fr: 'Informations de travail', en: 'Work Information' },
  'artisanSignup.creating': { fr: 'Inscription en cours...', en: 'Creating...' },
  'artisanSignup.submit': { fr: 'S\'inscrire comme artisan', en: 'Sign up as artisan' },
  
  // Payment
  'payment.title': { fr: 'Finaliser votre inscription', en: 'Complete your registration' },
  'payment.subtitle': { fr: 'Choisissez votre abonnement et complétez le paiement pour accéder à votre espace artisan', en: 'Choose your subscription and complete payment to access your artisan space' },
  'payment.chooseSubscription': { fr: 'Choisissez votre abonnement', en: 'Choose your subscription' },
  'payment.subscription': { fr: 'Abonnement', en: 'Subscription' },
  'payment.monthlySubscription': { fr: 'Abonnement Mensuel', en: 'Monthly Subscription' },
  'payment.yearlySubscription': { fr: 'Abonnement Annuel', en: 'Yearly Subscription' },
  'payment.perYear': { fr: 'par an', en: 'per year' },
  'payment.monthly': { fr: 'Mensuel', en: 'Monthly' },
  'payment.yearly': { fr: 'Annuel', en: 'Yearly' },
  'payment.billedMonthly': { fr: 'Facturé chaque mois', en: 'Billed monthly' },
  'payment.billedYearly': { fr: 'Facturé chaque année', en: 'Billed yearly' },
  'payment.save': { fr: 'Économisez', en: 'Save' },
  'payment.included': { fr: 'Ce qui est inclus:', en: 'What is included:' },
  'payment.unlimited': { fr: 'Accès illimité aux demandes clients', en: 'Unlimited access to client requests' },
  'payment.verified': { fr: 'Profil artisan vérifié', en: 'Verified artisan profile' },
  'payment.stats': { fr: 'Statistiques et rapports', en: 'Statistics and reports' },
  'payment.support': { fr: 'Support prioritaire', en: 'Priority support' },
  'payment.noCommitment': { fr: 'Aucun engagement', en: 'No commitment' },
  'payment.planSelected': { fr: 'Plan sélectionné', en: 'Plan selected' },
  'payment.commitment': { fr: 'Aucun engagement', en: 'No commitment' },
  'payment.cardInfo': { fr: 'Informations de paiement', en: 'Payment Information' },
  'payment.cardNumber': { fr: 'Numéro de carte', en: 'Card Number' },
  'payment.cardName': { fr: 'Nom sur la carte', en: 'Name on Card' },
  'payment.expiry': { fr: 'Date d\'expiration', en: 'Expiry Date' },
  'payment.cvv': { fr: 'CVV', en: 'CVV' },
  'payment.billing': { fr: 'Adresse de facturation', en: 'Billing Address' },
  'payment.street': { fr: 'Adresse', en: 'Street Address' },
  'payment.city': { fr: 'Ville', en: 'City' },
  'payment.postal': { fr: 'Code postal', en: 'Postal Code' },
  'payment.streetPlaceholder': { fr: '123 Rue de la République', en: '123 Main Street' },
  'payment.cityPlaceholder': { fr: 'Paris', en: 'Paris' },
  'payment.postalPlaceholder': { fr: '75001', en: '75001' },
  'payment.country': { fr: 'Pays', en: 'Country' },
  'payment.terms': { fr: 'En cliquant sur "Payer", vous acceptez nos conditions générales.', en: 'By clicking "Pay", you accept our terms and conditions.' },
  'payment.secure': { fr: 'Paiement sécurisé via Stripe.', en: 'Secure payment via Stripe.' },
  'payment.pay': { fr: 'Payer', en: 'Pay' },
  'payment.processing': { fr: 'Traitement en cours...', en: 'Processing...' },
  'payment.success': { fr: 'Paiement réussi!', en: 'Payment successful!' },
  'payment.redirecting': { fr: 'Vous allez être redirigé vers votre tableau de bord...', en: 'You will be redirected to your dashboard...' },
  'payment.activated': { fr: 'Votre abonnement a été activé avec succès.', en: 'Your subscription has been successfully activated.' },
  'payment.hourlyRate': { fr: 'Tarif horaire', en: 'Hourly rate' },
  'payment.total': { fr: 'Total', en: 'Total' },
  
  // Dashboard
  'dashboard.client': { fr: 'Espace Client', en: 'Client Space' },
  'dashboard.artisan': { fr: 'Espace Artisan', en: 'Artisan Space' },
  'dashboard.myInfo': { fr: 'Mes informations', en: 'My Information' },
  'dashboard.logout': { fr: 'Déconnexion', en: 'Logout' },
  'dashboard.demands': { fr: 'Demandes des clients', en: 'Client Requests' },
  'dashboard.demands.subtitle': { fr: 'Consultez les demandes des clients et proposez vos services. Les clients pourront ensuite vous contacter directement.', en: 'View client requests and offer your services. Clients can then contact you directly.' },
  'dashboard.proposals': { fr: 'Mes propositions', en: 'My Proposals' },
  'dashboard.proposals.subtitle': { fr: 'Suivez l\'état de vos propositions envoyées aux clients.', en: 'Track the status of your proposals sent to clients.' },
  
  // About page
  'about.title': { fr: 'À Propos de Coup de Pouce', en: 'About Coup de Pouce' },
  'about.subtitle': { fr: 'La plateforme de confiance qui met en relation les clients avec des artisans qualifiés pour tout faire', en: 'The trusted platform that connects clients with qualified artisans to get everything done' },
  'about.mission': { fr: 'Notre Mission', en: 'Our Mission' },
  'about.mission1': { fr: 'Coup de Pouce a pour mission de simplifier la vie des Français en facilitant l\'accès à des artisans de confiance pour tous types de travaux et services.', en: 'Coup de Pouce\'s mission is to simplify the lives of French people by facilitating access to trusted artisans for all types of work and services.' },
  'about.mission2': { fr: 'Nous connectons les clients avec des professionnels vérifiés, transparents et compétents pour garantir des collaborations réussies et des projets réalisés dans les meilleures conditions.', en: 'We connect clients with verified, transparent and competent professionals to ensure successful collaborations and projects completed under the best conditions.' },
  'about.commitment': { fr: 'Notre engagement : rendre l\'artisanat accessible à tous, partout en France.', en: 'Our commitment: make craftsmanship accessible to everyone, everywhere in France.' },
  'about.projects': { fr: 'Projets réalisés', en: 'Projects completed' },
  'about.averageRating': { fr: 'Note moyenne', en: 'Average rating' },
  'about.values': { fr: 'Nos Valeurs', en: 'Our Values' },
  'about.trust': { fr: 'Confiance', en: 'Trust' },
  'about.trustDesc': { fr: 'Vérification systématique des artisans, transparence totale sur les compétences et les tarifs.', en: 'Systematic verification of artisans, total transparency on skills and pricing.' },
  'about.efficiency': { fr: 'Efficacité', en: 'Efficiency' },
  'about.efficiencyDesc': { fr: 'Mise en relation rapide, communication directe et suivi des projets en temps réel.', en: 'Fast connection, direct communication and real-time project tracking.' },
  'about.proximity': { fr: 'Proximité', en: 'Proximity' },
  'about.proximityDesc': { fr: 'Accès facilité aux artisans locaux pour un service de proximité et de qualité.', en: 'Easy access to local artisans for quality proximity service.' },
  'about.howItWorks': { fr: 'Comment Ça Marche', en: 'How It Works' },
  'about.signup': { fr: 'Inscription', en: 'Sign Up' },
  'about.signupDesc': { fr: 'Créez votre compte gratuitement en quelques minutes', en: 'Create your free account in a few minutes' },
  'about.publish': { fr: 'Publication', en: 'Publish' },
  'about.publishDesc': { fr: 'Décrivez votre projet et recevez des propositions', en: 'Describe your project and receive proposals' },
  'about.select': { fr: 'Sélection', en: 'Select' },
  'about.selectDesc': { fr: 'Choisissez l\'artisan qui correspond à vos besoins', en: 'Choose the artisan that meets your needs' },
  'about.realization': { fr: 'Réalisation', en: 'Realization' },
  'about.realizationDesc': { fr: 'Collaborez directement et réalisez votre projet', en: 'Collaborate directly and complete your project' },
  'about.ctaTitle': { fr: 'Rejoignez la communauté Coup de Pouce', en: 'Join the Coup de Pouce community' },
  'about.ctaSubtitle': { fr: 'Que vous soyez client ou artisan, découvrez comment nous pouvons vous aider', en: 'Whether you are a client or an artisan, discover how we can help you' },
  'about.signUp': { fr: 'S\'inscrire', en: 'Sign Up' },
  'about.contactUs': { fr: 'Nous contacter', en: 'Contact Us' },
  'about.backHome': { fr: 'Retour à l\'accueil', en: 'Back to home' },
  'dashboard.noDemands': { fr: 'Aucune demande trouvée', en: 'No requests found' },
  'dashboard.noProposals': { fr: 'Aucune proposition trouvée', en: 'No proposals found' },
  'dashboard.respond': { fr: 'Proposer', en: 'Propose' },
  'dashboard.responded': { fr: 'Déjà répondu', en: 'Already responded' },
  'dashboard.closed': { fr: 'Demande fermée', en: 'Request closed' },
  'dashboard.customer': { fr: 'Client', en: 'Customer' },
  'dashboard.published': { fr: 'Publiée le', en: 'Published on' },
  'dashboard.artisans.title': { fr: 'Artisans disponibles', en: 'Available Artisans' },
  'dashboard.artisans': { fr: 'Artisans', en: 'Artisans' },
  'dashboard.myDemands': { fr: 'Mes demandes', en: 'My Requests' },
  'clientDashboard.artisans': { fr: 'Artisans', en: 'Artisans' },
  'clientDashboard.myDemands': { fr: 'Mes demandes', en: 'My Requests' },
  'clientDashboard.messages': { fr: 'Messages', en: 'Messages' },
  'clientDashboard.search': { fr: 'Recherche', en: 'Search' },
  'dashboard.noArtisans': { fr: 'Aucun artisan disponible pour le moment', en: 'No artisans available at the moment' },
  'dashboard.contactArtisan': { fr: 'Contacter', en: 'Contact' },
  'dashboard.responseRate': { fr: 'Taux de réponse', en: 'Response rate' },
  
  // Subscription status
  'subscription.required': { fr: 'Abonnement requis', en: 'Subscription Required' },
  'subscription.activate': { fr: 'Activez votre abonnement pour accéder à toutes les fonctionnalités.', en: 'Activate your subscription to access all features.' },
  'subscription.subscribe': { fr: 'S\'abonner', en: 'Subscribe' },
  'subscription.monthly': { fr: 'Abonnement Mensuel', en: 'Monthly Subscription' },
  'subscription.yearly': { fr: 'Abonnement Annuel', en: 'Yearly Subscription' },
  'subscription.active': { fr: 'Actif', en: 'Active' },
  'subscription.expired': { fr: 'Expiré', en: 'Expired' },
  'subscription.daysLeft': { fr: 'jour restant', en: 'day remaining' },
  'subscription.daysLeftPlural': { fr: 'jours restants', en: 'days remaining' },
  'subscription.expiredMsg': { fr: 'Votre abonnement a expiré', en: 'Your subscription has expired' },
  'subscription.renew': { fr: 'Renouveler', en: 'Renew' },
  'subscription.manage': { fr: 'Gérer', en: 'Manage' },
  'subscription.start': { fr: 'Début', en: 'Start' },
  'subscription.end': { fr: 'Fin', en: 'End' },
  'subscription.autoRenew': { fr: 'Renouvellement automatique activé', en: 'Automatic renewal enabled' },
  
  // Form fields
  'form.firstName': { fr: 'Prénom', en: 'First Name' },
  'form.lastName': { fr: 'Nom', en: 'Last Name' },
  'form.phone': { fr: 'Téléphone', en: 'Phone' },
  'form.address': { fr: 'Adresse', en: 'Address' },
  'form.company': { fr: 'Nom de l\'entreprise', en: 'Company Name' },
  'form.siret': { fr: 'Numéro SIRET', en: 'SIRET Number' },
  'form.insurance': { fr: 'Numéro d\'assurance', en: 'Insurance Number' },
  'form.specialty': { fr: 'Spécialité', en: 'Specialty' },
  'form.experience': { fr: 'Années d\'expérience', en: 'Years of Experience' },
  'form.hours': { fr: 'Heures de travail', en: 'Work Hours' },
  'form.workDays': { fr: 'Jours de travail', en: 'Work Days' },
  'form.monday': { fr: 'Lundi', en: 'Monday' },
  'form.tuesday': { fr: 'Mardi', en: 'Tuesday' },
  'form.wednesday': { fr: 'Mercredi', en: 'Wednesday' },
  'form.thursday': { fr: 'Jeudi', en: 'Thursday' },
  'form.friday': { fr: 'Vendredi', en: 'Friday' },
  'form.saturday': { fr: 'Samedi', en: 'Saturday' },
  'form.sunday': { fr: 'Dimanche', en: 'Sunday' },
  
  // Common
  'common.loading': { fr: 'Chargement...', en: 'Loading...' },
  'common.error': { fr: 'Une erreur est survenue', en: 'An error occurred' },
  'common.required': { fr: 'Ce champ est requis', en: 'This field is required' },
  'common.invalid': { fr: 'Informations invalides', en: 'Invalid information' },
  'common.success': { fr: 'Succès', en: 'Success' },
  'common.cancel': { fr: 'Annuler', en: 'Cancel' },
  'common.confirm': { fr: 'Confirmer', en: 'Confirm' },
  'common.redirecting': { fr: 'Redirection en cours...', en: 'Redirecting...' },
  
  // Home page welcome text
  'welcome.line1': { fr: 'Bienvenue sur notre plateforme dédiée à la mise en relation entre particuliers, Artisans et hommes à tout faire.', en: 'Welcome to our platform dedicated to connecting individuals with Artisans and Handy persons.' },
  'welcome.line2': { fr: 'Que vous ayez besoin d\'un coup de main pour des travaux, des réparations ou des projets du quotidien, trouvez facilement des professionnels de confiance près de chez vous. Simple, rapide et transparent, notre service vous aide à concrétiser vos besoins en toute sérénité.', en: 'Whether you need help with repairs, home improvement, or everyday projects, easily find trusted professionals near you. Simple, fast, and transparent, our service helps you bring your ideas to life with confidence.' },
  'welcome.line3': { fr: 'Commencez dès maintenant et donnez vie à vos projets.', en: 'Get started today and make your projects happen.' },

  // Home page image text
  'home.qualifiedArtisans': { fr: 'Des artisans qualifiés', en: 'Qualified Artisans' },
  'home.qualifiedArtisansDesc': { fr: 'Trouvez des professionnels vérifiés pour tous vos projets', en: 'Find verified professionals for all your projects' },
  'home.satisfiedClients': { fr: 'Clients satisfaits', en: 'Satisfied Clients' },
  'home.satisfiedClientsDesc': { fr: 'Rejoignez des milliers de clients qui ont trouvé leur artisan idéal', en: 'Join thousands of clients who found their ideal artisan' },

  // Create demand page
  'createDemand.title': { fr: 'Créer une demande', en: 'Create a Request' },
  'createDemand.back': { fr: 'Retour', en: 'Back' },
  'createDemand.generalInfo': { fr: 'Informations générales', en: 'General Information' },
  'createDemand.titleField': { fr: 'Titre de la demande', en: 'Request Title' },
  'createDemand.description': { fr: 'Description détaillée', en: 'Detailed Description' },
  'createDemand.category': { fr: 'Catégorie', en: 'Category' },
  'createDemand.urgency': { fr: 'Urgence', en: 'Urgency' },
  'createDemand.location': { fr: 'Localisation et budget', en: 'Location and Budget' },
  'createDemand.city': { fr: 'Ville ou localisation', en: 'City or Location' },
  'createDemand.department': { fr: 'Département', en: 'Department' },
  'createDemand.budget': { fr: 'Budget estimé', en: 'Estimated Budget' },
  'createDemand.publish': { fr: 'Publier la demande', en: 'Publish Request' },
  'createDemand.creating': { fr: 'Création en cours...', en: 'Creating...' },
  'createDemand.success': { fr: 'Demande créée avec succès! Redirection...', en: 'Request created successfully! Redirecting...' },
  'createDemand.artisanSelected': { fr: 'Artisan sélectionné:', en: 'Selected Artisan:' },
  'createDemand.findArtisans': { fr: 'Trouver des artisans', en: 'Find Artisans' },
  'createDemand.myDemands': { fr: 'Mes demandes', en: 'My Requests' },
  'createDemand.welcome': { fr: 'Bienvenue', en: 'Welcome' },
  
  // Unsubscribe
  'unsubscribe.title': { fr: 'Se désabonner', en: 'Unsubscribe' },
  'unsubscribe.confirm': { fr: 'Êtes-vous sûr de vouloir vous désabonner ? Cette action est irréversible.', en: 'Are you sure you want to unsubscribe? This action is irreversible.' },
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr')
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'en')) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language to localStorage when it changes
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    if (mounted) {
      localStorage.setItem('language', lang)
    }
  }

  const t = (key: string): string => {
    // Return the key itself during server-side rendering to prevent hydration mismatch
    if (!mounted) {
      return key
    }
    return translations[key]?.[language] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
