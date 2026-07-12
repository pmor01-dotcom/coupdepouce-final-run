'use client'

import { useState, useEffect } from 'react'

interface SearchFiltersProps {
  type: 'artisans' | 'demands'
  onFiltersChange: (filters: any) => void
  onSearch: (query: string) => void
}

export default function SearchFilters({ type, onFiltersChange, onSearch }: SearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState({
    category: '',
    department: '',
    location: '',
    minExperience: '',
    maxExperience: '',
    hasInsurance: '',
    isAvailable: '',
    minRating: '',
    budgetRange: '',
    urgency: '',
    status: '',
    minBudget: '',
    maxBudget: '',
    hasProposals: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  })

  const categories = type === 'artisans' 
    ? [
        'Plomberie', 'Électricité', 'Chauffage', 'Climatisation', 'Menuiserie', 
        'Maçonnerie', 'Peinture', 'Carrelage', 'Couvreur', 'Jardinage',
        'Nettoyage', 'Déménagement', 'Sécurité', 'Informatique', 'Autre'
      ]
    : [
        'Plomberie', 'Électricité', 'Chauffage', 'Climatisation', 'Menuiserie',
        'Maçonnerie', 'Peinture', 'Carrelage', 'Toiture', 'Jardinage',
        'Nettoyage', 'Déménagement', 'Sécurité', 'Informatique', 'Autre'
      ]

  const departments = [
    '31 - Haute-Garonne', '32 - Gers'
  ]

  const budgetRanges = [
    'Moins de 500€', '500€ - 1000€', '1000€ - 2000€', '2000€ - 5000€',
    '5000€ - 10000€', 'Plus de 10000€'
  ]

  const urgencyLevels = ['LOW', 'MEDIUM', 'HIGH']
  const statusOptions = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

  const sortOptions = type === 'artisans'
    ? [
        { value: 'created_at', label: 'Date d\'inscription' },
        { value: 'name', label: 'Nom' },
        { value: 'experience', label: 'Expérience' },
        { value: 'rating', label: 'Note moyenne' }
      ]
    : [
        { value: 'created_at', label: 'Date de publication' },
        { value: 'title', label: 'Titre' },
        { value: 'budget', label: 'Budget' },
        { value: 'urgency', label: 'Urgence' },
        { value: 'proposals', label: 'Nombre de propositions' }
      ]

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    onFiltersChange(filters)
  }, [filters])

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      department: '',
      location: '',
      minExperience: '',
      maxExperience: '',
      hasInsurance: '',
      isAvailable: '',
      minRating: '',
      budgetRange: '',
      urgency: '',
      status: '',
      minBudget: '',
      maxBudget: '',
      hasProposals: '',
      sortBy: 'created_at',
      sortOrder: 'desc'
    })
    setSearchQuery('')
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Rechercher ${type === 'artisans' ? 'des artisans' : 'des demandes'}...`}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <svg
            className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium"
        >
          <svg
            className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span>Filtres avancés</span>
          {hasActiveFilters && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
              Actifs
            </span>
          )}
        </button>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Effacer tout
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="space-y-4 border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Toutes les catégories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Département
              </label>
              <select
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tous les départements</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localisation
              </label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                placeholder="Ville, région..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Artisan-specific filters */}
            {type === 'artisans' && (
              <>
                {/* Experience Range */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Années d'expérience
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={filters.minExperience}
                      onChange={(e) => handleFilterChange('minExperience', e.target.value)}
                      placeholder="Min"
                      min="0"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="number"
                      value={filters.maxExperience}
                      onChange={(e) => handleFilterChange('maxExperience', e.target.value)}
                      placeholder="Max"
                      min="0"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* Insurance Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assurance
                  </label>
                  <select
                    value={filters.hasInsurance}
                    onChange={(e) => handleFilterChange('hasInsurance', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Indifférent</option>
                    <option value="true">Avec assurance</option>
                    <option value="false">Sans assurance</option>
                  </select>
                </div>

                {/* Availability Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Disponibilité
                  </label>
                  <select
                    value={filters.isAvailable}
                    onChange={(e) => handleFilterChange('isAvailable', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Indifférent</option>
                    <option value="true">Disponible</option>
                    <option value="false">Indisponible</option>
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note minimale
                  </label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => handleFilterChange('minRating', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Indifférent</option>
                    <option value="3">3 étoiles et plus</option>
                    <option value="4">4 étoiles et plus</option>
                    <option value="4.5">4.5 étoiles et plus</option>
                  </select>
                </div>
              </>
            )}

            {/* Demand-specific filters */}
            {type === 'demands' && (
              <>
                {/* Budget Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget
                  </label>
                  <select
                    value={filters.budgetRange}
                    onChange={(e) => handleFilterChange('budgetRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Tous les budgets</option>
                    {budgetRanges.map(range => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>

                {/* Budget Range (min/max) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget personnalisé
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={filters.minBudget}
                      onChange={(e) => handleFilterChange('minBudget', e.target.value)}
                      placeholder="Budget min"
                      min="0"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="number"
                      value={filters.maxBudget}
                      onChange={(e) => handleFilterChange('maxBudget', e.target.value)}
                      placeholder="Budget max"
                      min="0"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* Urgency Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgence
                  </label>
                  <select
                    value={filters.urgency}
                    onChange={(e) => handleFilterChange('urgency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Toutes les urgences</option>
                    {urgencyLevels.map(level => (
                      <option key={level} value={level}>
                        {level === 'HIGH' ? 'Haute' : level === 'MEDIUM' ? 'Moyenne' : 'Basse'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Tous les statuts</option>
                    {statusOptions.map(status => (
                      <option key={status} value={status}>
                        {status === 'OPEN' ? 'Ouverte' : status === 'IN_PROGRESS' ? 'En cours' : status === 'COMPLETED' ? 'Terminée' : 'Annulée'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Proposals Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Propositions
                  </label>
                  <select
                    value={filters.hasProposals}
                    onChange={(e) => handleFilterChange('hasProposals', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Indifférent</option>
                    <option value="true">Avec propositions</option>
                    <option value="false">Sans propositions</option>
                  </select>
                </div>
              </>
            )}

            {/* Sort Options */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trier par
              </label>
              <div className="flex space-x-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="desc">Descendant</option>
                  <option value="asc">Ascendant</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}