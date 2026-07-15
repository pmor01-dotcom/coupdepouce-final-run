'use client'

import Link from 'next/link'
import { useLanguage } from './LanguageProvider'

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Legal Only */}
       {/* Legal */}
<div>
  <h4 className="text-lg font-semibold text-white mb-4">
    {t('legal')}
  </h4>
  <ul className="space-y-2">
    <li>
      <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
        {t('terms')}
      </Link>
    </li>
    <li>
      <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
        {t('privacy')}
      </Link>
    </li>
    <li>
      <Link href="/terms-artisan" className="text-gray-400 hover:text-white transition-colors">
        {t('artisanTerms')}
      </Link>
    </li>
    <li>
      <a
        href="mailto:info@coupdepouce.com"
        className="text-gray-400 hover:text-white transition-colors"
      >
        info@coupdepouce.com
      </a>
    </li>
  </ul>
</div>


      </div>
    </footer>
  )
}
