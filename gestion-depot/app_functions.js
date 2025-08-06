/**
 * Fonctions principales de l'application
 * Compatible avec votre base "client" existante
 */

// Variables globales de l'application
let currentTab = 'dashboard';
let dashboardData = {};

/**
 * Initialiser l'application
 */
async function initializeApp() {
    console.log('🚀 Initialisation de l\'application...');
    
    try {
        // Attendre que l'API soit disponible
        if (typeof API === 'undefined') {
            console.warn('⚠️ API non disponible, nouvelle tentative...');
            setTimeout(initializeApp, 1000);
            return;
        }
        
        // Initialiser les différents modules
        await initializeModules();
        
        // Charger l'onglet par défaut
        switchTab('dashboard');
        
        console.log('✅ Application initialisée avec succès');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        showNotification('Erreur lors de l\'initialisation de l\'application', 'error');
    }
}

/**
 * Initialiser les modules de l'application
 */
async function initializeModules() {
    // Les modules s'initialisent eux-mêmes via leurs propres DOMContentLoaded
    console.log('📦 Modules initialisés');
}

/**
 * Changer d'onglet
 */
function switchTab(tabName) {
    console.log(`🔄 Changement d'onglet vers: ${tabName}`);
    
    // Masquer tous les contenus d'onglets
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.style.display = 'none';
    });
    
    // Désactiver tous les boutons d'onglets
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Afficher le contenu de l'onglet sélectionné
    const selectedTabContent = document.getElementById(`${tabName}-tab`);
    if (selectedTabContent) {
        selectedTabContent.style.display = 'block';
    }
    
    // Activer le bouton de l'onglet sélectionné
    const selectedTabButton = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
    if (selectedTabButton) {
        selectedTabButton.classList.add('active');
    }
    
    // Charger le contenu spécifique à l'onglet
    loadTabContent(tabName);
    
    currentTab = tabName;
}

/**
 * Charger le contenu d'un onglet
 */
async function loadTabContent(tabName) {
    console.log(`📋 Chargement du contenu pour l'onglet: ${tabName}`);
    
    try {
        switch (tabName) {
            case 'dashboard':
                await loadDashboardData();
                break;
            case 'depots':
                if (typeof loadDepots === 'function') {
                    await loadDepots();
                }
                break;
            case 'clients':
                if (typeof loadClients === 'function') {
                    await loadClients();
                }
                break;
            default:
                console.log(`Onglet ${tabName} sans contenu spécifique à charger`);
        }
    } catch (error) {
        console.error(`❌ Erreur lors du chargement de l'onglet ${tabName}:`, error);
    }
}

/**
 * Charger les données du tableau de bord
 */
