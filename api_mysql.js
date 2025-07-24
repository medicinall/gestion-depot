// Configuration de l'API - Version MySQL/PHP
const API_BASE_URL = window.location.origin + '/api.php';
const API_VERSION = '1.0.0';

// Gestionnaire principal de l'API
const API = {
    // Configuration
    baseURL: API_BASE_URL,
    
    // Méthode générique pour les requêtes HTTP
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}/${endpoint.replace(/^\//, '')}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            // Gestion des erreurs HTTP
            if (!response.ok) {
                let errorMessage = `Erreur HTTP: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // Si on ne peut pas parser le JSON d'erreur
                }
                throw new Error(errorMessage);
            }

            // Parser la réponse JSON
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('Erreur API:', error);
            throw error;
        }
    },

    // Méthodes HTTP raccourcies
    async get(endpoint, params = {}) {
        const searchParams = new URLSearchParams(params);
        const url = searchParams.toString() ? `${endpoint}?${searchParams}` : endpoint;
        return await this.request(url, { method: 'GET' });
    },

    async post(endpoint, data = {}) {
        return await this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async put(endpoint, data = {}) {
        return await this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async delete(endpoint) {
        return await this.request(endpoint, { method: 'DELETE' });
    },

    // API des dépôts
    depots: {
        async getAll(filters = {}) {
            try {
                const response = await API.get('depots', filters);
                return {
                    success: response.success,
                    data: response.data,
                    error: response.message
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        },

        async getById(id) {
            try {
                const response = await API.get(`depots/${id}`);
                return {
                    success: response.success,
                    data: response.data,
                    error: response.message
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        },

        async create(depotData) {
            try {
                const response = await API.post('depots', depotData);
                return {
                    success: response.success,
                    data: response.data,
                    error: response.message
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
                const response = await API.put(`depots/${id}`, depotData);
                return {
                    success: response.success,
                    data: response.data,
                    error: response.message
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
                const response = await API.delete(`depots/${id}`);
                return {
                    success: response.success,
                    error: response.message
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        },

        async archive(id) {
            try {
                const response = await API.delete(`depots/${id}/archive`);
                return {
                    success: response.success,
                    data: response.data,
                    error: response.message
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        },

        async updateStatus(id, statusId) {
            try {
                const response = await API.put(`depots/${id}/status`, { status_id: statusId });
                return {
                    success: response.success,
                    data: response.data,
                    error: response.message
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        },

        // Génération PDF
        async generatePDF(id) {
            try {
                // Ouvrir le PDF dans un nouvel onglet
                const url = `${API.baseURL}/pdf/${id}/depot`;
                window.open(url, '_blank');
                return {
                    success: true,
                    message: 'PDF généré avec succès'
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        }
    },

    // API des clients
    clients: {
        async getAll() {
            try {
                const response = await API.get('clients');
                return {
                    success: response.success,
                    data: response.data,
                    error: response.message
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        },

        async getById(id) {
            try {
                const response = await API.get(`clients/${id}`);
                return {
                    success: response.success,
                    data: response.data,
                    error: response.message
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        },

        async create(clientData) {
            try {
                const response = await API.post('clients', clientData);
                return {
                    success: response.success,
                    data: response.data,
                    error: response.message
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        },

        async update(id, clientData) {
            try {
                const response = await API.put(`clients/${id}`, clientData);
                return {
                    success: response.success,
                    data: response.data,
                    error: response.message
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
                const response = await API.delete(`clients/${id}`);
                return {
                    success: response.success,
                    error: response.message
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        }
    },

    // API des statuts
    statuts: {
        async getAll() {
            try {
                const response = await API.get('statuts');
                return {
                    success: response.success,
                    data: response.data,
                    error: response.message
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        },

        async create(statutData) {
            try {
                const response = await API.post('statuts', statutData);
                return {
                    success: response.success,
                    data: response.data,
                    error: response.message
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        },

        async update(id, statutData) {
            try {
                const response = await API.put(`statuts/${id}`, statutData);
                return {
                    success: response.success,
                    data: response.data,
                    error: response.message
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
                const response = await API.delete(`statuts/${id}`);
                return {
                    success: response.success,
                    error: response.message
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        }
    },

    // API des archives
    archives: {
        async getAll(filters = {}) {
            try {
                const response = await API.get('archives', filters);
                return {
                    success: response.success,
                    data: response.data,
                    error: response.message
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        },

        async getById(id) {
            try {
                const response = await API.get(`archives/${id}`);
                return {
                    success: response.success,
                    data: response.data,
                    error: response.message
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        },

        async restore(id) {
            try {
                const response = await API.post(`archives/${id}/restore`);
                return {
                    success: response.success,
                    data: response.data,
                    error: response.message
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
                const response = await API.delete(`archives/${id}`);
                return {
                    success: response.success,
                    error: response.message
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        },

        async cleanup(olderThanDays = 365) {
            try {
                const response = await API.delete(`archives/cleanup?days=${olderThanDays}`);
                return {
                    success: response.success,
                    data: response.data,
                    error: response.message
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        }
    },

    // API des statistiques
    stats: {
        async getDashboard() {
            try {
                const response = await API.get('stats/dashboard');
                return {
                    success: response.success,
                    data: response.data,
                    error: response.message
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        }
    },

    // API des paramètres
    settings: {
        async get() {
            try {
                const response = await API.get('settings');
                return {
                    success: response.success,
                    data: response.data,
                    error: response.message
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        },

        async update(newSettings) {
            try {
                const response = await API.put('settings', newSettings);
                return {
                    success: response.success,
                    data: response.data,
                    error: response.message
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        }
    },

    // Utilitaires d'import/export
    backup: {
        async export() {
            try {
                const response = await API.get('backup/export');
                return {
                    success: response.success,
                    data: response.data,
                    error: response.message
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        },

        async import(importData) {
            try {
                const response = await API.post('backup/import', { data: importData });
                return {
                    success: response.success,
                    data: response.data,
                    error: response.message
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        },

        async reset() {
            try {
                const response = await API.post('backup/reset');
                return {
                    success: response.success,
                    data: response.data,
                    error: response.message
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        }
    },

    // Test de connexion
    async testConnection() {
        try {
            const response = await this.get('stats/dashboard');
            return response.success;
        } catch (error) {
            console.error('Test de connexion échoué:', error);
            return false;
        }
    },

    // Gestion d'erreurs globale (compatible avec l'ancienne API)
    handleAuthError(error) {
        // Pour la version MySQL, pas de gestion d'authentification
        // Mais on garde la méthode pour la compatibilité
        console.error('Erreur API:', error);
    }
};

// Fonction d'initialisation
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Tester la connexion à l'API
        const connected = await API.testConnection();
        if (!connected) {
            console.warn('Impossible de se connecter à l\'API MySQL. Vérifiez que XAMPP est démarré et que la base de données est configurée.');
            
            // Optionnel: Basculer automatiquement vers localStorage en cas d'échec
            if (window.confirm('Connexion à la base de données impossible. Voulez-vous utiliser le mode hors ligne (localStorage) ?')) {
                // Charger l'ancienne API localStorage
                const script = document.createElement('script');
                script.src = 'api.js';
                document.head.appendChild(script);
                return;
            }
        } else {
            console.log('Connexion à l\'API MySQL réussie');
        }
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'API:', error);
    }
});

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}

// Rendre disponible globalement
window.API = API;