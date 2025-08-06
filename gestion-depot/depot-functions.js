/**
 * Fonctions JavaScript pour la gestion des dépôts
 * Compatible avec votre base "client" existante
 * VERSION SANS CONFLITS
 */

// Variables globales pour les dépôts (éviter les conflits)
let depotsListData = [];
let statutsListData = [];
let currentEditingDepotData = null;

/**
 * Initialiser le module dépôts
 */
async function initializeDepots() {
    console.log('🔄 Initialisation du module dépôts...');
    
    try {
        // Charger les statuts d'abord
        await loadStatuts();
        
        // Charger les dépôts
        await loadDepots();
        
        // Initialiser la recherche
        initializeDepotSearch();
        
        console.log('✅ Module dépôts initialisé');
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation des dépôts:', error);
    }
}

/**
 * Charger tous les statuts
 */
async function loadStatuts() {
    try {
        const response = await API.statuts.getAll();
        
        if (response.success) {
            statutsListData = response.data;
            console.log(`✅ ${statutsListData.length} statuts chargés`);
        } else {
            console.warn('⚠️ Erreur lors du chargement des statuts, utilisation des statuts par défaut');
            // Statuts par défaut si la table n'existe pas encore
            statutsListData = [
                {id: 1, nom: 'En attente', couleur_hex: '#ffc107'},
                {id: 2, nom: 'En cours', couleur_hex: '#17a2b8'},
                {id: 3, nom: 'Prêt', couleur_hex: '#28a745'},
                {id: 4, nom: 'Récupéré', couleur_hex: '#6c757d'},
                {id: 5, nom: 'Abandonné', couleur_hex: '#dc3545'}
            ];
        }
    } catch (error) {
        console.error('❌ Erreur lors du chargement des statuts:', error);
        // Utiliser les statuts par défaut en cas d'erreur
        statutsListData = [
            {id: 1, nom: 'En attente', couleur_hex: '#ffc107'},
            {id: 2, nom: 'En cours', couleur_hex: '#17a2b8'},
            {id: 3, nom: 'Prêt', couleur_hex: '#28a745'},
            {id: 4, nom: 'Récupéré', couleur_hex: '#6c757d'},
            {id: 5, nom: 'Abandonné', couleur_hex: '#dc3545'}
        ];
    }
}

/**
 * Charger tous les dépôts
 */
async function loadDepots() {
    try {
        console.log('📋 Chargement des dépôts...');
        
        // Pour l'instant, créer des dépôts de démonstration
        // Une fois que vous aurez la table depots, on utilisera l'API
        if (typeof API.depots !== 'undefined' && API.depots.getAll) {
            const response = await API.depots.getAll();
            
            if (response.success) {
                depotsListData = response.data;
                displayDepots(depotsListData);
                console.log(`✅ ${depotsListData.length} dépôts chargés`);
                return;
            }
        }
        
        // Dépôts de démonstration si la table n'existe pas encore
        console.log('ℹ️ Table dépôts non encore créée, affichage de données de test');
        depotsListData = [
            {
                id: 1,
                client_nom: 'Jean Dupont',
                description: 'Ordinateur portable ne démarre plus',
                statut_nom: 'En attente',
                statut_couleur: '#ffc107',
                date_depot: '2025-01-01',
                date_prevue: '2025-01-05'
            },
            {
                id: 2,
                client_nom: 'Marie Martin',
                description: 'Smartphone écran cassé',
                statut_nom: 'En cours',
                statut_couleur: '#17a2b8',
                date_depot: '2024-12-30',
                date_prevue: '2025-01-03'
            }
        ];
        
        displayDepots(depotsListData);
        console.log(`✅ ${depotsListData.length} dépôts de test affichés`);
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des dépôts:', error);
        displayDepots([]);
    }
}

/**
 * Afficher les dépôts dans le tableau
 */
