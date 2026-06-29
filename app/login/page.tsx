'use client'

import { useState } from 'react'
import { useAuth } from '../components/AuthProvider'
import Link from 'next/link'
import { useLanguage } from '../components/LanguageProvider'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function Login() {
  const { t } = useLanguage()
  const supabase = createClientComponentClient()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, session } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = await login(formData.email, formData.password)

      if (success) {
        // Fetch REAL role from Supabase
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session?.user.id)
          .single()

        if (profileError || !profile) {
          setError('Unable to load your profile')
          return
        }

        const role = profile.role

        // Redirect based on REAL role
        if (role === 'client') {
          window.location.href = '/client-dashboard'
        } else if (role === 'artisan') {
          window.location.href = '/artisan-dashboard'
        } else {
          setError('Your account has no role assigned')
        }

      } else {
        setError('Incorrect email or password')
      }
    } catch (err) {
      setError('Error during login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
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
              style={{ maxHeight: '128px', object