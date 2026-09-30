'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthProvider'
import { useLanguage } from '../components/LanguageProvider'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
  clientId?: string // Add client ID to contact
}

export default function ArtisanContacts() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

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
    const loadContacts = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      try {
        // Load proposals for this artisan (these represent contacts)
        const response = await fetch(`/api/proposals?artisanId=${user.id}`)
        if (response.ok) {
          const proposals = await response.json()

          // Transform proposals into contact format
          const contactList = proposals.map((proposal: any) => ({
            id: proposal.id,
            clientId: proposal.demand?.client_id || '',
            clientName: proposal.demand?.client?.name || 'Unknown',
            clientEmail: proposal.demand?.client?.email || '',
            clientPhone: proposal.demand?.client?.phone || '',
            clientAddress: '',
            clientCity: proposal.demand?.location || '',
            clientDepartment: proposal.demand?.department || '',
            demandTitle: proposal.demand?.title || 'Unknown',
            demandCategory: proposal.demand?.category || '',
            contactDate: proposal.created_at,
            status: proposal.status.toLowerCase(),
            lastMessage: proposal.message,
            artisanResponse: '',
            proposedPrice: `${proposal.proposed_price} EUR`
          }))

          setContacts(contactList)
        }
      } catch (err) {
        console.error('Error loading contacts:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadContacts()
  }, [user?.id])

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
        return t('statusInitial')
      case 'ongoing':
        return t('statusOngoing')
      case 'completed':
        return t('statusCompleted')
      default:
        return t('statusUnknown')
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
    if (window.confirm(t('deleteContactConfirm'))) {
      setContacts(prev => prev.filter(contact => contact.id !== contactId))
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <p className="text-white">{t('loadingContacts')}</p>
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
          {t('backToDashboard')}
        </Link>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              {t('welcomeContacts').replace('{name}', getFirstName(user?.name))}
            </h1>
            <p className="text-xl text-gray-200">
              {t('manageContacts')}
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
                {t('noContacts')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('noContactsDesc')}
              </p>
              <Link href="/artisan-dashboard" className="btn-primary">
                {t('viewRequests')}
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
                        title={t('deleteContact')}
                      >
                        {t('deleteContact')}
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
                {t('contactDetails')}
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
                  {t('clientInfo')}
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">{t('name')}:</span>
                      <p className="text-gray-900">{selectedContact.clientName}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">{t('email')}:</span>
                      <p className="text-gray-900">{selectedContact.clientEmail}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">{t('phone')}:</span>
                      <p className="text-gray-900">{selectedContact.clientPhone}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">{t('status')}:</span>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedContact.status)}`}>
                        {getStatusText(selectedContact.status)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">{t('address')}:</span>
                    <p className="text-gray-900">
                      {selectedContact.clientAddress}, {selectedContact.clientCity} ({selectedContact.clientDepartment})
                    </p>
                  </div>
                </div>
              </div>

              {/* Demand Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('demandInfo')}
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">{t('title')}:</span>
                    <p className="text-gray-900">{selectedContact.demandTitle}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">{t('category')}:</span>
                    <p className="text-gray-900">{selectedContact.demandCategory}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">{t('contactDate')}:</span>
                    <p className="text-gray-900">{selectedContact.contactDate}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">{t('proposedPrice')}:</span>
                    <p className="text-gray-900 font-semibold text-green-600">{selectedContact.proposedPrice}</p>
                  </div>
                </div>
              </div>

              {/* Communication */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('communication')}
                </h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-blue-800">{t('client')}</span>
                      <span className="text-xs text-blue-600">{selectedContact.contactDate}</span>
                    </div>
                    <p className="text-gray-700">{selectedContact.lastMessage}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-green-800">{t('yourResponse')}</span>
                      <span className="text-xs text-green-600">{t('responseSent')}</span>
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
                  {t('close')}
                </button>
                <button
                  onClick={() => {
                    if (selectedContact?.clientId) {
                      router.push(`/messages/${selectedContact.clientId}?name=${encodeURIComponent(selectedContact.clientName)}`)
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  {t('contactClient')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
