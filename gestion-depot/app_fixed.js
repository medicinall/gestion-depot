// Variables globales
let currentTab = 'dashboard';
let clients = [];
let statuts = [];

console.log('🚀 Chargement de app_fixed.js...');

// Initialisation de l'application avec gestion d'erreurs renforcée
document.addEventListener("DOMContentLoaded", async () => {
    console.log('📱 DOM Content Loaded - Initialisation...');
    
    try {
        hideLoadingOverlay();
        
        console.log('✅ Loading overlay masqué');
        
        // Vérifier que l'API est disponible
        if (typeof API === 'undefined') {
            console.error('❌ API non disponible! Vérifiez que api.js ou api_mysql.js est chargé AVANT app.js');
            showNotificationSafe('API non disponible. Vérifiez la configuration.', 'error');
            return;
        }
        
        console.log('✅ API disponible:', typeof API);
        
        // Initialiser l'application directement (sans authentification)
        await initializeApp();
        console.log('✅ Application initialisée');
        
        setupEventListeners();
        console.log('✅ Event listeners configurés');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        showNotificationSafe('Erreur lors de l\'initialisation: ' + error.message, 'error');
    }
});

// Configuration des écouteurs d'événements avec vérifications
const setupEventListeners = () => {
    console.log('🔧 Configuration des event listeners...');
    
    try {
        // Navigation avec vérification
        const navItems = document.querySelectorAll('.nav-item');
        console.log(`📱 Éléments de navigation trouvés: ${navItems.length}`);
        
        if (navItems.length === 0) {
            console.error('❌ Aucun élément .nav-item trouvé dans le DOM!');
            return;
        }
        
        navItems.forEach((item, index) => {
            const tab = item.dataset.tab;
            console.log(`📌 Configuration navigation ${index + 1}: ${tab}`);
            
            // Supprimer les anciens listeners pour éviter les doublons
            item.removeEventListener('click', handleNavClick);
            
            // Ajouter le nouvel event listener
            item.addEventListener('click', handleNavClick);
        });
        
        // Formulaire de création de dépôt
        const createDepotForm = document.getElementById('create-depot-form');
        if (createDepotForm) {
            createDepotForm.removeEventListener('submit', handleCreateDepot);
            createDepotForm.addEventListener('submit', handleCreateDepot);
            console.log('✅ Formulaire dépôt configuré');
        } else {
            console.warn('⚠️ Formulaire create-depot-form non trouvé');
        }
        
        // Recherche en temps réel
        setupSearchListeners();
        console.log('✅ Listeners de recherche configurés');

        // Écouteur pour les mises à jour de statistiques
        document.addEventListener('statsUpdated', () => {
            console.log('📊 Événement statsUpdated reçu');
            loadDashboardData();
        });
        
        console.log('✅ Tous les event listeners configurés avec succès');
        
    } catch (error) {
        console.error('❌ Erreur lors de la configuration des event listeners:', error);
        showNotificationSafe('Erreur de configuration: ' + error.message, 'error');
    }
};

// Gestionnaire de navigation sécurisé
const handleNavClick = async (e) => {
    try {
        e.preventDefault();
        const tab = e.currentTarget.dataset.tab;
        console.log(`🔄 Changement vers l'onglet: ${tab}`);
        
        if (!tab) {
            console.error('❌ Aucun attribut data-tab trouvé');
            return;
        }
        
        await switchTab(tab);
        console.log(`✅ Changement vers ${tab} réussi`);
        
    } catch (error) {
        console.error('❌ Erreur lors du changement d\'onglet:', error);
        showNotificationSafe('Erreur de navigation: ' + error.message, 'error');
    }
};

