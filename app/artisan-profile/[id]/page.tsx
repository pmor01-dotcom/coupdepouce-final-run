import Link from 'next/link'

interface ArtisanProfilePageProps {
  params: {
    id: string
  }
}

export default function ArtisanProfilePage({ params }: ArtisanProfilePageProps) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-semibold">Artisan profile</h1>
        <p className="mt-4 text-lg text-slate-600">
          The artisan profile page for <strong>{params.id}</strong> is not implemented yet.
        </p>
        <div className="mt-8">
          <Link href="/" className="rounded-md bg-green-600 px-5 py-3 text-white hover:bg-green-700">
            Return to home
          </Link>
        </div>
      </div>
    </main>
  )
}
