/**
 * API JavaScript adaptée pour votre base "client" existante
 * Configuration pour se connecter à votre base de données existante
 */

const API = {
    // Configuration pour votre base existante
    baseUrl: '', // Pas de préfixe, fichiers dans le même dossier
    
    // Méthodes HTTP de base
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        const config = { ...defaultOptions, ...options };
        
        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Erreur API ${endpoint}:`, error);
            throw error;
        }
    },

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    },

    // ===== GESTION DES CLIENTS (adaptée à votre table existante) =====
    clients: {
        // Récupérer tous les clients
        async getAll(filters = {}) {
            try {
                const params = new URLSearchParams();
                
                if (filters.search) params.append('search', filters.search);
                if (filters.limit) params.append('limit', filters.limit);
                if (filters.offset) params.append('offset', filters.offset);
                
                const queryString = params.toString();
                const endpoint = `api_clients_adapted.php${queryString ? '?' + queryString : ''}`;
                
                const response = await API.get(endpoint);
                return {
                    success: response.success,
                    data: response.data || [],
                    total: response.total || 0,
                    error: response.error
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message,
                    data: []
                };
            }
        },

        // Récupérer un client par ID
        async getById(id) {
            try {
                const response = await API.get(`api_clients_adapted.php?path=${id}`);
                return {
                    success: response.success,
                    data: response.data,
                    error: response.error
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        },

        // Créer un nouveau client
        async create(clientData) {
            try {
                // Validation côté client
                if (!clientData.nom || clientData.nom.trim() === '') {
                    throw new Error('Le nom est obligatoire');
                }

                const response = await API.post('api_clients_adapted.php', clientData);
                return {
                    success: response.success,
                    data: response.data,
                    error: response.error
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        },

        // Mettre à jour un client
        async update(id, clientData) {
            try {
                if (!id) {
                    throw new Error('ID client manquant');
                }

                const response = await API.put(`api_clients_adapted.php?path=${id}`, clientData);
                return {
                    success: response.success,
                    data: response.data,
                    error: response.error
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        },

        // Supprimer un client
        async delete(id) {
            try {
                if (!id) {
                    throw new Error('ID client manquant');
                }

                const response = await API.delete(`api_clients_adapted.php?path=${id}`);
                return {
                    success: response.success,
                    error: response.error
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        }
    },

    // ===== GESTION DES DÉPÔTS (pour plus tard) =====
    depots: {
        async getAll(filters = {}) {
            try {
                const params = new URLSearchParams();
                
                if (filters.search) params.append('search', filters.search);
                if (filters.client_id) params.append('client_id', filters.client_id);
                if (filters.status_id) params.append('status_id', filters.status_id);
                if (filters.limit) params.append('limit', filters.limit);
                if (filters.offset) params.append('offset', filters.offset);
                
                const queryString = params.toString();
                const endpoint = `api_depots.php${queryString ? '?' + queryString : ''}`;
                
                const response = await API.get(endpoint);
                return {
                    success: response.success,
                    data: response.data || [],
                    total: response.total || 0,
                    error: response.error
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message,
                    data: []
                };
            }
        },

        async create(depotData) {
            try {
                const response = await API.post('api_depots.php', depotData);
                return {
                    success: response.success,
                    data: response.data,
                    error: response.error
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        },

        async update(id, depotData) {
            try {
                const response = await API.put(`api_depots.php?path=${id}`, depotData);
                return {
                    success: response.success,
                    data: response.data,
                    error: response.error
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        },

        async delete(id) {
            try {
                const response = await API.delete(`api_depots.php?path=${id}`);
                return {
                    success: response.success,
                    error: response.error
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        }
    },

    // ===== GESTION DES STATUTS =====
    statuts: {
        async getAll() {
            try {
                const response = await API.get('api_statuts.php');
                return {
                    success: response.success,
                    data: response.data || [],
                    error: response.error
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message,
                    data: []
                };
            }
        }
    },

    // ===== STATISTIQUES ET TABLEAUX DE BORD =====
    stats: {
        async dashboard() {
            try {
                // Utiliser les statistiques basiques si l'API complète n'est pas disponible
                return await this.getBasicStats();
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        },

        // Fonction alias pour la compatibilité avec app_fixed.js
        async getDashboard() {
            return await this.dashboard();
        },

        // Statistiques basiques basées sur vos clients existants
        async getBasicStats() {
            try {
                const clientsResponse = await API.clients.getAll();
                
                if (clientsResponse.success) {
                    const totalClients = clientsResponse.total || clientsResponse.data.length;
                    
                    // Statistiques basiques
                    const stats = {
                        totalClients: totalClients,
                        totalDepots: 2, // Dépôts de test pour l'instant
                        depotsEnAttente: 1,
                        depotsEnCours: 1,
                        depotsPrets: 0,
                        depotsRecuperes: 0,
                        depotsTermines: 0,
                        clientsAvecEmail: clientsResponse.data.filter(c => c.email && c.email.trim() !== '').length,
                        clientsAvecTelephone: clientsResponse.data.filter(c => c.telephone && c.telephone.trim() !== '').length
                    };
                    
                    console.log('📊 Statistiques calculées:', stats);
                    
                    return {
                        success: true,
                        data: stats
                    };
                } else {
                    throw new Error(clientsResponse.error);
                }
            } catch (error) {
                console.error('❌ Erreur dans getBasicStats:', error);
                return {
                    success: false,
                    error: error.message,
                    data: {
                        totalClients: 0,
                        totalDepots: 0,
                        depotsEnAttente: 0,
                        depotsEnCours: 0,
                        depotsPrets: 0,
                        depotsRecuperes: 0,
                        depotsTermines: 0,
                        clientsAvecEmail: 0,
                        clientsAvecTelephone: 0
                    }
                };
            }
        }
    },

    // Test de connexion adapté à votre base
    async testConnection() {
        try {
            // Test simple : récupérer le nombre de clients
            const response = await this.clients.getAll({ limit: 1 });
            if (response.success) {
                console.log('✅ Connexion à votre base "client" réussie !');
                console.log(`📊 ${response.total} clients trouvés dans votre base`);
                return true;
            } else {
                console.error('❌ Erreur lors du test de connexion:', response.error);
                return false;
            }
        } catch (error) {
            console.error('❌ Test de connexion échoué:', error);
            return false;
        }
    },

    // Méthode pour afficher des infos sur votre base
    async showDatabaseInfo() {
        try {
            const clientsResponse = await this.clients.getAll({ limit: 5 });
            
            if (clientsResponse.success) {
                console.log('🎉 CONNEXION RÉUSSIE À VOTRE BASE "client"');
                console.log('===============================================');
                console.log(`📊 Total de clients : ${clientsResponse.total}`);
                
                if (clientsResponse.data.length > 0) {
                    console.log('👥 Premiers clients trouvés :');
                    clientsResponse.data.forEach((client, index) => {
                        console.log(`  ${index + 1}. ${client.prenom} ${client.nom} - ${client.ville || 'Ville non renseignée'}`);
                    });
                }
                
                return true;
            } else {
                console.error('❌ Impossible de récupérer les informations de la base');
                return false;
            }
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des infos:', error);
            return false;
        }
    }
};

// Fonction d'initialisation adaptée
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🔄 Initialisation de la connexion à votre base "client"...');
        
        // Tester la connexion à votre base existante
        const connected = await API.testConnection();
        
        if (connected) {
            // Afficher les informations de votre base
            await API.showDatabaseInfo();
        } else {
            console.warn('⚠️ Impossible de se connecter à votre base "client"');
            console.warn('📋 Vérifiez que :');
            console.warn('   - XAMPP est démarré (Apache + MySQL)');
            console.warn('   - Votre base "client" existe dans phpMyAdmin');
            console.warn('   - Les fichiers API sont dans le bon dossier');
            
            // Proposer le mode localStorage en secours
            if (window.confirm('Connexion impossible. Utiliser le mode hors ligne ?')) {
                const script = document.createElement('script');
                script.src = 'api.js'; // Votre ancienne API localStorage
                document.head.appendChild(script);
                return;
            }
        }
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
    }
});

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}

// Rendre disponible globalement
window.API = API;