// Initialisation de l'application avec gestion d'erreurs
const initializeApp = async () => {
    console.log('🔧 Initialisation de l\'application...');
    
    try {
        showLoadingOverlay();
        
        // Charger les données de base avec gestion d'erreurs individuelles
        const promises = [
            loadClients().catch(e => console.error('Erreur chargement clients:', e)),
            loadStatuts().catch(e => console.error('Erreur chargement statuts:', e)),
            loadDashboardData().catch(e => console.error('Erreur chargement dashboard:', e)),
        ];
        
        await Promise.allSettled(promises);
        console.log('✅ Données de base chargées');
        
        // Mettre à jour l'interface utilisateur
        populateClientSelects();
        populateStatusSelects();
        console.log('✅ Sélecteurs populés');
        
        // Charger le contenu de l'onglet actuel
        await loadTabContent(currentTab);
        console.log('✅ Contenu onglet chargé');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        showNotificationSafe('Erreur lors du chargement des données: ' + error.message, 'error');
    } finally {
        hideLoadingOverlay();
    }
};

// Chargement des clients avec gestion d'erreurs
const loadClients = async () => {
    try {
        console.log('📥 Chargement des clients...');
        const response = await API.clients.getAll();
        if (response.success) {
            clients = response.data.clients || [];
            console.log(`✅ ${clients.length} clients chargés`);
        } else {
            console.error('❌ Erreur réponse clients:', response.error);
            throw new Error(response.error || 'Erreur lors du chargement des clients');
        }
    } catch (error) {
        console.error('❌ Erreur lors du chargement des clients:', error);
        clients = []; // Fallback sur tableau vide
        throw error;
    }
};

// Chargement des statuts avec gestion d'erreurs
const loadStatuts = async () => {
    try {
        console.log('📥 Chargement des statuts...');
        const response = await API.statuts.getAll();
        if (response.success) {
            statuts = response.data || [];
            console.log(`✅ ${statuts.length} statuts chargés`);
        } else {
            console.error('❌ Erreur réponse statuts:', response.error);
            throw new Error(response.error || 'Erreur lors du chargement des statuts');
        }
    } catch (error) {
        console.error('❌ Erreur lors du chargement des statuts:', error);
        statuts = []; // Fallback sur tableau vide
        throw error;
    }
};

// Chargement des données du tableau de bord avec gestion d'erreurs
const loadDashboardData = async () => {
    try {
        console.log('📊 Chargement du tableau de bord...');
        const response = await API.stats.getDashboard();
        if (response.success) {
            updateDashboardStats(response.data);
            console.log('✅ Statistiques du tableau de bord mises à jour');
        } else {
            console.error('❌ Erreur réponse dashboard:', response.error);
            // Ne pas jeter d'erreur pour le dashboard, juste loguer
        }
    } catch (error) {
        console.error('❌ Erreur lors du chargement du tableau de bord:', error);
        // Afficher des statistiques par défaut en cas d'erreur
        updateDashboardStats({
            totalDepots: 0,
            totalClients: clients.length,
            depotsTermines: 0,
            depotsEnAttente: 0,
            recentActivity: []
        });
    }
};

