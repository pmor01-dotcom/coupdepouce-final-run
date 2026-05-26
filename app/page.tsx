'use client'

import Link from 'next/link'
import { useLanguage } from './components/LanguageProvider'
import Footer from './components/Footer'

export default function Home() {
  const { t } = useLanguage()

  return (
    <>
      <main className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}>
        <div className="container mx-auto px-4 py-16">
          {/* Top Image Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Left Image */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <img 
                src="/artisan-photo.jpg" 
                alt="Professional artisans working"
                className="w-full h-32 object-cover rounded-lg mb-4"
                style={{ maxHeight: '128px', objectFit: 'cover' }}
                onError={(e) => {
                  console.error('Image failed to load:', e);
                  e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Artisan+Image';
                }}
                onLoad={() => console.log('Artisan image loaded successfully')}
              />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('home.qualifiedArtisans')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('home.qualifiedArtisansDesc')}
            </p>
          </div>
          
          {/* Right Image */}
          <div className="bg-white rounded-lg shadow-lg p-6 ml-48">
            <img 
              src="/images/satisfied-clients.jpg" 
              alt="Happy clients with completed projects"
              className="w-full h-32 object-cover rounded-lg mb-4"
              style={{ maxHeight: '128px', objectFit: 'cover' }}
              onError={(e) => {
                console.error('Image failed to load:', e);
                e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Client+Image';
              }}
              onLoad={() => console.log('Client image loaded successfully')}
            />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('home.satisfiedClients')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('home.satisfiedClientsDesc')}
            </p>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="text-center mb-8">
          <p className="text-lg text-gray-800 leading-relaxed max-w-4xl mx-auto">
            {t('welcome.line1')}
          </p>
          <p className="text-lg text-gray-800 leading-relaxed max-w-4xl mx-auto mt-4">
            {t('welcome.line2')}
          </p>
          <p className="text-lg text-gray-800 leading-relaxed max-w-4xl mx-auto mt-4">
            {t('welcome.line3')}
          </p>
        </div>

        {/* Main Content */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('app.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {t('landing.subtitle')}
          </p>
          
          <div className="flex justify-center space-x-4 mb-12">
            <Link href="/signup" className="btn-primary">
              {t('app.createAccount')}
            </Link>
            <Link href="/login" className="btn-secondary">
              {t('app.connect')}
            </Link>
          </div>
        </div>
      </div>
    </main>
      <Footer />
    </>
  )
}
  