function displayDepots(depotsToDisplay) {
    const tbody = document.getElementById('depots-tbody');
    
    if (!tbody) {
        console.warn('⚠️ Élément depots-tbody non trouvé');
        return;
    }
    
    if (!depotsToDisplay || depotsToDisplay.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Aucun dépôt trouvé</td></tr>';
        return;
    }
    
    tbody.innerHTML = depotsToDisplay.map(depot => {
        const statutColor = depot.statut_couleur || '#007bff';
        const statutNom = depot.statut_nom || 'Non défini';
        
        return `
            <tr>
                <td>${depot.id}</td>
                <td>${depot.client_nom || 'Client inconnu'}</td>
                <td>${depot.description || ''}</td>
                <td>
                    <span class="badge" style="background-color: ${statutColor}">
                        ${statutNom}
                    </span>
                </td>
                <td>${formatDate(depot.date_depot)}</td>
                <td>${formatDate(depot.date_prevue)}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editDepot(${depot.id})" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-info" onclick="viewDepot(${depot.id})" title="Voir détails">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="generatePDF(${depot.id})" title="Générer PDF">
                        <i class="fas fa-file-pdf"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteDepot(${depot.id})" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Filtrer les dépôts
 */
function filterDepots(filterType = 'all') {
    console.log(`🔍 Filtrage des dépôts: ${filterType}`);
    
    let filteredDepots = [...depotsListData];
    
    switch (filterType) {
        case 'en_attente':
            filteredDepots = depotsListData.filter(depot => depot.statut_nom === 'En attente');
            break;
        case 'en_cours':
            filteredDepots = depotsListData.filter(depot => depot.statut_nom === 'En cours');
            break;
        case 'pret':
            filteredDepots = depotsListData.filter(depot => depot.statut_nom === 'Prêt');
            break;
        case 'recupere':
            filteredDepots = depotsListData.filter(depot => depot.statut_nom === 'Récupéré');
            break;
        case 'all':
        default:
            filteredDepots = [...depotsListData];
            break;
    }
    
    displayDepots(filteredDepots);
    console.log(`📊 ${filteredDepots.length} dépôts affichés après filtrage`);
}

/**
 * Initialiser la recherche de dépôts
 */
function initializeDepotSearch() {
    const searchInput = document.getElementById('depot-search');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            if (searchTerm === '') {
                displayDepots(depotsListData);
            } else {
                const filteredDepots = depotsListData.filter(depot => 
                    (depot.client_nom && depot.client_nom.toLowerCase().includes(searchTerm)) ||
                    (depot.description && depot.description.toLowerCase().includes(searchTerm)) ||
                    (depot.statut_nom && depot.statut_nom.toLowerCase().includes(searchTerm))
                );
                
                displayDepots(filteredDepots);
            }
        });
    }
}

/**
 * Afficher la modale de création de dépôt
 */
function showCreateDepotModal() {
    console.log('📝 Ouverture de la modale de création de dépôt');
    currentEditingDepotData = null;
    
    // Réinitialiser le formulaire
    const form = document.getElementById('depot-form');
    if (form) {
        form.reset();
    }
    
    // Mettre à jour le titre de la modale
    const modalTitle = document.getElementById('depot-modal-title');
    if (modalTitle) {
        modalTitle.textContent = 'Nouveau dépôt';
    }
    
    // Remplir la liste des clients
    populateClientSelect();
    
    // Remplir la liste des statuts
    populateStatutSelect();
    
    // Afficher la modale
    const modal = document.getElementById('depot-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

/**
 * Remplir la liste déroulante des clients
 */
async function populateClientSelect() {
    const select = document.getElementById('depot-client-id');
    
    if (!select) return;
    
    try {
        const response = await API.clients.getAll();
        
        if (response.success) {
            select.innerHTML = '<option value="">Sélectionner un client...</option>';
            
            response.data.forEach(client => {
                const option = document.createElement('option');
                option.value = client.id;
                option.textContent = `${client.prenom} ${client.nom}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erreur lors du chargement des clients:', error);
    }
}

/**
 * Remplir la liste déroulante des statuts
 */
function populateStatutSelect() {
    const select = document.getElementById('depot-status-id');
    
    if (!select) return;
    
    select.innerHTML = '<option value="">Sélectionner un statut...</option>';
    
    statutsListData.forEach(statut => {
        const option = document.createElement('option');
        option.value = statut.id;
        option.textContent = statut.nom;
        select.appendChild(option);
    });
}

/**
 * Modifier un dépôt
 */
function editDepot(depotId) {
    console.log(`✏️ Modification du dépôt ${depotId}`);
    // À implémenter quand la table depots sera créée
    showNotification('Fonction de modification des dépôts en cours de développement', 'info');
}

/**
 * Voir les détails d'un dépôt
 */
function viewDepot(depotId) {
    console.log(`👁️ Visualisation du dépôt ${depotId}`);
    const depot = depotsListData.find(d => d.id === depotId);
    
    if (depot) {
        const details = `
Détails du dépôt #${depot.id}:
─────────────────────────
Client: ${depot.client_nom}
Description: ${depot.description}
Statut: ${depot.statut_nom}
Date de dépôt: ${formatDate(depot.date_depot)}
Date prévue: ${formatDate(depot.date_prevue)}
        `;
        
        alert(details);
    }
}

/**
 * Générer un PDF pour un dépôt
 */
function generatePDF(depotId) {
    console.log(`📄 Génération PDF pour le dépôt ${depotId}`);
    // À implémenter quand la génération PDF sera prête
    showNotification('Génération PDF en cours de développement', 'info');
}

/**
 * Supprimer un dépôt
 */
function deleteDepot(depotId) {
    console.log(`🗑️ Suppression du dépôt ${depotId}`);
    
    const depot = depotsListData.find(d => d.id === depotId);
    if (!depot) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer le dépôt #${depotId} ?\n\nCette action est irréversible.`)) {
        // À implémenter quand l'API depots sera prête
        showNotification('Fonction de suppression des dépôts en cours de développement', 'info');
    }
}

/**
 * Fermer la modale dépôt
 */
function closeDepotModal() {
    const modal = document.getElementById('depot-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    currentEditingDepotData = null;
    
    const form = document.getElementById('depot-form');
    if (form) {
        form.reset();
    }
}

/**
 * Sauvegarder un dépôt
 */
function saveDepot() {
    console.log('💾 Sauvegarde du dépôt...');
    // À implémenter quand l'API depots sera prête
    showNotification('Fonction de sauvegarde des dépôts en cours de développement', 'info');
}

/**
 * Formater une date pour l'affichage
 */
function formatDate(dateString) {
    if (!dateString) return 'Non définie';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    } catch (error) {
        return dateString;
    }
}

const loadClientsTable = () => {
    console.log('📋 Chargement du tableau des clients...');
    // Rediriger vers la fonction des clients
    if (typeof loadClients === 'function') {
        loadClients();
    } else {
        console.warn('⚠️ Fonction loadClients non disponible');
    }
};

// Fonction applyDepotFilters pour éviter les conflits
const applyDepotFiltersCompat = () => {
    console.log('🔍 Application des filtres dépôts...');
    filterDepots();
};

// Initialiser au chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    // Attendre que l'API soit disponible
    setTimeout(() => {
        if (typeof API !== 'undefined') {
            initializeDepots();
        } else {
            console.warn('⚠️ API non disponible pour les dépôts');
        }
    }, 1000);
});