// Population des sélecteurs de clients avec vérifications
const populateClientSelects = () => {
    try {
        console.log('👥 Population des sélecteurs clients...');
        const selects = document.querySelectorAll('select[name="client_id"], #client-filter, #archive-client-filter');
        console.log(`📋 ${selects.length} sélecteurs clients trouvés`);
        
        selects.forEach((select, index) => {
            // Garder la première option (placeholder)
            const firstOption = select.querySelector('option[value=""]');
            select.innerHTML = '';
            if (firstOption) {
                select.appendChild(firstOption);
            }
            
            clients.forEach(client => {
                const option = document.createElement('option');
                option.value = client.id;
                option.textContent = `${client.prenom} ${client.nom}`.trim();
                select.appendChild(option);
            });
            
            console.log(`✅ Sélecteur ${index + 1} populé avec ${clients.length} clients`);
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la population des sélecteurs clients:', error);
    }
};

// Population des sélecteurs de statuts avec vérifications
const populateStatusSelects = () => {
    try {
        console.log('🏷️ Population des sélecteurs statuts...');
        const selects = document.querySelectorAll('select[name="status_id"], #status-filter');
        console.log(`📋 ${selects.length} sélecteurs statuts trouvés`);
        
        selects.forEach((select, index) => {
            // Garder la première option (placeholder)
            const firstOption = select.querySelector('option[value=""]');
            select.innerHTML = '';
            if (firstOption) {
                select.appendChild(firstOption);
            }
            
            statuts.forEach(status => {
                const option = document.createElement('option');
                option.value = status.id;
                option.textContent = status.nom;
                select.appendChild(option);
            });
            
            console.log(`✅ Sélecteur ${index + 1} populé avec ${statuts.length} statuts`);
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la population des sélecteurs statuts:', error);
    }
};

// Changement d'onglet avec gestion d'erreurs
const switchTab = async (tabName) => {
    try {
        console.log(`🔄 Changement vers l'onglet: ${tabName}`);
        
        // Mettre à jour la navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        } else {
            console.error(`❌ Onglet [data-tab="${tabName}"] non trouvé`);
            return;
        }
        
        // Mettre à jour le contenu
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const contentTab = document.getElementById(`${tabName}-tab`);
        if (contentTab) {
            contentTab.classList.add('active');
        } else {
            console.error(`❌ Contenu #${tabName}-tab non trouvé`);
            return;
        }
        
        currentTab = tabName;
        
        // Charger le contenu de l'onglet
        await loadTabContent(tabName);
        console.log(`✅ Changement vers ${tabName} terminé`);
        
    } catch (error) {
        console.error(`❌ Erreur lors du changement vers ${tabName}:`, error);
        showNotificationSafe(`Erreur lors du changement d'onglet: ${error.message}`, 'error');
    }
};

// Chargement du contenu d'un onglet avec gestion d'erreurs
const loadTabContent = async (tabName) => {
    try {
        console.log(`📄 Chargement du contenu pour: ${tabName}`);
        
        switch (tabName) {
            case 'dashboard':
                await loadDashboardData();
                break;
            case 'depots':
                if (typeof loadDepots === 'function') {
                    await loadDepots();
                } else {
                    console.warn('⚠️ Fonction loadDepots non disponible');
                }
                break;
            case 'clients':
                if (typeof loadClientsTable === 'function') {
                    await loadClientsTable();
                } else {
                    console.warn('⚠️ Fonction loadClientsTable non disponible');
                }
                break;
            case 'archives':
                if (typeof loadArchives === 'function') {
                    await loadArchives();
                } else {
                    console.warn('⚠️ Fonction loadArchives non disponible');
                }
                break;
            case 'statuts':
                if (typeof loadStatutsTable === 'function') {
                    await loadStatutsTable();
                } else {
                    console.warn('⚠️ Fonction loadStatutsTable non disponible');
                }
                break;
            case 'admin':
                if (typeof loadAdminData === 'function') {
                    await loadAdminData();
                } else {
                    console.warn('⚠️ Fonction loadAdminData non disponible');
                }
                break;
            default:
                console.warn(`⚠️ Onglet inconnu: ${tabName}`);
        }
        
        console.log(`✅ Contenu ${tabName} chargé`);
        
    } catch (error) {
        console.error(`❌ Erreur lors du chargement de l'onglet ${tabName}:`, error);
        showNotificationSafe(`Erreur lors du chargement: ${error.message}`, 'error');
    }
};

// Mise à jour des statistiques du tableau de bord
const updateDashboardStats = (stats) => {
    try {
        console.log('📊 Mise à jour des statistiques:', stats);
        
        const elements = {
            'total-depots': stats.totalDepots || 0,
            'total-clients': stats.totalClients || 0,
            'depots-termines': stats.depotsTermines || 0,
            'depots-en-attente': stats.depotsEnAttente || 0
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                console.log(`✅ ${id}: ${value}`);
            } else {
                console.warn(`⚠️ Élément #${id} non trouvé`);
            }
        });
        
        // Mettre à jour la légende des couleurs
        updateColorLegend();
        
        // Mettre à jour l'activité récente
        updateRecentActivity(stats.recentActivity || []);
        
        console.log('✅ Statistiques mises à jour');
        
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour des statistiques:', error);
    }
};

// Mise à jour de la légende des couleurs
const updateColorLegend = () => {
    try {
        const legendContainer = document.getElementById('color-legend');
        if (!legendContainer) {
            console.warn('⚠️ Container color-legend non trouvé');
            return;
        }
        
        legendContainer.innerHTML = '';
        
        statuts.forEach(status => {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            legendItem.innerHTML = `
                <div class="legend-color" style="background-color: ${status.couleur_hex}"></div>
                <div class="legend-text">
                    <div class="legend-name">${status.nom}</div>
                    <div class="legend-action">${status.action || 'Aucune action'}</div>
                </div>
            `;
            legendContainer.appendChild(legendItem);
        });
        
        console.log(`✅ Légende mise à jour avec ${statuts.length} statuts`);
        
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour de la légende:', error);
    }
};

// Mise à jour de l'activité récente
const updateRecentActivity = (activities) => {
    try {
        const activityContainer = document.getElementById('recent-activity');
        if (!activityContainer) {
            console.warn('⚠️ Container recent-activity non trouvé');
            return;
        }
        
        if (activities.length === 0) {
            activityContainer.innerHTML = '<p class="text-muted">Aucune activité récente</p>';
            return;
        }
        
        activityContainer.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-${activity.icon || 'info-circle'}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-text">${activity.text}</div>
                    <div class="activity-time">${formatDate(activity.date)}</div>
                </div>
            </div>
        `).join('');
        
        console.log(`✅ Activité récente mise à jour avec ${activities.length} éléments`);
        
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour de l\'activité récente:', error);
    }
};

// Configuration des écouteurs de recherche
const setupSearchListeners = () => {
    try {
        const searchInputs = [
            { id: 'depot-search', handler: handleDepotSearch },
            { id: 'client-search', handler: handleClientSearch },
            { id: 'archive-search', handler: handleArchiveSearch },
        ];
        
        searchInputs.forEach(({ id, handler }) => {
            const input = document.getElementById(id);
            if (input) {
                let timeout;
                input.addEventListener('input', (e) => {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        if (typeof handler === 'function') {
                            handler(e.target.value);
                        }
                    }, 300);
                });
                console.log(`✅ Search listener configuré pour #${id}`);
            }
        });

        // Écouteurs pour les filtres
        const filterSelects = [
            { id: 'client-filter', handler: applyDepotFilters },
            { id: 'status-filter', handler: applyDepotFilters },
            { id: 'archive-client-filter', handler: handleArchiveSearch }
        ];

        filterSelects.forEach(({ id, handler }) => {
            const select = document.getElementById(id);
            if (select) {
                select.addEventListener('change', () => {
                    if (typeof handler === 'function') {
                        handler();
                    }
                });
                console.log(`✅ Filter listener configuré pour #${id}`);
            }
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la configuration des listeners de recherche:', error);
    }
};

