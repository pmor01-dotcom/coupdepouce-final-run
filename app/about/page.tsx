'use client'

import Link from 'next/link'
import { useLanguage } from '../components/LanguageProvider'

export default function AboutPage() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('about.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('about.subtitle')}
          </p>
        </div>

        {/* Mission Section */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {t('about.mission')}
              </h2>
              <p className="text-gray-700 mb-4">
                {t('about.mission1')}
              </p>
              <p className="text-gray-700 mb-4">
                {t('about.mission2')}
              </p>
              <p className="text-gray-700">
                {t('about.commitment')}
              </p>
            </div>
            <div className="bg-green-50 p-8 rounded-lg">
              <div className="text-center">
                <div className="text-6xl font-bold text-green-600 mb-2">15,000+</div>
                <p className="text-gray-700">Artisans vérifiés</p>
              </div>
              <div className="text-center mt-6">
                <div className="text-6xl font-bold text-green-600 mb-2">50,000+</div>
                <p className="text-gray-700">{t('about.projects')}</p>
              </div>
              <div className="text-center mt-6">
                <div className="text-6xl font-bold text-green-600 mb-2">4.8/5</div>
                <p className="text-gray-700">{t('about.averageRating')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            {t('about.values')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('about.trust')}</h3>
              <p className="text-gray-700">
                {t('about.trustDesc')}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('about.efficiency')}</h3>
              <p className="text-gray-700">
                {t('about.efficiencyDesc')}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('about.proximity')}</h3>
              <p className="text-gray-700">
                {t('about.proximityDesc')}
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            {t('about.howItWorks')}
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-2">{t('about.signup')}</h3>
              <p className="text-gray-700 text-sm">
                {t('about.signupDesc')}
              </p>
            </div>

            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-2">{t('about.publish')}</h3>
              <p className="text-gray-700 text-sm">
                {t('about.publishDesc')}
              </p>
            </div>

            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-2">{t('about.select')}</h3>
              <p className="text-gray-700 text-sm">
                {t('about.selectDesc')}
              </p>
            </div>

            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-2">{t('about.realization')}</h3>
              <p className="text-gray-700 text-sm">
                {t('about.realizationDesc')}
              </p>
            </div>
          </div>
        </section>

        
        {/* CTA Section */}
        <section className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            {t('about.ctaTitle')}
          </h2>
          <p className="text-xl mb-8">
            {t('about.ctaSubtitle')}
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/signup" className="bg-white text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              {t('about.signUp')}
            </Link>
            <Link href="/contact" className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-700 transition-colors">
              {t('about.contactUs')}
            </Link>
          </div>
        </section>

        {/* Back Link */}
        <div className="mt-12 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← {t('about.backHome')}
          </Link>
        </div>
      </div>
    </main>
  )
}
