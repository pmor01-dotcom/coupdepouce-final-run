'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthProvider'
import Link from 'next/link'

interface Contact {
  id: number
  clientName: string
  clientEmail: string
  clientPhone: string
  clientAddress: string
  clientCity: string
  clientDepartment: string
  demandTitle: string
  demandCategory: string
  contactDate: string
  status: 'initial' | 'ongoing' | 'completed'
  lastMessage: string
  artisanResponse: string
  proposedPrice: string
}

export default function ArtisanContacts() {
  const { user } = useAuth()

  // Helper function to get first name
  const getFirstName = (fullName?: string) => {
    if (!fullName) return ''
    return fullName.split(' ')[0]
  }
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Load contacts from localStorage or create mock data
    const savedContacts = localStorage.getItem('artisanContacts')
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts))
    } else {
      // Create mock contacts for demonstration
      const mockContacts: Contact[] = [
        {
          id: 1,
          clientName: 'Jean Dupont',
          clientEmail: 'jean.dupont@email.com',
          clientPhone: '06 12 34 56 78',
          clientAddress: '15 Rue de la République',
          clientCity: 'Toulouse',
          clientDepartment: '31 - Haute-Garonne',
          demandTitle: 'Installation plomberie cuisine',
          demandCategory: 'Plomberie',
          contactDate: '2024-04-20',
          status: 'ongoing',
          lastMessage: 'Bonjour, je suis disponible pour venir faire un devis la semaine prochaine.',
          artisanResponse: 'Merci pour votre réponse. Pouvons-nous fixer un rendez-vous pour jeudi ?',
          proposedPrice: '450 EUR'
        },
        {
          id: 2,
          clientName: 'Marie Martin',
          clientEmail: 'marie.martin@email.com',
          clientPhone: '06 23 45 67 89',
          clientAddress: '8 Avenue Victor Hugo',
          clientCity: 'Paris',
          clientDepartment: '75 - Paris',
          demandTitle: 'Réparation toiture',
          demandCategory: 'Couverture',
          contactDate: '2024-04-18',
          status: 'initial',
          lastMessage: 'Bonjour, je suis intéressé par votre proposition pour la réparation de toiture.',
          artisanResponse: 'Bonjour, je vous enverrai un devis détaillé d\'ici 48 heures.',
          proposedPrice: '1200 EUR'
        },
        {
          id: 3,
          clientName: 'Pierre Bernard',
          clientEmail: 'pierre.bernard@email.com',
          clientPhone: '06 34 56 78 90',
          clientAddress: '23 Boulevard du Maréchal Foch',
          clientCity: 'Lyon',
          clientDepartment: '69 - Rhône',
          demandTitle: 'Peinture salon et chambres',
          demandCategory: 'Peinture',
          contactDate: '2024-04-15',
          status: 'completed',
          lastMessage: 'Très satisfait du travail effectué. Merci beaucoup !',
          artisanResponse: 'Merci pour votre confiance. N\'hésitez pas à me recommander.',
          proposedPrice: '800 EUR'
        }
      ]
      setContacts(mockContacts)
      localStorage.setItem('artisanContacts', JSON.stringify(mockContacts))
    }
    setIsLoading(false)
  }, [])

  const getStatusColor = (status: Contact['status']) => {
    switch (status) {
      case 'initial':
        return 'bg-yellow-100 text-yellow-800'
      case 'ongoing':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: Contact['status']) => {
    switch (status) {
      case 'initial':
        return ''
      case 'ongoing':
        return ''
      case 'completed':
        return 'Terminé'
      default:
        return 'Inconnu'
    }
  }

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact)
    setShowDetails(true)
  }

  const handleCloseDetails = () => {
    setShowDetails(false)
    setSelectedContact(null)
  }

  const handleDeleteContact = (contactId: number, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent opening details modal
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
      setContacts(prev => prev.filter(contact => contact.id !== contactId))
      // Update localStorage
      const updatedContacts = contacts.filter(contact => contact.id !== contactId)
      localStorage.setItem('artisanContacts', JSON.stringify(updatedContacts))
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <p className="text-white">Chargement des contacts...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}>
      {/* Floating Top Right Buttons */}
      <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 50, display: 'flex', gap: '8px' }}>
        <Link href="/artisan-dashboard" className="btn-secondary text-sm">
          Retour au tableau de bord
        </Link>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Bienvenue, {getFirstName(user?.name)} - Mes contacts
            </h1>
            <p className="text-xl text-gray-200">
              Gérez vos communications avec les clients
            </p>
          </div>

          {contacts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-gray-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucun contact
              </h3>
              <p className="text-gray-600 mb-6">
                Vous n'avez pas encore de contacts avec des clients.
              </p>
              <Link href="/artisan-dashboard" className="btn-primary">
                Consulter les demandes disponibles
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
                  onClick={() => handleContactClick(contact)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {contact.clientName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {contact.demandTitle}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(contact.status)}`}>
                        {getStatusText(contact.status)}
                      </span>
                      <button
                        onClick={(e) => handleDeleteContact(contact.id, e)}
                        className="btn-secondary text-xs"
                        title="Supprimer ce contact"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg className="w-1 h-1 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                      {contact.clientEmail}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-1 h-1 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                      {contact.clientPhone}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-1 h-1 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      {contact.clientCity}, {contact.clientDepartment}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {contact.contactDate}
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        {contact.proposedPrice}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact Details Modal */}
      {showDetails && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Détails du contact
              </h2>
              <button
                onClick={handleCloseDetails}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Client Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Informations client
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Nom:</span>
                      <p className="text-gray-900">{selectedContact.clientName}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Email:</span>
                      <p className="text-gray-900">{selectedContact.clientEmail}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Téléphone:</span>
                      <p className="text-gray-900">{selectedContact.clientPhone}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Statut:</span>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedContact.status)}`}>
                        {getStatusText(selectedContact.status)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Adresse:</span>
                    <p className="text-gray-900">
                      {selectedContact.clientAddress}, {selectedContact.clientCity} ({selectedContact.clientDepartment})
                    </p>
                  </div>
                </div>
              </div>

              {/* Demand Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Informations sur la demande
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Titre:</span>
                    <p className="text-gray-900">{selectedContact.demandTitle}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Catégorie:</span>
                    <p className="text-gray-900">{selectedContact.demandCategory}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Date du contact:</span>
                    <p className="text-gray-900">{selectedContact.contactDate}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Prix proposé:</span>
                    <p className="text-gray-900 font-semibold text-green-600">{selectedContact.proposedPrice}</p>
                  </div>
                </div>
              </div>

              {/* Communication */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Communication
                </h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-blue-800">Client</span>
                      <span className="text-xs text-blue-600">{selectedContact.contactDate}</span>
                    </div>
                    <p className="text-gray-700">{selectedContact.lastMessage}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-green-800">Votre réponse</span>
                      <span className="text-xs text-green-600">Réponse envoyée</span>
                    </div>
                    <p className="text-gray-700">{selectedContact.artisanResponse}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleCloseDetails}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Fermer
                </button>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Contacter le client
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}