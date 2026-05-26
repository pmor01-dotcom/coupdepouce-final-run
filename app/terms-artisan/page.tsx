'use client'

import Link from 'next/link'

export default function ArtisanTerms() {
  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Conditions Générales d'Utilisation - Artisans
            </h1>
            <Link 
              href="/signup" 
              className="btn-secondary"
            >
              Retour à l'inscription
            </Link>
          </div>
        </div>

        {/* Terms Content */}
        <div className="bg-white shadow-sm rounded-lg p-8 space-y-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Objet du service</h2>
            <p className="text-gray-600 mb-6">
              Coup de Pouce est une plateforme mettant en relation des clients cherchant des artisans qualifiés 
              et des artisans proposant leurs services. En tant qu'artisan, vous vous engagez à fournir 
              des services professionnels selon les standards de qualité attendus.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Responsabilités de l'artisan</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
              <li>Fournir des services professionnels et de qualité</li>
              <li>Respecter les délais convenus avec les clients</li>
              <li>Maintenir à jour votre profil et vos informations</li>
              <li>Respecter les conditions tarifaires indiquées</li>
              <li>Garantir la sécurité et la conformité réglementaire</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Règles de communication</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <p className="text-yellow-800 font-medium mb-2">
                <strong>⚠️ Règle importante - Premier contact</strong>
              </p>
              <p className="text-yellow-700">
                En tant qu'artisan, vous ne pouvez <strong>pas initier le contact</strong> avec les clients. 
                Vous devez uniquement répondre aux demandes existantes et proposer vos services. 
                Le premier contact doit <strong>toujours être initié par le client</strong>.
              </p>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Modalités de paiement</h2>
            <p className="text-gray-600 mb-6">
              Les modalités de paiement sont convenues directement entre l'artisan et le client. 
              Coup de Pouce ne garantit pas le paiement et n'intervient pas dans les 
              transactions financières entre les parties.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Confidentialité</h2>
            <p className="text-gray-600 mb-6">
              Vous vous engagez à respecter la confidentialité des informations des clients 
              et à ne pas utiliser leurs coordonnées à des fins commerciales non autorisées.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Engagement de qualité</h2>
            <p className="text-gray-600 mb-6">
              Vous vous engagez à maintenir un niveau de qualité professionnel et à traiter 
              toutes les demandes avec sérieux et professionnalisme. Tout manquement à ces 
              obligations pourra entraîner la suspension de votre compte.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Droits et obligations</h2>
            <p className="text-gray-600 mb-6">
              Coup de Pouce se réserve le droit de suspendre ou de résilier votre compte 
              en cas de non-respect des présentes conditions générales.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Durée et résiliation</h2>
            <p className="text-gray-600 mb-6">
              Les présentes conditions générales sont applicables dès votre inscription sur la plateforme. 
              Vous pouvez résilier votre compte à tout moment en respectant un préavis de 30 jours.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Contact et support</h2>
            <p className="text-gray-600 mb-6">
              Pour toute question concernant les présentes conditions générales, 
              vous pouvez nous contacter à l'adresse support@coupdepouce.fr
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Acceptation des conditions</h2>
            <p className="text-gray-600 mb-6">
              En cochant la case d'acceptation lors de votre inscription, vous reconnaissez 
              avoir lu, compris et accepté sans réserve les présentes conditions générales d'utilisation.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 pt-8 border-t border-gray-200">
            <Link 
              href="/signup" 
              className="btn-secondary"
            >
              Retour à l'inscription
            </Link>
            <Link 
              href="/signup?terms=accepted" 
              className="btn-primary"
            >
              J'accepte les conditions
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
