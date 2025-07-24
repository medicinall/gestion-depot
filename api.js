// Configuration de l'API - Version LocalStorage
const API_VERSION = '1.0.0';
const STORAGE_PREFIX = 'depot_manager_';

// Clés de stockage
const STORAGE_KEYS = {
    DEPOTS: STORAGE_PREFIX + 'depots',
    CLIENTS: STORAGE_PREFIX + 'clients',
    STATUTS: STORAGE_PREFIX + 'statuts',
    ARCHIVES: STORAGE_PREFIX + 'archives',
    SETTINGS: STORAGE_PREFIX + 'settings',
    STATS: STORAGE_PREFIX + 'stats'
};

// Gestionnaire principal de l'API
const API = {
    // Utilitaires de stockage local
    storage: {
        get(key) {
            try {
                const data = localStorage.getItem(key);
                return data ? JSON.parse(data) : null;
            } catch (error) {
                console.error('Erreur de lecture du stockage:', error);
                return null;
            }
        },

        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Erreur d\'écriture du stockage:', error);
                return false;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Erreur de suppression du stockage:', error);
                return false;
            }
        },

        clear() {
            try {
                Object.values(STORAGE_KEYS).forEach(key => {
                    localStorage.removeItem(key);
                });
                return true;
            } catch (error) {
                console.error('Erreur de nettoyage du stockage:', error);
                return false;
            }
        }
    },

    // Initialisation des données par défaut
    init() {
        // Vérifier si les données existent déjà
        if (!this.storage.get(STORAGE_KEYS.CLIENTS)) {
            this.initDefaultData();
        }
    },

    initDefaultData() {
        console.log('Initialisation des données par défaut...');

        // Clients par défaut
        const defaultClients = [
            { id: 1, prenom: 'Martin', nom: 'Dupont', email: 'martin.dupont@email.com', telephone: '06 12 34 56 78', adresse: '123 Rue de la Paix, Paris', notes: 'Client régulier', date_creation: new Date().toISOString() },
            { id: 2, prenom: 'Sophie', nom: 'Bernard', email: 'sophie.bernard@email.com', telephone: '06 87 65 43 21', adresse: '456 Avenue des Champs, Lyon', notes: '', date_creation: new Date().toISOString() },
            { id: 3, prenom: 'Pierre', nom: 'Martin', email: 'pierre.martin@email.com', telephone: '06 11 22 33 44', adresse: '789 Boulevard Saint-Michel, Marseille', notes: 'Professionnel', date_creation: new Date().toISOString() },
            { id: 4, prenom: 'Julie', nom: 'Moreau', email: 'julie.moreau@email.com', telephone: '06 55 44 33 22', adresse: '321 Rue du Commerce, Bordeaux', notes: '', date_creation: new Date().toISOString() },
            { id: 5, prenom: 'Thomas', nom: 'Lefebvre', email: 'thomas.lefebvre@email.com', telephone: '06 99 88 77 66', adresse: '654 Impasse des Lilas, Lille', notes: 'Client VIP', date_creation: new Date().toISOString() }
        ];

        // Statuts par défaut
        const defaultStatuts = [
            { id: 1, nom: 'En attente', couleur_hex: '#e74c3c', action: 'Traitement initial', description: 'Dépôt reçu, en attente de traitement', ordre: 1 },
            { id: 2, nom: 'En cours', couleur_hex: '#f39c12', action: 'Traitement en cours', description: 'Réparation ou service en cours', ordre: 2 },
            { id: 3, nom: 'Prêt', couleur_hex: '#3498db', action: 'Contacter le client', description: 'Travail terminé, prêt à récupérer', ordre: 3 },
            { id: 4, nom: 'Terminé', couleur_hex: '#27ae60', action: 'Dépôt récupéré', description: 'Dépôt récupéré par le client', ordre: 4 }
        ];

        // Dépôts par défaut
        const defaultDepots = [
            { 
                id: 1, 
                client_id: 1, 
                status_id: 2, 
                description: 'Réparation écran iPhone 12', 
                notes: 'Écran cassé suite à une chute',
                date_depot: '2025-06-24', 
                date_prevue: '2025-06-26',
                date_creation: new Date().toISOString(),
                date_modification: new Date().toISOString()
            },
            { 
                id: 2, 
                client_id: 2, 
                status_id: 3, 
                description: 'Changement batterie Samsung Galaxy S21', 
                notes: 'Batterie ne tient plus la charge',
                date_depot: '2025-06-23', 
                date_prevue: '2025-06-25',
                date_creation: new Date().toISOString(),
                date_modification: new Date().toISOString()
            },
            { 
                id: 3, 
                client_id: 3, 
                status_id: 1, 
                description: 'Réparation carte mère PC portable', 
                notes: 'PC ne s\'allume plus',
                date_depot: '2025-06-25', 
                date_prevue: '2025-06-30',
                date_creation: new Date().toISOString(),
                date_modification: new Date().toISOString()
            },
            { 
                id: 4, 
                client_id: 4, 
                status_id: 4, 
                description: 'Installation Windows 11 + logiciels', 
                notes: 'Migration depuis Windows 10',
                date_depot: '2025-06-22', 
                date_prevue: '2025-06-24',
                date_creation: new Date().toISOString(),
                date_modification: new Date().toISOString()
            }
        ];

        // Archives par défaut
        const defaultArchives = [
            { 
                id: 101, 
                client_id: 5, 
                client_nom: 'Jean Durand',
                description: 'Réparation tablette iPad Pro', 
                date_depot: '2025-06-15', 
                date_archive: '2025-06-22',
                statut_final: 'Terminé',
                notes: 'Réparation écran tactile'
            },
            { 
                id: 102, 
                client_id: 6, 
                client_nom: 'Marie Leroy',
                description: 'Installation suite Office', 
                date_depot: '2025-06-10', 
                date_archive: '2025-06-20',
                statut_final: 'Terminé',
                notes: 'Installation et configuration complète'
            },
            { 
                id: 103, 
                client_id: 7, 
                client_nom: 'Paul Girard',
                description: 'Récupération de données disque dur', 
                date_depot: '2025-06-05', 
                date_archive: '2025-06-18',
                statut_final: 'Terminé',
                notes: 'Récupération réussie à 95%'
            }
        ];

        // Paramètres par défaut
        const defaultSettings = {
            max_depots_display: 25,
            auto_archive_days: 30,
            auto_backup: true,
            backup_frequency: 3600000, // 1 heure en ms
            theme: 'light',
            language: 'fr',
            date_format: 'DD/MM/YYYY',
            currency: 'EUR'
        };

        // Sauvegarder les données par défaut
        this.storage.set(STORAGE_KEYS.CLIENTS, defaultClients);
        this.storage.set(STORAGE_KEYS.STATUTS, defaultStatuts);
        this.storage.set(STORAGE_KEYS.DEPOTS, defaultDepots);
        this.storage.set(STORAGE_KEYS.ARCHIVES, defaultArchives);
        this.storage.set(STORAGE_KEYS.SETTINGS, defaultSettings);

        console.log('Données par défaut initialisées avec succès');
    },

    // Gestion des erreurs
    handleError(error, operation = 'opération') {
        console.error(`Erreur lors de ${operation}:`, error);
        return {
            success: false,
            error: error.message || `Erreur lors de ${operation}`
        };
    },

    // Génération d'IDs uniques
    generateId(existingItems) {
        if (!existingItems || existingItems.length === 0) return 1;
        return Math.max(...existingItems.map(item => item.id || 0)) + 1;
    },

    // API des dépôts
    depots: {
        async getAll(filters = {}) {
            try {
                let depots = API.storage.get(STORAGE_KEYS.DEPOTS) || [];
                
                // Appliquer les filtres
                if (filters.client_id) {
                    depots = depots.filter(depot => depot.client_id == filters.client_id);
                }
                if (filters.status_id) {
                    depots = depots.filter(depot => depot.status_id == filters.status_id);
                }
                if (filters.archived !== undefined) {
                    depots = depots.filter(depot => !!depot.archived === filters.archived);
                }
                if (filters.date_from) {
                    depots = depots.filter(depot => depot.date_depot >= filters.date_from);
                }
                if (filters.date_to) {
                    depots = depots.filter(depot => depot.date_depot <= filters.date_to);
                }

                return {
                    success: true,
                    data: { depots }
                };
            } catch (error) {
                return API.handleError(error, 'la récupération des dépôts');
            }
        },

        async getById(id) {
            try {
                const depots = API.storage.get(STORAGE_KEYS.DEPOTS) || [];
                const depot = depots.find(d => d.id == id);
                
                if (!depot) {
                    return {
                        success: false,
                        error: 'Dépôt non trouvé'
                    };
                }

                return {
                    success: true,
                    data: depot
                };
            } catch (error) {
                return API.handleError(error, 'la récupération du dépôt');
            }
        },

        async create(depotData) {
            try {
                const depots = API.storage.get(STORAGE_KEYS.DEPOTS) || [];
                
                const newDepot = {
                    id: API.generateId(depots),
                    ...depotData,
                    date_creation: new Date().toISOString(),
                    date_modification: new Date().toISOString(),
                    archived: false
                };

                depots.push(newDepot);
                API.storage.set(STORAGE_KEYS.DEPOTS, depots);

                // Mettre à jour les statistiques
                API.stats.updateStats();

                return {
                    success: true,
                    data: newDepot
                };
            } catch (error) {
                return API.handleError(error, 'la création du dépôt');
            }
        },

        async update(id, depotData) {
            try {
                const depots = API.storage.get(STORAGE_KEYS.DEPOTS) || [];
                const depotIndex = depots.findIndex(d => d.id == id);
                
                if (depotIndex === -1) {
                    return {
                        success: false,
                        error: 'Dépôt non trouvé'
                    };
                }

                // Mettre à jour le dépôt
                depots[depotIndex] = {
                    ...depots[depotIndex],
                    ...depotData,
                    date_modification: new Date().toISOString()
                };

                API.storage.set(STORAGE_KEYS.DEPOTS, depots);

                // Mettre à jour les statistiques
                API.stats.updateStats();

                return {
                    success: true,
                    data: depots[depotIndex]
                };
            } catch (error) {
                return API.handleError(error, 'la mise à jour du dépôt');
            }
        },

        async delete(id) {
            try {
                const depots = API.storage.get(STORAGE_KEYS.DEPOTS) || [];
                const depotIndex = depots.findIndex(d => d.id == id);
                
                if (depotIndex === -1) {
                    return {
                        success: false,
                        error: 'Dépôt non trouvé'
                    };
                }

                depots.splice(depotIndex, 1);
                API.storage.set(STORAGE_KEYS.DEPOTS, depots);

                // Mettre à jour les statistiques
                API.stats.updateStats();

                return {
                    success: true
                };
            } catch (error) {
                return API.handleError(error, 'la suppression du dépôt');
            }
        },

        async archive(id) {
            try {
                const depots = API.storage.get(STORAGE_KEYS.DEPOTS) || [];
                const depotIndex = depots.findIndex(d => d.id == id);
                
                if (depotIndex === -1) {
                    return {
                        success: false,
                        error: 'Dépôt non trouvé'
                    };
                }

                const depot = depots[depotIndex];
                const clients = API.storage.get(STORAGE_KEYS.CLIENTS) || [];
                const client = clients.find(c => c.id == depot.client_id);
                const statuts = API.storage.get(STORAGE_KEYS.STATUTS) || [];
                const statut = statuts.find(s => s.id == depot.status_id);

                // Créer l'entrée d'archive
                const archives = API.storage.get(STORAGE_KEYS.ARCHIVES) || [];
                const archive = {
                    id: depot.id,
                    client_id: depot.client_id,
                    client_nom: client ? `${client.prenom} ${client.nom}` : 'Client inconnu',
                    description: depot.description,
                    notes: depot.notes,
                    date_depot: depot.date_depot,
                    date_archive: new Date().toISOString().split('T')[0],
                    statut_final: statut ? statut.nom : 'Inconnu'
                };

                archives.push(archive);
                API.storage.set(STORAGE_KEYS.ARCHIVES, archives);

                // Supprimer le dépôt actif
                depots.splice(depotIndex, 1);
                API.storage.set(STORAGE_KEYS.DEPOTS, depots);

                // Mettre à jour les statistiques
                API.stats.updateStats();

                return {
                    success: true,
                    data: archive
                };
            } catch (error) {
                return API.handleError(error, 'l\'archivage du dépôt');
            }
        },

        async updateStatus(id, statusId) {
            try {
                return await this.update(id, { status_id: statusId });
            } catch (error) {
                return API.handleError(error, 'la mise à jour du statut');
            }
        }
    },

    // API des clients
    clients: {
        async getAll() {
            try {
                const clients = API.storage.get(STORAGE_KEYS.CLIENTS) || [];
                return {
                    success: true,
                    data: { clients }
                };
            } catch (error) {
                return API.handleError(error, 'la récupération des clients');
            }
        },

        async getById(id) {
            try {
                const clients = API.storage.get(STORAGE_KEYS.CLIENTS) || [];
                const client = clients.find(c => c.id == id);
                
                if (!client) {
                    return {
                        success: false,
                        error: 'Client non trouvé'
                    };
                }

                return {
                    success: true,
                    data: client
                };
            } catch (error) {
                return API.handleError(error, 'la récupération du client');
            }
        },

        async create(clientData) {
            try {
                const clients = API.storage.get(STORAGE_KEYS.CLIENTS) || [];
                
                const newClient = {
                    id: API.generateId(clients),
                    ...clientData,
                    date_creation: new Date().toISOString()
                };

                clients.push(newClient);
                API.storage.set(STORAGE_KEYS.CLIENTS, clients);

                // Mettre à jour les statistiques
                API.stats.updateStats();

                return {
                    success: true,
                    data: newClient
                };
            } catch (error) {
                return API.handleError(error, 'la création du client');
            }
        },

        async update(id, clientData) {
            try {
                const clients = API.storage.get(STORAGE_KEYS.CLIENTS) || [];
                const clientIndex = clients.findIndex(c => c.id == id);
                
                if (clientIndex === -1) {
                    return {
                        success: false,
                        error: 'Client non trouvé'
                    };
                }

                clients[clientIndex] = {
                    ...clients[clientIndex],
                    ...clientData
                };

                API.storage.set(STORAGE_KEYS.CLIENTS, clients);

                return {
                    success: true,
                    data: clients[clientIndex]
                };
            } catch (error) {
                return API.handleError(error, 'la mise à jour du client');
            }
        },

        async delete(id) {
            try {
                const clients = API.storage.get(STORAGE_KEYS.CLIENTS) || [];
                const clientIndex = clients.findIndex(c => c.id == id);
                
                if (clientIndex === -1) {
                    return {
                        success: false,
                        error: 'Client non trouvé'
                    };
                }

                // Vérifier s'il y a des dépôts associés
                const depots = API.storage.get(STORAGE_KEYS.DEPOTS) || [];
                const hasDepots = depots.some(d => d.client_id == id);
                
                if (hasDepots) {
                    return {
                        success: false,
                        error: 'Impossible de supprimer un client ayant des dépôts actifs'
                    };
                }

                clients.splice(clientIndex, 1);
                API.storage.set(STORAGE_KEYS.CLIENTS, clients);

                // Mettre à jour les statistiques
                API.stats.updateStats();

                return {
                    success: true
                };
            } catch (error) {
                return API.handleError(error, 'la suppression du client');
            }
        }
    },

    // API des statuts
    statuts: {
        async getAll() {
            try {
                const statuts = API.storage.get(STORAGE_KEYS.STATUTS) || [];
                // Trier par ordre
                statuts.sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
                return {
                    success: true,
                    data: statuts
                };
            } catch (error) {
                return API.handleError(error, 'la récupération des statuts');
            }
        },

        async create(statutData) {
            try {
                const statuts = API.storage.get(STORAGE_KEYS.STATUTS) || [];
                
                const newStatut = {
                    id: API.generateId(statuts),
                    ...statutData,
                    ordre: statuts.length + 1
                };

                statuts.push(newStatut);
                API.storage.set(STORAGE_KEYS.STATUTS, statuts);

                return {
                    success: true,
                    data: newStatut
                };
            } catch (error) {
                return API.handleError(error, 'la création du statut');
            }
        },

        async update(id, statutData) {
            try {
                const statuts = API.storage.get(STORAGE_KEYS.STATUTS) || [];
                const statutIndex = statuts.findIndex(s => s.id == id);
                
                if (statutIndex === -1) {
                    return {
                        success: false,
                        error: 'Statut non trouvé'
                    };
                }

                statuts[statutIndex] = {
                    ...statuts[statutIndex],
                    ...statutData
                };

                API.storage.set(STORAGE_KEYS.STATUTS, statuts);

                return {
                    success: true,
                    data: statuts[statutIndex]
                };
            } catch (error) {
                return API.handleError(error, 'la mise à jour du statut');
            }
        },

        async delete(id) {
            try {
                const statuts = API.storage.get(STORAGE_KEYS.STATUTS) || [];
                const statutIndex = statuts.findIndex(s => s.id == id);
                
                if (statutIndex === -1) {
                    return {
                        success: false,
                        error: 'Statut non trouvé'
                    };
                }

                // Vérifier s'il y a des dépôts avec ce statut
                const depots = API.storage.get(STORAGE_KEYS.DEPOTS) || [];
                const hasDepots = depots.some(d => d.status_id == id);
                
                if (hasDepots) {
                    return {
                        success: false,
                        error: 'Impossible de supprimer un statut utilisé par des dépôts'
                    };
                }

                statuts.splice(statutIndex, 1);
                API.storage.set(STORAGE_KEYS.STATUTS, statuts);

                return {
                    success: true
                };
            } catch (error) {
                return API.handleError(error, 'la suppression du statut');
            }
        }
    },

    // API des archives
    archives: {
        async getAll(filters = {}) {
            try {
                let archives = API.storage.get(STORAGE_KEYS.ARCHIVES) || [];
                
                // Appliquer les filtres
                if (filters.client_nom) {
                    archives = archives.filter(archive => 
                        archive.client_nom.toLowerCase().includes(filters.client_nom.toLowerCase())
                    );
                }
                if (filters.date_from) {
                    archives = archives.filter(archive => archive.date_archive >= filters.date_from);
                }
                if (filters.date_to) {
                    archives = archives.filter(archive => archive.date_archive <= filters.date_to);
                }

                return {
                    success: true,
                    data: { archives }
                };
            } catch (error) {
                return API.handleError(error, 'la récupération des archives');
            }
        },

        async getById(id) {
            try {
                const archives = API.storage.get(STORAGE_KEYS.ARCHIVES) || [];
                const archive = archives.find(a => a.id == id);
                
                if (!archive) {
                    return {
                        success: false,
                        error: 'Archive non trouvée'
                    };
                }

                return {
                    success: true,
                    data: archive
                };
            } catch (error) {
                return API.handleError(error, 'la récupération de l\'archive');
            }
        },

        async restore(id) {
            try {
                const archives = API.storage.get(STORAGE_KEYS.ARCHIVES) || [];
                const archiveIndex = archives.findIndex(a => a.id == id);
                
                if (archiveIndex === -1) {
                    return {
                        success: false,
                        error: 'Archive non trouvée'
                    };
                }

                const archive = archives[archiveIndex];
                
                // Créer un nouveau dépôt à partir de l'archive
                const depots = API.storage.get(STORAGE_KEYS.DEPOTS) || [];
                const statuts = API.storage.get(STORAGE_KEYS.STATUTS) || [];
                const premierStatut = statuts.find(s => s.ordre === 1) || statuts[0];

                const restoredDepot = {
                    id: API.generateId(depots),
                    client_id: archive.client_id,
                    status_id: premierStatut ? premierStatut.id : 1,
                    description: archive.description,
                    notes: (archive.notes || '') + '\n[Restauré depuis les archives]',
                    date_depot: new Date().toISOString().split('T')[0],
                    date_prevue: '',
                    date_creation: new Date().toISOString(),
                    date_modification: new Date().toISOString(),
                    archived: false
                };

                depots.push(restoredDepot);
                API.storage.set(STORAGE_KEYS.DEPOTS, depots);

                // Supprimer l'archive
                archives.splice(archiveIndex, 1);
                API.storage.set(STORAGE_KEYS.ARCHIVES, archives);

                // Mettre à jour les statistiques
                API.stats.updateStats();

                return {
                    success: true,
                    data: restoredDepot
                };
            } catch (error) {
                return API.handleError(error, 'la restauration de l\'archive');
            }
        },

        async delete(id) {
            try {
                const archives = API.storage.get(STORAGE_KEYS.ARCHIVES) || [];
                const archiveIndex = archives.findIndex(a => a.id == id);
                
                if (archiveIndex === -1) {
                    return {
                        success: false,
                        error: 'Archive non trouvée'
                    };
                }

                archives.splice(archiveIndex, 1);
                API.storage.set(STORAGE_KEYS.ARCHIVES, archives);

                return {
                    success: true
                };
            } catch (error) {
                return API.handleError(error, 'la suppression de l\'archive');
            }
        },

        async cleanup(olderThanDays = 365) {
            try {
                const archives = API.storage.get(STORAGE_KEYS.ARCHIVES) || [];
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
                const cutoffString = cutoffDate.toISOString().split('T')[0];

                const initialCount = archives.length;
                const filteredArchives = archives.filter(archive => 
                    archive.date_archive >= cutoffString
                );

                API.storage.set(STORAGE_KEYS.ARCHIVES, filteredArchives);
                const deletedCount = initialCount - filteredArchives.length;

                return {
                    success: true,
                    data: { deletedCount }
                };
            } catch (error) {
                return API.handleError(error, 'le nettoyage des archives');
            }
        }
    },

    // API des statistiques
    stats: {
        async getDashboard() {
            try {
                const depots = API.storage.get(STORAGE_KEYS.DEPOTS) || [];
                const clients = API.storage.get(STORAGE_KEYS.CLIENTS) || [];
                const archives = API.storage.get(STORAGE_KEYS.ARCHIVES) || [];
                const statuts = API.storage.get(STORAGE_KEYS.STATUTS) || [];

                // Calculer les statistiques
                const totalDepots = depots.length;
                const totalClients = clients.length;
                const depotsTermines = depots.filter(d => {
                    const statut = statuts.find(s => s.id == d.status_id);
                    return statut && statut.nom.toLowerCase().includes('terminé');
                }).length;
                const depotsEnAttente = totalDepots - depotsTermines;

                // Activité récente (simulation)
                const recentActivity = this.generateRecentActivity(depots, clients);

                return {
                    success: true,
                    data: {
                        totalDepots,
                        totalClients,
                        depotsTermines,
                        depotsEnAttente,
                        totalArchives: archives.length,
                        recentActivity
                    }
                };
            } catch (error) {
                return API.handleError(error, 'la récupération des statistiques');
            }
        },

        generateRecentActivity(depots, clients) {
            const activities = [];
            
            // Activités récentes basées sur les dépôts
            const recentDepots = depots
                .sort((a, b) => new Date(b.date_modification) - new Date(a.date_modification))
                .slice(0, 3);

            recentDepots.forEach(depot => {
                const client = clients.find(c => c.id == depot.client_id);
                const clientName = client ? `${client.prenom} ${client.nom}` : 'Client inconnu';
                
                activities.push({
                    icon: 'box',
                    text: `Dépôt mis à jour pour ${clientName}`,
                    date: depot.date_modification
                });
            });

            return activities;
        },

        updateStats() {
            // Cette méthode peut être utilisée pour déclencher la mise à jour des statistiques
            // dans l'interface utilisateur
            const event = new CustomEvent('statsUpdated');
            document.dispatchEvent(event);
        }
    },

    // API des paramètres
    settings: {
        async get() {
            try {
                const settings = API.storage.get(STORAGE_KEYS.SETTINGS) || {};
                return {
                    success: true,
                    data: settings
                };
            } catch (error) {
                return API.handleError(error, 'la récupération des paramètres');
            }
        },

        async update(newSettings) {
            try {
                const currentSettings = API.storage.get(STORAGE_KEYS.SETTINGS) || {};
                const updatedSettings = { ...currentSettings, ...newSettings };
                
                API.storage.set(STORAGE_KEYS.SETTINGS, updatedSettings);

                return {
                    success: true,
                    data: updatedSettings
                };
            } catch (error) {
                return API.handleError(error, 'la mise à jour des paramètres');
            }
        }
    },

    // Utilitaires d'import/export
    backup: {
        async export() {
            try {
                const data = {
                    version: API_VERSION,
                    timestamp: new Date().toISOString(),
                    depots: API.storage.get(STORAGE_KEYS.DEPOTS) || [],
                    clients: API.storage.get(STORAGE_KEYS.CLIENTS) || [],
                    statuts: API.storage.get(STORAGE_KEYS.STATUTS) || [],
                    archives: API.storage.get(STORAGE_KEYS.ARCHIVES) || [],
                    settings: API.storage.get(STORAGE_KEYS.SETTINGS) || {}
                };

                return {
                    success: true,
                    data
                };
            } catch (error) {
                return API.handleError(error, 'l\'export des données');
            }
        },

        async import(importData) {
            try {
                // Validation basique
                if (!importData || typeof importData !== 'object') {
                    return {
                        success: false,
                        error: 'Données d\'import invalides'
                    };
                }

                // Sauvegarder les données actuelles
                const backup = await this.export();
                
                try {
                    // Importer les nouvelles données
                    if (importData.depots) API.storage.set(STORAGE_KEYS.DEPOTS, importData.depots);
                    if (importData.clients) API.storage.set(STORAGE_KEYS.CLIENTS, importData.clients);
                    if (importData.statuts) API.storage.set(STORAGE_KEYS.STATUTS, importData.statuts);
                    if (importData.archives) API.storage.set(STORAGE_KEYS.ARCHIVES, importData.archives);
                    if (importData.settings) API.storage.set(STORAGE_KEYS.SETTINGS, importData.settings);

                    // Mettre à jour les statistiques
                    API.stats.updateStats();

                    return {
                        success: true,
                        data: { message: 'Import réussi' }
                    };
                } catch (importError) {
                    // Restaurer la sauvegarde en cas d'erreur
                    if (backup.success) {
                        await this.import(backup.data);
                    }
                    throw importError;
                }
            } catch (error) {
                return API.handleError(error, 'l\'import des données');
            }
        },

        async reset() {
            try {
                API.storage.clear();
                API.initDefaultData();
                API.stats.updateStats();

                return {
                    success: true,
                    data: { message: 'Données réinitialisées' }
                };
            } catch (error) {
                return API.handleError(error, 'la réinitialisation des données');
            }
        }
    }
};

// Initialisation automatique lors du chargement
document.addEventListener('DOMContentLoaded', () => {
    API.init();
});

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}