// Gestion de la création de dépôt avec gestion d'erreurs
const handleCreateDepot = async (e) => {
    try {
        e.preventDefault();
        console.log('📝 Création d\'un nouveau dépôt...');
        
        const formData = new FormData(e.target);
        const depotData = {
            client_id: parseInt(formData.get('client_id')),
            status_id: parseInt(formData.get('status_id')),
            description: formData.get('description'),
            notes: formData.get('notes'),
        };
        
        // Dates optionnelles
        if (formData.get('date_depot')) {
            depotData.date_depot = formData.get('date_depot');
        }
        if (formData.get('date_prevue')) {
            depotData.date_prevue = formData.get('date_prevue');
        }
        
        // Validation basique
        if (!depotData.client_id || !depotData.status_id || !depotData.description) {
            throw new Error('Veuillez remplir tous les champs obligatoires');
        }
        
        console.log('📤 Envoi des données:', depotData);
        
        const response = await API.depots.create(depotData);
        if (response.success) {
            showNotificationSafe('Dépôt créé avec succès', 'success');
            resetDepotForm();
            // Recharger les données si on est sur l'onglet dépôts
            if (currentTab === 'depots' && typeof loadDepots === 'function') {
                await loadDepots();
            }
            // Mettre à jour le tableau de bord
            await loadDashboardData();
            console.log('✅ Dépôt créé avec succès');
        } else {
            throw new Error(response.error || 'Erreur lors de la création');
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de la création du dépôt:', error);
        showNotificationSafe('Erreur: ' + error.message, 'error');
    }
};

// Réinitialisation du formulaire de dépôt
const resetDepotForm = () => {
    try {
        const form = document.getElementById('create-depot-form');
        if (form) {
            form.reset();
            // Définir la date du jour par défaut
            const dateInput = document.getElementById('depot-date');
            if (dateInput) {
                dateInput.value = new Date().toISOString().split('T')[0];
            }
            console.log('✅ Formulaire réinitialisé');
        }
    } catch (error) {
        console.error('❌ Erreur lors de la réinitialisation du formulaire:', error);
    }
};

// Fonctions d'affichage sécurisées
const showLoadingOverlay = () => {
    try {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    } catch (error) {
        console.error('❌ Erreur showLoadingOverlay:', error);
    }
};

const hideLoadingOverlay = () => {
    try {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    } catch (error) {
        console.error('❌ Erreur hideLoadingOverlay:', error);
    }
};

// Système de notifications sécurisé
const showNotificationSafe = (message, type = 'info') => {
    try {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            // Fallback si showNotification n'est pas disponible
            console.log(`[${type.toUpperCase()}] ${message}`);
            alert(`${message}`);
        }
    } catch (error) {
        console.error('❌ Erreur showNotificationSafe:', error);
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
};

// Fonction de rafraîchissement globale
const refreshData = async () => {
    try {
        console.log('🔄 Rafraîchissement des données...');
        showLoadingOverlay();
        showNotificationSafe('Actualisation des données...', 'info');
        
        await initializeApp();
        
        showNotificationSafe('Données actualisées avec succès', 'success');
        console.log('✅ Rafraîchissement terminé');
    } catch (error) {
        console.error('❌ Erreur lors du rafraîchissement:', error);
        showNotificationSafe('Erreur lors de l\'actualisation: ' + error.message, 'error');
    } finally {
        hideLoadingOverlay();
    }
};

// Fonctions utilitaires
const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('❌ Erreur formatage date:', error);
        return dateString;
    }
};