async function loadDashboardData() {
    console.log('📊 Chargement des données du tableau de bord...');
    
    try {
        // Utiliser les statistiques basiques si l'API complète n'est pas disponible
        let response;
        
        if (API.stats && API.stats.getDashboard) {
            response = await API.stats.getDashboard();
        } else if (API.stats && API.stats.getBasicStats) {
            response = await API.stats.getBasicStats();
        } else {
            // Fallback : récupérer manuellement les stats
            response = await getManualStats();
        }
        
        if (response.success) {
            dashboardData = response.data;
            displayDashboardData(dashboardData);
            console.log('✅ Données du tableau de bord chargées');
        } else {
            throw new Error(response.error || 'Erreur inconnue');
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement du tableau de bord:', error);
        
        // Afficher des données par défaut en cas d'erreur
        const defaultData = {
            totalClients: 0,
            totalDepots: 0,
            depotsEnAttente: 0,
            depotsEnCours: 0,
            depotsPrets: 0
        };
        
        displayDashboardData(defaultData);
        showNotification('Erreur lors du chargement des statistiques', 'warning');
    }
}

/**
 * Récupérer les statistiques manuellement
 */
async function getManualStats() {
    try {
        const clientsResponse = await API.clients.getAll();
        
        const stats = {
            totalClients: clientsResponse.success ? clientsResponse.total || 0 : 0,
            totalDepots: 0, // Sera mis à jour quand la table depots existera
            depotsEnAttente: 0,
            depotsEnCours: 0,
            depotsPrets: 0,
            depotsRecuperes: 0
        };
        
        return {
            success: true,
            data: stats
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Afficher les données du tableau de bord
 */
function displayDashboardData(data) {
    console.log('🖼️ Affichage des données du tableau de bord:', data);
    
    // Mettre à jour les cartes de statistiques
    updateStatCard('total-clients', data.totalClients || 0, 'Clients');
    updateStatCard('total-depots', data.totalDepots || 0, 'Dépôts');
    updateStatCard('depots-en-attente', data.depotsEnAttente || 0, 'En attente');
    updateStatCard('depots-en-cours', data.depotsEnCours || 0, 'En cours');
    updateStatCard('depots-prets', data.depotsPrets || 0, 'Prêts');
    
    // Afficher des informations supplémentaires si disponibles
    if (data.clientsAvecEmail !== undefined) {
        console.log(`📧 Clients avec email: ${data.clientsAvecEmail}`);
    }
    if (data.clientsAvecTelephone !== undefined) {
        console.log(`📱 Clients avec téléphone: ${data.clientsAvecTelephone}`);
    }
}

/**
 * Mettre à jour une carte de statistique
 */
function updateStatCard(elementId, value, label) {
    const element = document.getElementById(elementId);
    
    if (element) {
        // Si c'est un élément avec une classe stat-number
        const numberElement = element.querySelector('.stat-number');
        if (numberElement) {
            numberElement.textContent = value;
        } else {
            element.textContent = value;
        }
    } else {
        console.warn(`⚠️ Élément ${elementId} non trouvé pour afficher: ${label} = ${value}`);
    }
}

/**
 * Actualiser le tableau de bord
 */
async function refreshDashboard() {
    console.log('🔄 Actualisation du tableau de bord...');
    await loadDashboardData();
    showNotification('Tableau de bord actualisé', 'success');
}

/**
 * Fonctions de compatibilité pour les anciens appels
 */

// Fonction pour afficher la modale de création de client
function showCreateClientModal() {
    console.log('📝 Appel de showCreateClientModal');
    // Cette fonction existe dans client-functions.js
    // On vérifie qu'elle est bien chargée
    if (typeof window.showCreateClientModal === 'function') {
        window.showCreateClientModal();
    } else {
        console.warn('⚠️ Fonction showCreateClientModal non trouvée dans client-functions.js');
        showNotification('Fonction de création de client en cours de chargement...', 'info');
        
        // Essayer de la charger après un délai
        setTimeout(() => {
            if (typeof window.showCreateClientModal === 'function') {
                window.showCreateClientModal();
            }
        }, 1000);
    }
}

// Fonction pour actualiser les clients
function refreshClients() {
    console.log('🔄 Appel de refreshClients');
    if (typeof window.refreshClients === 'function') {
        window.refreshClients();
    } else if (typeof loadClients === 'function') {
        loadClients();
        showNotification('Liste des clients actualisée', 'success');
    } else {
        console.warn('⚠️ Fonction refreshClients non trouvée');
        showNotification('Fonction d\'actualisation en cours de chargement...', 'info');
    }
}

// Fonction pour charger le tableau des clients
function loadClientsTable() {
    console.log('📋 Appel de loadClientsTable');
    if (typeof loadClients === 'function') {
        loadClients();
    } else {
        console.warn('⚠️ Fonction loadClients non disponible');
    }
}

/**
 * Fonction utilitaire pour afficher les notifications
 */
function showNotification(message, type = 'info') {
    console.log(`📢 Notification [${type}]: ${message}`);
    
    // Créer ou utiliser la notification existante
    let notification = document.getElementById('app-notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'app-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 350px;
            word-wrap: break-word;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: all 0.3s ease;
        `;
        document.body.appendChild(notification);
    }
    
    // Définir la couleur selon le type
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;
    notification.style.display = 'block';
    notification.style.opacity = '1';
    
    // Masquer après 4 secondes
    setTimeout(() => {
        if (notification) {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification && notification.style.opacity === '0') {
                    notification.style.display = 'none';
                }
            }, 300);
        }
    }, 4000);
}

/**
 * Gestion des erreurs globales
 */
window.addEventListener('error', function(event) {
    console.error('❌ Erreur JavaScript globale:', event.error);
    showNotification('Une erreur est survenue dans l\'application', 'error');
});

/**
 * Gestion des erreurs de promesses non capturées
 */
window.addEventListener('unhandledrejection', function(event) {
    console.error('❌ Promesse rejetée non gérée:', event.reason);
    showNotification('Erreur de connexion ou de traitement', 'error');
});

// Initialiser l'application au chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM chargé, initialisation de l\'application...');
    setTimeout(initializeApp, 500); // Petit délai pour s'assurer que tout est chargé
});

// Rendre les fonctions disponibles globalement
window.switchTab = switchTab;
window.showCreateClientModal = showCreateClientModal;
window.refreshClients = refreshClients;
window.refreshDashboard = refreshDashboard;
window.loadClientsTable = loadClientsTable;
window.showNotification = showNotification;