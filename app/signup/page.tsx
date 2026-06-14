const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError('')
  setIsLoading(true)

  if (!role) {
    setError("Veuillez sélectionner un rôle.")
    setIsLoading(false)
    return
  }

  if (formData.password !== formData.confirmPassword) {
    setError('Les mots de passe ne correspondent pas')
    setIsLoading(false)
    return
  }

  try {
    // 1️⃣ CREATE AUTH USER
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setIsLoading(false)
      return
    }

    const user = signUpData.user
    if (!user) {
      setError("Veuillez vérifier votre email pour confirmer votre compte.")
      setIsLoading(false)
      return
    }

    // 2️⃣ INSERT INTO public.users
    const { error: profileError } = await supabase.from('users').insert({
      id: user.id,
      name: formData.name,
      email: formData.email,
      role: role,
    })

    if (profileError) {
      setError(profileError.message)
      setIsLoading(false)
      return
    }

    // 3️⃣ REDIRECT
    if (role === 'client') {
      router.push('/client-dashboard')
    } else {
      router.push('/signup-artisan')
    }

  } catch (err: any) {
    setError(err.message || 'Erreur inconnue')
  } finally {
    setIsLoading(false)
  }
}
