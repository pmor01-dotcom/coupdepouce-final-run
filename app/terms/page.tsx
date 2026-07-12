'use client'

import Link from 'next/link'
import { useLanguage } from '../components/LanguageProvider'

export default function TermsOfService() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Conditions Générales d'Utilisation
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Acceptation des conditions
              </h2>
              <p className="text-gray-700 mb-4">
                En utilisant la plateforme Coup de Pouce, vous acceptez sans réserve les présentes 
                conditions générales d'utilisation. Si vous n'acceptez pas ces conditions, 
                vous ne devez pas utiliser notre service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Description du service
              </h2>
              <p className="text-gray-700 mb-4">
                Coup de Pouce est une plateforme en ligne qui met en relation des clients 
                recherchant des artisans avec des professionnels qualifiés. Notre service inclut :
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Création de comptes clients et artisans</li>
                <li>Publication de demandes de services</li>
                <li>Recherche et contact d'artisans qualifiés</li>
                <li>Échange de messages et de devis</li>
                <li>Gestion des abonnements pour artisans</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Comptes utilisateurs
              </h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Création de compte
              </h3>
              <p className="text-gray-700 mb-4">
                Pour utiliser Coup de Pouce, vous devez créer un compte en fournissant des 
                informations exactes et complètes. Vous êtes responsable de la confidentialité 
                de vos identifiants de connexion.
              </p>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Types de comptes
              </h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Compte Client :</strong> Pour publier des demandes et trouver des artisans</li>
                <li><strong>Compte Artisan :</strong> Pour répondre aux demandes et proposer ses services</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Suspension et résiliation
              </h3>
              <p className="text-gray-700 mb-4">
                Nous nous réservons le droit de suspendre ou résilier votre compte en cas de 
                violation des présentes conditions ou d'utilisation abusive du service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Obligations des utilisateurs
              </h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Pour les clients
              </h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Fournir des informations exactes sur vos demandes</li>
                <li>Respecter les artisans et communiquer de manière professionnelle</li>
                <li>Payer les services convenus selon les termes convenus</li>
                <li>Ne pas publier de demandes illégales ou inappropriées</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Pour les artisans
              </h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Fournir des informations professionnelles exactes et vérifiables</li>
                <li>Disposer des qualifications et assurances nécessaires</li>
                <li>Répondre aux demandes de manière professionnelle et rapide</li>
                <li>Respecter les délais et engagements pris</li>
                <li>Maintenir à jour son profil et ses disponibilités</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Abonnements et paiements
              </h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Abonnements artisans
              </h3>
              <p className="text-gray-700 mb-4">
                Les artisans peuvent souscrire à des abonnements mensuels ou annuels pour 
                accéder à des fonctionnalités avancées. Les abonnements sont renouvelés 
                automatiquement sauf résiliation avec un préavis de 14 jours.
              </p>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Modalités de paiement
              </h3>
              <p className="text-gray-700 mb-4">
                Les paiements des abonnements sont traités par Stripe de manière sécurisée. 
                Les clients paient directement les artisans selon les conditions convenues entre eux.
              </p>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Remboursements
              </h3>
              <p className="text-gray-700 mb-4">
                Les abonnements peuvent être résiliés à tout moment. Aucun remboursement 
                n'est effectué pour la période d'abonnement en cours.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Propriété intellectuelle
              </h2>
              <p className="text-gray-700 mb-4">
                Le contenu de la plateforme Coup de Pouce (logos, textes, images, 
                fonctionnalités) est protégé par les lois sur la propriété intellectuelle. 
                Vous ne pouvez pas utiliser, reproduire ou distribuer notre contenu sans 
                autorisation.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Responsabilité
              </h2>
              <p className="text-gray-700 mb-4">
                Coup de Pouce n'est pas une société d'intérim et n'agit pas comme 
                employeur ou intermédiaire d'emploi. Les professionnels inscrits sur 
                notre plateforme sont indépendants et peuvent librement offrir leurs services 
                aux clients selon leurs propres conditions et disponibilités. Le grand public 
                peut également proposer des services sur la plateforme dans le respect des 
                conditions générales d'utilisation.
              </p>
              <p className="text-gray-700 mb-4">
                Notre responsabilité est limitée aux dommages directs et ne peut excéder 
                le montant des abonnements payés.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Confidentialité
              </h2>
              <p className="text-gray-700 mb-4">
                Nous nous engageons à protéger la vie privée de nos utilisateurs. 
                Consultez notre <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
                  politique de confidentialité
                </Link> pour en savoir plus sur la collecte et l'utilisation de vos données.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Contenu utilisateur
              </h2>
              <p className="text-gray-700 mb-4">
                En publiant du contenu sur notre plateforme, vous nous accordez le droit 
                de l'utiliser, de le modifier et de le distribuer dans le cadre de notre service.
              </p>
              <p className="text-gray-700 mb-4">
                Vous vous engagez à ne pas publier de contenu :
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Illégal, diffamatoire ou offensant</li>
                <li>Violant les droits de propriété intellectuelle</li>
                <li>Contenant des virus ou logiciels malveillants</li>
                <li>Faisant de la publicité non sollicitée</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Résolution des litiges
              </h2>
              <p className="text-gray-700 mb-4">
                En cas de litige entre un client et un artisan, nous encourageons une 
                résolution amiable. Coup de Pouce ne peut pas agir comme médiateur entre les 
                parties, car nous sommes une plateforme de mise en relation et non un service 
                de médiation. Les litiges doivent être résolus directement entre le client et 
                l'artisan ou par les voies légales appropriées.
              </p>
              <p className="text-gray-700 mb-4">
                Les litiges concernant l'utilisation de la plateforme sont soumis à la 
                juridiction française.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Modifications des conditions
              </h2>
              <p className="text-gray-700">
                Nous nous réservons le droit de modifier ces conditions générales d'utilisation. 
                Les modifications entreront en vigueur dès leur publication sur la plateforme. 
                Nous vous informerons des changements importants par email.
              </p>
            </section>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <Link href="/" className="text-blue-600 hover:text-blue-800">
                ← Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
