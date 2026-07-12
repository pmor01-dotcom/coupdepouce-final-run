// Mock artisan database service

export interface Artisan {
  id: number
  name: string
  email: string
  phone: string
  type: 'artisan' | 'handyman'
  specialty: string[]
  department: string
  city: string
  experience: number
  rating: number
  availability: string
  responseRate: number
  description: {
    fr: string
    en: string
  }
  services: {
    fr: string[]
    en: string[]
  }
  certifications: string[]
  hourlyRate: number
  responseTime: string
  lastActive: string
}

// Mock database of artisans and handymen
const mockArtisans: Artisan[] = [
  {
    id: 1,
    name: "Jean-Pierre Martin",
    email: "jeanpierre.martin@email.com",
    phone: "06 12 34 56 78",
    type: "artisan",
    specialty: ["Plomberie", "Chauffage", "Soudure"],
    department: "31 - Haute-Garonne",
    city: "Toulouse",
    experience: 15,
    rating: 4.8,
    availability: "Immédiate",
    responseRate: 95,
    description: {
      fr: "Artisan plombier expérimenté, spécialisé dans les installations neuves et les dépannages. Certifié RGE.",
      en: "Experienced plumber, specializing in new installations and emergency repairs. RGE certified."
    },
    services: {
      fr: ["Installation plomberie", "Dépannage urgent", "Chauffage", "Soudure cuivre"],
      en: ["Plumbing installation", "Emergency repair", "Heating", "Copper welding"]
    },
    certifications: ["CAP Plomberie", "RGE Qualification", "Certificat de Soudure"],
    hourlyRate: 45,
    responseTime: "Moins d'une heure",
    lastActive: "Il y a 2 heures"
  },
  {
    id: 2,
    name: "Marie Dubois",
    email: "marie.dubois@email.com",
    phone: "06 23 45 67 89",
    type: "artisan",
    specialty: ["Électricité", "Domotique", "Sécurité"],
    department: "31 - Haute-Garonne",
    city: "Toulouse",
    experience: 12,
    rating: 4.9,
    availability: "2 jours",
    responseRate: 98,
    description: {
      fr: "Électricienne qualifiée, experte en installations domestiques et domotique. Intervention rapide garantie.",
      en: "Qualified electrician, expert in domestic installations and home automation. Fast intervention guaranteed."
    },
    services: {
      fr: ["Installation électrique", "Domotique", "Mise à la terre", "Tableau électrique"],
      en: ["Electrical installation", "Home automation", "Grounding", "Electrical panel"]
    },
    certifications: ["CAP Électricité", "Qualifiélec", "Certification Domotique"],
    hourlyRate: 50,
    responseTime: "Moins de 2 heures",
    lastActive: "Il y a 1 heure"
  },
  {
    id: 3,
    name: "Robert Bernard",
    email: "robert.bernard@email.com",
    phone: "06 45 67 89 01",
    type: "handyman",
    specialty: ["Menuiserie", "Peinture", "Petits travaux"],
    department: "31 - Haute-Garonne",
    city: "Colomiers",
    experience: 8,
    rating: 4.6,
    availability: "Immédiate",
    responseRate: 90,
    description: {
      fr: "Homme à tout faire polyvalent, spécialisé en petits travaux de menuiserie et peinture. Disponible rapidement.",
      en: "Versatile handyman, specialized in small carpentry and painting jobs. Available quickly."
    },
    services: {
      fr: ["Menuiserie", "Peinture", "Petites réparations", "Montage meubles"],
      en: ["Carpentry", "Painting", "Small repairs", "Furniture assembly"]
    },
    certifications: ["CAP Menuiserie", "Certification Sécurité"],
    hourlyRate: 35,
    responseTime: "Moins de 3 heures",
    lastActive: "Il y a 30 minutes"
  },
  {
    id: 4,
    name: "Sophie Petit",
    email: "sophie.petit@email.com",
    phone: "06 56 78 90 12",
    type: "artisan",
    specialty: ["Jardinerie", "Aménagement extérieur", "Elagage"],
    department: "75 - Paris",
    city: "Paris",
    experience: 10,
    rating: 4.7,
    availability: "1 semaine",
    responseRate: 92,
    description: {
      fr: "Jardinière paysagiste, création et entretien d'espaces verts. Équipée pour travaux d'élagage.",
      en: "Landscaper gardener, creation and maintenance of green spaces. Equipped for pruning work."
    },
    services: {
      fr: ["Création jardin", "Entretien espaces verts", "Elagage", "Tonte pelouse"],
      en: ["Garden creation", "Green space maintenance", "Pruning", "Lawn mowing"]
    },
    certifications: ["CAP Jardinerie", "Certification Élagage", "Permis de conduire poids lourd"],
    hourlyRate: 40,
    responseTime: "Moins de 4 heures",
    lastActive: "Il y a 3 heures"
  },
  {
    id: 5,
    name: "Thomas Leroy",
    email: "thomas.leroy@email.com",
    phone: "06 67 89 01 23",
    type: "handyman",
    specialty: ["Maçonnerie", "Carrelage", "Bricolage"],
    department: "75 - Paris",
    city: "Paris",
    experience: 6,
    rating: 4.5,
    availability: "3 jours",
    responseRate: 88,
    description: {
      fr: "Maçon débutant mais sérieux, spécialisé en carrelage et petits travaux de maçonnerie. Tarifs compétitifs.",
      en: "Junior but serious mason, specialized in tiling and small masonry work. Competitive rates."
    },
    services: {
      fr: ["Carrelage", "Petite maçonnerie", "Jointoiement", "Préparation sol"],
      en: ["Tiling", "Small masonry", "Grouting", "Floor preparation"]
    },
    certifications: ["CAP Maçonnerie", "Certification Sécurité"],
    hourlyRate: 38,
    responseTime: "Moins de 6 heures",
    lastActive: "Il y a 5 heures"
  },
  {
    id: 6,
    name: "Claude Moreau",
    email: "claude.moreau@email.com",
    phone: "06 78 90 12 34",
    type: "artisan",
    specialty: ["Couverture", "Zinguerie", "Isolation"],
    department: "69 - Rhône",
    city: "Lyon",
    experience: 20,
    rating: 4.9,
    availability: "1 semaine",
    responseRate: 96,
    description: {
      fr: "Couvreur zinguer expert, intervention sur toitures de toutes dimensions. Spécialiste isolation toiture.",
      en: "Expert roofer-zinc worker, intervention on roofs of all sizes. Roof insulation specialist."
    },
    services: {
      fr: ["Couverture toiture", "Zinguerie", "Isolation toiture", "Gouttières"],
      en: ["Roof covering", "Zinc work", "Roof insulation", "Gutters"]
    },
    certifications: ["CAP Couverture", "Certification Zinguerie", "RGE Isolation"],
    hourlyRate: 55,
    responseTime: "Moins de 2 heures",
    lastActive: "Il y a 1 heure"
  },
  {
    id: 7,
    name: "Isabelle Rousseau",
    email: "isabelle.rousseau@email.com",
    phone: "06 89 01 23 45",
    type: "handyman",
    specialty: ["Nettoyage", "Déménagement", "Organisation"],
    department: "69 - Rhône",
    city: "Lyon",
    experience: 5,
    rating: 4.4,
    availability: "Immédiate",
    responseRate: 94,
    description: {
      fr: "Services multiples : nettoyage, aide au déménagement, organisation. Disponible et flexible.",
      en: "Multiple services: cleaning, moving help, organization. Available and flexible."
    },
    services: {
      fr: ["Nettoyage domicile", "Aide déménagement", "Organisation", "Ménage profond"],
      en: ["Home cleaning", "Moving help", "Organization", "Deep cleaning"]
    },
    certifications: ["Certification Nettoyage", "Permis de conduire"],
    hourlyRate: 25,
    responseTime: "Moins d'une heure",
    lastActive: "Il y a 15 minutes"
  },
  {
    id: 8,
    name: "Pierre Fontaine",
    email: "pierre.fontaine@email.com",
    phone: "06 90 12 34 56",
    type: "artisan",
    specialty: ["Vitrerie", "Miroiterie", "Double vitrage"],
    department: "13 - Bouches-du-Rhône",
    city: "Marseille",
    experience: 18,
    rating: 4.8,
    availability: "2 jours",
    responseRate: 91,
    description: {
      fr: "Vitrier professionnel, installation et réparation de fenêtres, miroirs et double vitrage.",
      en: "Professional glazier, installation and repair of windows, mirrors and double glazing."
    },
    services: {
      fr: ["Installation fenêtres", "Réparation vitrage", "Double vitrage", "Miroiterie"],
      en: ["Window installation", "Glazing repair", "Double glazing", "Mirrors"]
    },
    certifications: ["CAP Vitrerie", "Certification Sécurité verre"],
    hourlyRate: 48,
    responseTime: "Moins de 3 heures",
    lastActive: "Il y a 2 heures"
  }
]

// Service to get artisans by department
export const getArtisansByDepartment = (department: string): Artisan[] => {
  return mockArtisans.filter(artisan => 
    artisan.department === department || 
    artisan.department.includes(department.split(' - ')[0])
  )
}

// Service to get all available artisans (for testing)
export const getAllArtisans = (): Artisan[] => {
  return mockArtisans
}

// Service to get artisan by ID
export const getArtisanById = (id: number): Artisan | undefined => {
  return mockArtisans.find(artisan => artisan.id === id)
}

// Service to search artisans by specialty and department
export const searchArtisans = (department: string, specialty?: string): Artisan[] => {
  let filteredArtisans = getArtisansByDepartment(department)
  
  if (specialty) {
    filteredArtisans = filteredArtisans.filter(artisan =>
      artisan.specialty.some(spec => 
        spec.toLowerCase().includes(specialty.toLowerCase()) ||
        specialty.toLowerCase().includes(spec.toLowerCase())
      )
    )
  }
  
  return filteredArtisans.sort((a, b) => b.rating - a.rating)
}
