'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface SearchResultsProps {
  type: 'artisans' | 'demands'
  query: string
  filters: any
}

interface Artisan {
  id: number
  name: string
  metier: string
  location: string
  department: string
  experience_years: number
  insurance_number?: string
  work_hours?: string
  business_address?: string
  company_name?: string
  phone?: string
  created_at: string
  averageRating: number
  totalReviews: number
  totalProposals: number
  hasInsurance: boolean
  isAvailable: boolean
}

interface Demand {
  id: number
  title: string
  description: string
  category: string
  location: string
  department: string
  budget_range?: string
  urgency: string
  status: string
  created_at: string
  client: {
    id: number
    name: string
    location: string
  }
  totalProposals: number
  pendingProposals: number
  hasValidProposals: boolean
  urgency_level: number
}

export default function SearchResults({ type, query, filters }: SearchResultsProps) {
  const [results, setResults] = useState<Artisan[] | Demand[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    limit: 20
  })

  useEffect(() => {
    fetchResults(1)
  }, [query, filters])

  const fetchResults = async (page: number = 1) => {
    setLoading(true)
    setError('')

    try {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        query,
        ...filters
      })

      const response = await fetch(`/api/search/${type}?${searchParams}`)
      const data = await response.json()

      if (data.success) {
        setResults(data.data[type])
        setPagination(data.data.pagination)
      } else {
        setError(data.error || 'Erreur lors de la recherche')
      }
    } catch (err) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    fetchResults(newPage)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    )
  }

  const renderUrgencyBadge = (urgency: string) => {
    const colors = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-red-100 text-red-800'
    }
    
    const labels = {
      LOW: 'Basse',
      MEDIUM: 'Moyenne',
      HIGH: 'Haute'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[urgency as keyof typeof colors]}`}>
        {labels[urgency as keyof typeof labels]}
      </span>
    )
  }

  const renderStatusBadge = (status: string) => {
    const colors = {
      OPEN: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    }
    
    const labels = {
      OPEN: 'Ouverte',
      IN_PROGRESS: 'En cours',
      COMPLETED: 'Terminée',
      CANCELLED: 'Annulée'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  if (loading && results.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Recherche en cours...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    )
  }

  if (results.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun résultat trouvé</h3>
        <p className="text-gray-600">
          {query || Object.values(filters).some(v => v) 
            ? `Aucun ${type === 'artisans' ? 'artisan' : 'demande'} ne correspond à vos critères de recherche.`
            : `Commencez votre recherche pour trouver des ${type === 'artisans' ? 'artisans' : 'demandes'}.`
          }
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Results Summary */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {pagination.totalCount} {type === 'artisans' ? 'artisans' : 'demandes'} trouvés
        </h2>
        {(query || Object.values(filters).some(v => v)) && (
          <p className="text-sm text-gray-600 mt-1">
            Résultats pour "{query}" avec vos filtres appliqués
          </p>
        )}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {results.map((result: any) => (
          <div key={result.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
            {type === 'artisans' ? (
              // Artisan Card
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{result.name}</h3>
                    <p className="text-sm text-gray-600">{result.metier}</p>
                  </div>
                  {result.averageRating > 0 && renderStars(result.averageRating)}
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    {result.location}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path>
                    </svg>
                    {result.department}
                  </div>
                  {result.experience_years && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      {result.experience_years} ans d'expérience
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {result.hasInsurance && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Assuré
                    </span>
                  )}
                  {result.isAvailable && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Disponible
                    </span>
                  )}
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {result.totalProposals} propositions
                  </span>
                </div>

                <div className="flex space-x-2">
                  <Link href={`/artisan-profile/${result.id}`} className="flex-1 btn-primary text-center">
                    Voir profil
                  </Link>
                  <button
                    onClick={() => {
                      // Handle contact logic
                      console.log('Contact artisan:', result.id)
                    }}
                    className="flex-1 btn-secondary"
                  >
                    Contacter
                  </button>
                </div>
              </div>
            ) : (
              // Demand Card
              <div>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{result.title}</h3>
                  {renderUrgencyBadge(result.urgency)}
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{result.description}</p>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                    </svg>
                    {result.category}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    {result.location}
                  </div>
                  {result.budget_range && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      {result.budget_range}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {renderStatusBadge(result.status)}
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {result.totalProposals} proposition{result.totalProposals > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{result.client.name}</span>
                    <span className="ml-1">• {result.client.location}</span>
                  </div>
                  <Link href={`/demands/${result.id}`} className="btn-primary text-sm">
                    Voir détails
                  </Link>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPreviousPage}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNumber = i + 1
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-3 py-2 border rounded-md text-sm font-medium ${
                    pageNumber === pagination.currentPage
                      ? 'bg-green-600 text-white border-green-600'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  {pageNumber}
                </button>
              )
            })}
          </div>
          
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  )
}