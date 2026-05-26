'use client'

import Link from 'next/link'
import { useLanguage } from '../components/LanguageProvider'

export default function PrivacyPolicy() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Politique de Confidentialité
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Introduction
              </h2>
              <p className="text-gray-700 mb-4">
                Coup de Pouce ("nous", "notre" ou "le service") s'engage à protéger la vie privée de ses utilisateurs. 
                Cette politique de confidentialité explique comment nous collectons, utilisons, partage et protégeons 
                vos informations personnelles lorsque vous utilisez notre plateforme de mise en relation entre 
                clients et artisans.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Informations que nous collectons
              </h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Informations de compte
              </h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Nom, adresse e-mail et numéro de téléphone</li>
                <li>Mot de passe (crypté)</li>
                <li>Type de compte (client ou artisan)</li>
                <li>Adresse et localisation</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Informations professionnelles (artisans)
              </h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Nom d'entreprise et numéro SIRET</li>
                <li>Spécialités et années d'expérience</li>
                <li>Informations d'assurance</li>
                <li>Horaires de travail</li>
                <li>Tarifs et disponibilités</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Informations de paiement
              </h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Informations de carte bancaire (traitées par Stripe)</li>
                <li>Historique des abonnements et paiements</li>
                <li>Adresse de facturation</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Données d'utilisation
              </h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Messages échangés entre clients et artisans</li>
                <li>Demandes de services créées</li>
                <li>Propositions et devis</li>
                <li>Évaluations et avis</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Comment nous utilisons vos informations
              </h2>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Pour fournir et maintenir notre service de mise en relation</li>
                <li>Pour traiter les paiements et gérer les abonnements</li>
                <li>Pour vérifier l'identité des artisans et assurer la sécurité</li>
                <li>Pour communiquer entre clients et artisans</li>
                <li>Pour améliorer nos services et personnaliser l'expérience</li>
                <li>Pour respecter nos obligations légales et réglementaires</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Partage d'informations
              </h2>
              <p className="text-gray-700 mb-4">
                Nous ne vendons ni ne louons vos informations personnelles à des tiers. 
                Nous partageons vos informations uniquement dans les cas suivants :
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Avec les artisans pour répondre à vos demandes de services</li>
                <li>Avec les clients pour les mettre en relation avec des artisans</li>
                <li>Avec Stripe pour traiter les paiements de manière sécurisée</li>
                <li>Avec les autorités légales lorsque la loi l'exige</li>
                <li>Avec des prestataires de services techniques (hébergement, analytics)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Sécurité des données
              </h2>
              <p className="text-gray-700 mb-4">
                Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations :
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Cryptage des mots de passe et données sensibles</li>
                <li>Serveurs sécurisés et surveillance continue</li>
                <li>Accès limité aux informations personnelles</li>
                <li>Conformité RGPD et réglementations européennes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Vos droits
              </h2>
              <p className="text-gray-700 mb-4">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Accès à vos informations personnelles</li>
                <li>Rectification des informations inexactes</li>
                <li>Suppression de vos informations (droit à l'oubli)</li>
                <li>Limitation du traitement de vos données</li>
                <li>Portabilité de vos données</li>
                <li>Opposition au traitement de vos données</li>
              </ul>
              <p className="text-gray-700">
                Pour exercer ces droits, contactez-nous à privacy@coupdepouce.com
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Cookies et technologies similaires
              </h2>
              <p className="text-gray-700 mb-4">
                Nous utilisons des cookies pour améliorer votre expérience :
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Cookies essentiels pour le fonctionnement du site</li>
                <li>Cookies de session pour maintenir votre connexion</li>
                <li>Cookies d'analyse pour comprendre l'utilisation du service</li>
              </ul>
              <p className="text-gray-700">
                Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Conservation des données
              </h2>
              <p className="text-gray-700 mb-4">
                Nous conservons vos informations personnelles uniquement aussi longtemps que nécessaire :
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Comptes actifs : pendant toute la durée d'utilisation du service</li>
                <li>Données financières : 7 ans pour des raisons comptables et fiscales</li>
                <li>Messages et communications : jusqu'à suppression du compte</li>
                <li>Données analytiques : 24 mois maximum</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Modifications de cette politique
              </h2>
              <p className="text-gray-700">
                Nous pouvons mettre à jour cette politique de confidentialité pour refléter 
                les changements dans nos pratiques ou pour des raisons légales. Les modifications 
                seront publiées sur cette page avec une date de mise à jour.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Contact
              </h2>
              <p className="text-gray-700 mb-4">
                Pour toute question concernant cette politique de confidentialité ou pour exercer 
                vos droits, veuillez nous contacter :
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email :</strong> privacy@coupdepouce.com<br />
                  <strong>Adresse :</strong> Coup de Pouce<br />
                  123 Rue de la République<br />
                  75001 Paris, France
                </p>
              </div>
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