const formatDateShort = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    } catch (error) {
        console.error('❌ Erreur formatage date courte:', error);
        return dateString;
    }
};

// Fonctions placeholders avec vérifications
const handleDepotSearch = (searchTerm) => {
    if (typeof applyDepotFilters === 'function') {
        applyDepotFilters();
    } else {
        console.warn('⚠️ Fonction applyDepotFilters non disponible');
    }
};

const handleClientSearch = (searchTerm) => {
    if (typeof filterClients === 'function') {
        filterClients();
    } else {
        console.warn('⚠️ Fonction filterClients non disponible');
    }
};

const handleArchiveSearch = (searchTerm) => {
    if (typeof filterArchives === 'function') {
        filterArchives();
    } else {
        console.warn('⚠️ Fonction filterArchives non disponible');
    }
};

const applyDepotFilters = () => {
    if (typeof filterDepots === 'function') {
        filterDepots();
    } else {
        console.warn('⚠️ Fonction filterDepots non disponible');
    }
};

// Initialisation de la date du jour pour le formulaire de dépôt
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const dateInput = document.getElementById('depot-date');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
            console.log('✅ Date du jour définie dans le formulaire');
        }
    }, 1000);
});

// Export des fonctions globales pour utilisation dans d'autres fichiers
window.API = window.API || {};
window.showNotification = window.showNotification || showNotificationSafe;
window.showModal = window.showModal || (() => console.warn('showModal non disponible'));
window.closeModal = window.closeModal || (() => console.warn('closeModal non disponible'));
window.showLoadingOverlay = showLoadingOverlay;
window.hideLoadingOverlay = hideLoadingOverlay;
window.formatDate = formatDate;
window.formatDateShort = formatDateShort;
window.refreshData = refreshData;
window.switchTab = switchTab;
window.clients = clients;
window.statuts = statuts;

console.log('✅ app_fixed.js chargé avec succès');

// Test automatique après chargement
setTimeout(() => {
    console.log('🧪 Test automatique des fonctions principales...');
    console.log('- API disponible:', typeof API !== 'undefined');
    console.log('- switchTab disponible:', typeof switchTab === 'function');
    console.log('- Éléments navigation:', document.querySelectorAll('.nav-item').length);
    console.log('- Formulaire dépôt:', !!document.getElementById('create-depot-form'));
}, 2000);