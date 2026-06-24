'use client'

import Link from 'next/link'
import { useLanguage } from './components/LanguageProvider'
import Footer from './components/Footer'
import { useState, useEffect } from 'react'

// ⭐ Define the shape of an offer
type Offer = {
  id: string
  title: string
  location: string
}

export default function Home() {
  // ⭐ Tell TypeScript what the array contains
  const [offers, setOffers] = useState<Offer[]>([])

  useEffect(() => {
    fetch("/api/public-offers")
      .then(res => res.json())
      .then(data => setOffers(data))
  }, [])

  const { t } = useLanguage()

  return (
    <>
      <main className="min-h-screen home-page">
        <div className="container mx-auto px-4 py-16">

          {/* Site Title */}
          <div className="site-title text-center mb-10">
            <h2 className="text-4xl font-bold text-white">Coupdepouce</h2>
          </div>

          {/* Promo Banner */}
          <div className="promo-banner text-center mb-12 px-2">
            <p className="promo-banner-title text-xl font-semibold text-white">
              {t('home.freePromoBanner')}
            </p>
            <p className="promo-banner-subtitle text-white opacity-90">
              {t('home.freePromoBannerSub')}
            </p>
          </div>

          {/* Hero Grid */}
          <section className="hero-grid grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 px-2">
            <article className="hero-card bg-white rounded-lg shadow overflow-hidden mx-auto w-full">
              <img
                src="/artisan-photo.jpg"
                alt="Professional artisans working"
                className="hero-card-image w-full h-56 object-cover"
                loading="lazy"
              />
              <div className="hero-card-content p-6 text-center md:text-left">
                <h3 className="text-xl font-semibold mb-2">
                  {t('home.qualifiedArtisans')}
                </h3>
                <p className="text-gray-700">
                  {t('home.qualifiedArtisansDesc')}
                </p>
              </div>
            </article>

            <article className="hero-card bg-white rounded-lg shadow overflow-hidden mx-auto w-full">
              <img
                src="/images/satisfied-clients.jpg"
                alt="Happy clients with completed projects"
                className="hero-card-image w-full h-56 object-cover"
                loading="lazy"
              />
              <div className="hero-card-content p-6 text-center md:text-left">
                <h3 className="text-xl font-semibold mb-2">
                  {t('home.satisfiedClients')}
                </h3>
                <p className="text-gray-700">
                  {t('home.satisfiedClientsDesc')}
                </p>
              </div>
            </article>
          </section>

          {/* Welcome Text */}
          <section className="welcome-text text-center text-white mb-16 space-y-2 px-4">
            <p>{t('welcome.line1')}</p>
            <p>{t('welcome.line2')}</p>
            <p>{t('welcome.line3')}</p>
          </section>

          {/* Main Hero Section */}
          <section className="hero-main text-center text-white px-4">
            <h1 className="text-4xl font-bold mb-4">{t('app.title')}</h1>
            <p className="text-lg mb-8">{t('landing.subtitle')}</p>

            <div className="hero-actions flex flex-col sm:flex-row justify-center gap-6">

              {/* Create Account */}
              <Link
                href="/signup"
                className="btn-primary px-6 py-3 bg-white text-green-700 font-semibold rounded-lg shadow hover:bg-gray-100"
              >
                {t('app.createAccount')}
              </Link>

              {/* ⭐ Auto-scrolling client offers */}
              <div className="mt-10 overflow-hidden whitespace-nowrap border-t border-b border-gray-300 py-3 bg-white/70 backdrop-blur-sm">
                <div
                  className="inline-block text-gray-800 text-sm animate-scroll"
                  style={{ animation: "scroll 25s linear infinite" }}
                >
                  {offers.map((offer) => (
                    <Link
                      key={offer.id}
                      href={`/demands/${offer.id}`}
                      className="mx-8 hover:underline hover:text-green-700 transition"
                    >
                      🔧 {offer.title} — {offer.location}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Login */}
              <Link
                href="/login"
                className="btn-secondary px-6 py-3 bg-green-900 text-white font-semibold rounded-lg shadow hover:bg-green-800"
              >
                {t('app.connect')}
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  )
}
