 'use client'

import Link from 'next/link'
import { useLanguage } from './components/LanguageProvider'
import Footer from './components/Footer'

export default function Home() {
  const { t } = useLanguage()
  

  return (
    <>
      <main className="min-h-screen home-page">
        <div className="container mx-auto px-4 py-16">
          <div className="site-title">
            <h2>Coupdepouce</h2>
          </div>

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
              <img
                src="/artisan-photo.jpg"
                alt="Professional artisans working"
                className="hero-card-image"
                loading="lazy"
              />
              <div className="hero-card-content">
                <h3>{t('home.qualifiedArtisans')}</h3>
                <p>{t('home.qualifiedArtisansDesc')}</p>
              </div>
            </article>

            <article className="hero-card">
              <img
                src="/images/satisfied-clients.jpg"
                alt="Happy clients with completed projects"
                className="hero-card-image"
                loading="lazy"
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
