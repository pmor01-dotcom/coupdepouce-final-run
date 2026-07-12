'use client'

import { useLanguage } from './LanguageProvider'

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr')
  }

  return (
    <button
      onClick={toggleLanguage}
      className="fixed top-64 right-4 z-50 bg-white/90 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white transition-colors flex items-center space-x-2"
      style={{ 
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        minWidth: '180px'
      }}
      title={language === 'fr' ? 'Switch to English' : 'Passer au français'}
    >
      <span className="text-2xl mr-2">{language === 'fr' ? '\ud83c\uddec\ud83c\udde7' : '\ud83c\uddeb\ud83c\uddf7'}</span>
      <span className="font-semibold text-gray-900">
        {language === 'fr' ? 'English Version' : 'Version Française'}
      </span>
    </button>
  )
}