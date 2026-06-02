'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from './components/LanguageProvider'
import Footer from './components/Footer'

function HeroImage({
  src,
  alt,
}: {
  src: string
  alt: string
}) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  return (
    <div className="hero-card-image-wrapper">
      <img
        src={src}
        alt={alt}
        className={`hero-card-image ${status}`}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
      {status !== 'loaded' && (
        <div className="hero-card-image-placeholder">
          <span>{status === 'error' ? 'Image indisponible' : 'Chargement...'}</span>
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const { t } = useLanguage()

  return (
    <>
      <main className="min-h-screen home-page">
        <div className="container mx-auto px-4 py-16">
          <div className="promo-banner">
            <p className="promo-banner-title">
              {t('home.freePromoBanner')}
            </p>
            <p className="promo-banner-subtitle">
              {t('home.freePromoBannerSub')}
            </p>
          </div>

          <section className="hero-grid">
            <article className="hero-card">
              <HeroImage
                src="/artisan-photo.jpg"
                alt="Professional artisans working"
              />
              <div className="hero-card-content">
                <h3>{t('home.qualifiedArtisans')}</h3>
                <p>{t('home.qualifiedArtisansDesc')}</p>
              </div>
            </article>

            <article className="hero-card">
              <HeroImage
                src="/images/satisfied-clients.jpg"
                alt="Happy clients with completed projects"
              />
              <div className="hero-card-content">
                <h3>{t('home.satisfiedClients')}</h3>
                <p>{t('home.satisfiedClientsDesc')}</p>
              </div>
            </article>
          </section>

          <section className="welcome-text">
            <p>{t('welcome.line1')}</p>
            <p>{t('welcome.line2')}</p>
            <p>{t('welcome.line3')}</p>
          </section>

          <section className="hero-main">
            <h1>{t('app.title')}</h1>
            <p>{t('landing.subtitle')}</p>
            <div className="hero-actions">
              <Link href="/signup" className="btn-primary">
                {t('app.createAccount')}
              </Link>
              <Link href="/login" className="btn-secondary">
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
