 <button
                        onClick={() => handleContactArtisan(artisan)}
                        className="w-full btn-primary text-sm py-2"
                      >
                        {t('dashboard.contactArtisan')}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Messages Tab Content */}
        {activeTab === 'messages' && (
          <div className="h-96">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Messages
            </h2>
            <div className="h-full">
              <MessagingInterface />
            </div>
          </div>
        )}

        {/* Search Tab Content */}
        {activeTab === 'search' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Recherche avancée
            </h2>
            <div className="space-y-6">
              <SearchFilters
                type="artisans"
                onFiltersChange={setSearchFilters}
                onSearch={setSearchQuery}
              />
              <SearchResults
                type="artisans"
                query={searchQuery}
                filters={searchFilters}
              />
            </div>
          </div>
        )}

        {/* Demands Tab Content */}
        {activeTab === 'demands' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Mes demandes
            </h2>
            {demands.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  Vous n'avez pas encore de demandes
                </p>
                <Link href="/create-demand" className="btn-primary">
                  Créer une demande
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {demands.map((demand) => (
                  <div key={demand.id} className="card">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {demand.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {demand.description}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      demand.status === 'OPEN'
                        ? 'bg-yellow-100 text-yellow-800'
                        : demand.status === 'IN_PROGRESS'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                        {getDemandStatusText(demand.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                      <div>
                        <span className="font-medium">Catégorie:</span> {demand.category}
                      </div>
                      <div>
                        <span className="font-medium">Localisation:</span> {demand.location}
                      </div>
                      <div>
                        <span className="font-medium">Budget:</span> {demand.budget_range || 'Non spécifié'}
                      </div>
                      <div>
                        <span className="font-medium">Réponses:</span> {demand.proposals?.length || 0}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Créée le {new Date(demand.created_at).toLocaleDateString('fr-FR')}
                      </span>
                      <div className="flex space-x-2">
                        {demand.proposals && demand.proposals.length > 0 && (
                          <Link href={`/demands/${demand.id}`} className="btn-secondary">
                            Voir les propositions ({demand.proposals.length})
                          </Link>
                        )}
                        <Link href={`/demands/${demand.id}`} className="btn-primary">
                          Voir les détails
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Unsubscribe Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => {
            if (confirm(t('unsubscribe.confirm'))) {
              // Handle unsubscribe logic here
              logout()
              router.push('/')
            }
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-full shadow-lg flex items-center space-x-2 transition-colors duration-200"
          title={t('unsubscribe.title')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="text-sm font-medium">{t('unsubscribe.title')}</span>
        </button>
      </div>
    </main>
      <MessageNotifications />
    </MessagingProvider>
  )
}
