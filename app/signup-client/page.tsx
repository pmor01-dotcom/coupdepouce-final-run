const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError('')
  setLoading(true)

  if (formData.password !== formData.confirmPassword) {
    setError('Les mots de passe ne correspondent pas')
    setLoading(false)
    return
  }

  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.prenom + " " + formData.nom,
        email: formData.email,
        password: formData.password,
        role: 'client',
        location: formData.city,
        department: formData.departement,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.error || 'Erreur lors de l\'inscription')
      setLoading(false)
      return
    }

    router.push('/client-dashboard')
  } catch (err: any) {
    setError(err.message || 'Erreur inconnue')
  } finally {
    setLoading(false)
  }
}
