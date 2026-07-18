'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from './LanguageProvider'
import Link from 'next/link'

interface Demand {
  id: string
  title: string
  description: string
  category: string
  location: string
}

export default function ProposalsSlideshow() {
  const { t } = useLanguage()
  const [demands, setDemands] = useState<Demand[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDemands = async () => {
      try {
        const response = await fetch('/api/public-demands')
        if (response.ok) {
          const data = await response.json()
          setDemands(data.slice(0, 5))
        }
      } catch (error) {
        console.error('Error fetching demands:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDemands()
  }, [])

  if (loading || demands.length === 0) {
    return null
  }

  return (
    <div className="mt-10 overflow-hidden whitespace-nowrap border-t border-b border-gray-300 py-3 bg-white/70 backdrop-blur-sm">
      <div className="flex animate-scroll" style={{ animation: 'scroll 30s linear infinite' }}>
        {demands.map((demand) => (
          <div key={demand.id} className="flex-shrink-0 px-6">
            <Link href={`/demands/${demand.id}`} className="text-gray-800 text-sm hover:text-green-700 transition-colors">
              <span className="font-medium">{demand.title}</span>
              <span className="mx-2">•</span>
              <span className="text-gray-600">{demand.category}</span>
              <span className="mx-2">•</span>
              <span className="text-gray-600">{demand.location}</span>
            </Link>
          </div>
        ))}

        {/* Duplicate for seamless scrolling */}
        {demands.map((demand) => (
          <div key={`duplicate-${demand.id}`} className="flex-shrink-0 px-6">
            <Link href={`/demands/${demand.id}`} className="text-gray-800 text-sm hover:text-green-700 transition-colors">
              <span className="font-medium">{demand.title}</span>
              <span className="mx-2">•</span>
              <span className="text-gray-600">{demand.category}</span>
              <span className="mx-2">•</span>
              <span className="text-gray-600">{demand.location}</span>
            </Link>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  )
}
