 'use client'

import { useState, useEffect } from 'react'
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
  const [currentSrc, setCurrentSrc] = useState(src)

  useEffect(() => {
    try {
      const img = new Image()
      img.src = currentSrc
      if (img.complete) setStatus('loaded')
    } catch (e) {
      // ignore
    }
  }, [currentSrc])
  const fallbackSvg =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><rect width="100%" height="100%" fill="#f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#94a3b8" font-size="20">Image indisponible</text></svg>'
    )

  return (
    <div className="hero-card-image-wrapper">
      <img
        src={currentSrc}
        alt={alt}
        className={`hero-card-image ${status === 'loaded' ? 'loaded' : ''}`}
        onLoad={() => setStatus('loaded')}
        onError={() => {
          if (currentSrc !== fallbackSvg) setCurrentSrc(fallbackSvg)
          setStatus('error')
        }}
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
