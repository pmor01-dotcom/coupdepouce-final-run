import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export default async function ClientDashboard() {
  const supabase = createServerComponentClient({ cookies });

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-700 to-green-200">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-700 mb-4">Vous devez être connecté.</p>
          <a href="/login" className="text-blue-600 underline">Se connecter</a>
        </div>
      </div>
    );
  }

  // Fetch demandes
  const { data: demandes } = await supabase
    .from("demandes")
    .select("*")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch propositions
  const { data: propositions } = await supabase
    .from("propositions")
    .select("*")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-700 to-green-200 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg space-y-10">

        {/* HEADER */}
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Espace Client</h1>
          <nav className="flex gap-4 text-sm">
            <a href="/create-request" className="text-blue-600 hover:underline">➕ Créer une demande</a>
            <a href="/profile" className="text-gray-700 hover:underline">👤 Mon profil</a>
            <a href="/logout" className="text-red-600 hover:underline">🚪 Déconnexion</a>
          </nav>
        </header>

        {/* FREE BANNER */}
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded">
          <p className="font-medium">Service gratuit pendant 6 mois</p>
          <p className="text-sm">Profitez de l'accès complet sans abonnement pendant cette période.</p>
        </div>

        {/* MES DEMANDES */}
        <section>
          <h2 className="text-xl font-semibold mb-4">📋 Mes demandes</h2>

          {!demandes || demandes.length === 0 ? (
            <p className="text-gray-500">Vous n’avez pas encore créé de demande.</p>
          ) : (
            <div className="space-y-4">
              {demandes.map((d) => (
                <div key={d.id} className="bg-gray-50 p-4 rounded shadow-sm border">
                  <h3 className="font-medium">{d.titre}</h3>
                  <p className="text-gray-600 text-sm mt-1">{d.description}</p>
                  <a
                    href={`/demandes/${d.id}`}
                    className="inline-block mt-3 text-blue-600 hover:underline"
                  >
                    👁️ Voir les propositions
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* PROPOSITIONS */}
        <section>
          <h2 className="text-xl font-semibold mb-4">💬 Propositions</h2>

          {!propositions || propositions.length === 0 ? (
            <p className="text-gray-500">Aucune proposition pour le moment.</p>
          ) : (
            <div className="space-y-4">
              {propositions.map((p) => (
                <div key={p.id} className="bg-gray-50 p-4 rounded shadow-sm border">
                  <p className="font-medium">{p.artisan_name}</p>
                  <p className="text-gray-600 text-sm mt-1">{p.message}</p>
                  <a
                    href={`/messages/${p.id}`}
                    className="inline-block mt-3 text-blue-600 hover:underline"
                  >
                    💬 Ouvrir la messagerie
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
