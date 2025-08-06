// Configuration de l'API - Version MySQL
const API_VERSION = '1.0.0';
const API_BASE_URL = 'api.php'; // URL de votre API PHP

// Utilitaire pour les requêtes HTTP
const ApiClient = {
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}/${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error(`Erreur API ${endpoint}:`, error);
            throw error;
        }
    },

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
};

// Gestionnaire principal de l'API
const API = {
    // Initialisation
    async init() {
        console.log('Initialisation de l\'API MySQL...');
        try {
            // Tester la connexion
            await this.testConnection();
            console.log('API MySQL initialisée avec succès');
        } catch (error) {
            console.error('Erreur lors de l\'initialisation de l\'API:', error);
            this.showConnectionError();
        }
    },

    async testConnection() {
        return await ApiClient.get('stats/dashboard');
    },

    showConnectionError() {
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; background: #e74c3c; color: white; padding: 1rem; border-radius: 5px; z-index: 9999;">
                <strong>⚠️ Erreur de connexion</strong><br>
                Impossible de se connecter à la base de données MySQL.<br>
                <small>Vérifiez que XAMPP est démarré et que la base de données existe.</small>
            </div>
        `;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 10000);
    },

    // Gestion des erreurs
    handleError(error, operation = 'opération') {
        console.error(`Erreur lors de ${operation}:`, error);
        return {
            success: false,
            error: error.message || `Erreur lors de ${operation}`
        };
    },

    // API des dépôts
    depots: {
        async getAll(filters = {}) {
            try {
                const queryParams = new URLSearchParams(filters).toString();
                const endpoint = queryParams ? `depots?${queryParams}` : 'depots';
                const response = await ApiClient.get(endpoint);
                return response;
            } catch (error) {
                return API.handleError(error, 'la récupération des dépôts');
            }
        },

        async getById(id) {
            try {
                const response = await ApiClient.get(`depots/${id}`);
                return response;
            } catch (error) {
                return API.handleError(error, 'la récupération du dépôt');
            }
        },

        async create(depotData) {
            try {
                const response = await ApiClient.post('depots', depotData);
                return response;
            } catch (error) {
                return API.handleError(error, 'la création du dépôt');
            }
        },

        async update(id, depotData) {
            try {
                const response = await ApiClient.put(`depots/${id}`, depotData);
                return response;
            } catch (error) {
                return API.handleError(error, 'la mise à jour du dépôt');
            }
        },

        async delete(id) {
            try {
                const response = await ApiClient.delete(`depots/${id}`);
                return response;
            } catch (error) {
                return API.handleError(error, 'la suppression du dépôt');
            }
        },

        async archive(id) {
            try {
                const response = await ApiClient.delete(`depots/${id}/archive`);
                return response;
            } catch (error) {
                return API.handleError(error, 'l\'archivage du dépôt');
            }
        },

        async updateStatus(id, statusId) {
            try {
                const response = await ApiClient.put(`depots/${id}/status`, { status_id: statusId });
                return response;
            } catch (error) {
                return API.handleError(error, 'la mise à jour du statut');
            }
        }
    },

    // API des clients
    clients: {
        async getAll() {
            try {
                const response = await ApiClient.get('clients');
                return response;
            } catch (error) {
                return API.handleError(error, 'la récupération des clients');
            }
        },

        async getById(id) {
            try {
                const response = await ApiClient.get(`clients/${id}`);
                return response;
            } catch (error) {
                return API.handleError(error, 'la récupération du client');
            }
        },

        async create(clientData) {
            try {
                const response = await ApiClient.post('clients', clientData);
                return response;
            } catch (error) {
                return API.handleError(error, 'la création du client');
            }
        },

        async update(id, clientData) {
            try {
                const response = await ApiClient.put(`clients/${id}`, clientData);
                return response;
            } catch (error) {
                return API.handleError(error, 'la mise à jour du client');
            }
        },

        async delete(id) {
            try {
                const response = await ApiClient.delete(`clients/${id}`);
                return response;
            } catch (error) {
                return API.handleError(error, 'la suppression du client');
            }
        }
    },

    // API des statuts
    statuts: {
        async getAll() {
            try {
                const response = await ApiClient.get('statuts');
                return response;
            } catch (error) {
                return API.handleError(error, 'la récupération des statuts');
            }
        },

        async create(statutData) {
            try {
                const response = await ApiClient.post('statuts', statutData);
                return response;
            } catch (error) {
                return API.handleError(error, 'la création du statut');
            }
        },

        async update(id, statutData) {
            try {
                const response = await ApiClient.put(`statuts/${id}`, statutData);
                return response;
            } catch (error) {
                return API.handleError(error, 'la mise à jour du statut');
            }
        },

        async delete(id) {
            try {
                const response = await ApiClient.delete(`statuts/${id}`);
                return response;
            } catch (error) {
                return API.handleError(error, 'la suppression du statut');
            }
        }
    },

    // API des archives
    archives: {
        async getAll(filters = {}) {
            try {
                const queryParams = new URLSearchParams(filters).toString();
                const endpoint = queryParams ? `archives?${queryParams}` : 'archives';
                const response = await ApiClient.get(endpoint);
                return response;
            } catch (error) {
                return API.handleError(error, 'la récupération des archives');
            }
        },

        async getById(id) {
            try {
                const response = await ApiClient.get(`archives/${id}`);
                return response;
            } catch (error) {
                return API.handleError(error, 'la récupération de l\'archive');
            }
        },

        async restore(id) {
            try {
                const response = await ApiClient.post(`archives/${id}/restore`);
                return response;
            } catch (error) {
                return API.handleError(error, 'la restauration de l\'archive');
            }
        },

        async delete(id) {
            try {
                const response = await ApiClient.delete(`archives/${id}`);
                return response;
            } catch (error) {
                return API.handleError(error, 'la suppression de l\'archive');
            }
        },

        async cleanup(olderThanDays = 365) {
            try {
                const response = await ApiClient.delete(`archives/cleanup?days=${olderThanDays}`);
                return response;
            } catch (error) {
                return API.handleError(error, 'le nettoyage des archives');
            }
        }
    },

    // API des statistiques
    stats: {
        async getDashboard() {
            try {
                const response = await ApiClient.get('stats/dashboard');
                return response;
            } catch (error) {
                return API.handleError(error, 'la récupération des statistiques');
            }
        }
    },

    // API des paramètres
    settings: {
        async get() {
            try {
                const response = await ApiClient.get('settings');
                return response;
            } catch (error) {
                return API.handleError(error, 'la récupération des paramètres');
            }
        },

        async update(newSettings) {
            try {
                const response = await ApiClient.put('settings', newSettings);
                return response;
            } catch (error) {
                return API.handleError(error, 'la mise à jour des paramètres');
            }
        }
    },

    // Utilitaires d'import/export
    backup: {
        async export() {
            try {
                const response = await ApiClient.get('backup/export');
                return response;
            } catch (error) {
                return API.handleError(error, 'l\'export des données');
            }
        },

        async import(importData) {
            try {
                const response = await ApiClient.post('backup/import', { data: importData });
                return response;
            } catch (error) {
                return API.handleError(error, 'l\'import des données');
            }
        },

        async reset() {
            try {
                const response = await ApiClient.post('backup/reset');
                return response;
            } catch (error) {
                return API.handleError(error, 'la réinitialisation des données');
            }
        }
    }
};

// Fonctions de compatibilité pour l'ancien code
const updateStatsDisplay = () => {
    const event = new CustomEvent('statsUpdated');
    document.dispatchEvent(event);
};

// Initialisation automatique lors du chargement
document.addEventListener('DOMContentLoaded', () => {
    API.init();
});

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}