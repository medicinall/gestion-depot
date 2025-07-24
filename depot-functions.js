// depot-functions.js - Fonctions pour la gestion des dépôts

console.log('📦 Chargement de depot-functions.js...');

// Variables globales pour les dépôts
let currentDepots = [];
let currentFilters = {
    search: '',
    client: '',
    status: ''
};

// Chargement des dépôts
const loadDepots = async () => {
    try {
        console.log('📥 Chargement des dépôts...');
        showLoadingOverlay();
        
        const response = await API.depots.getAll();
        if (response.success) {
            currentDepots = response.data.depots || [];
            displayDepots(currentDepots);
            console.log(`✅ ${currentDepots.length} dépôts chargés`);
        } else {
            console.error('❌ Erreur lors du chargement des dépôts:', response.error);
            showNotificationSafe('Erreur lors du chargement des dépôts: ' + response.error, 'error');
        }
    } catch (error) {
        console.error('❌ Erreur lors du chargement des dépôts:', error);
        showNotificationSafe('Erreur lors du chargement des dépôts: ' + error.message, 'error');
    } finally {
        hideLoadingOverlay();
    }
};

// Affichage des dépôts dans le tableau
const displayDepots = (depots) => {
    const tbody = document.getElementById('depots-tbody');
    if (!tbody) {
        console.error('❌ Tableau depots-tbody non trouvé');
        return;
    }
    
    if (depots.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Aucun dépôt trouvé</td></tr>';
        return;
    }
    
    tbody.innerHTML = depots.map(depot => {
        const clientNom = depot.client_prenom && depot.client_nom 
            ? `${depot.client_prenom} ${depot.client_nom}` 
            : `Client #${depot.client_id}`;
            
        const statutBadge = depot.statut_nom 
            ? `<span class="status-badge" style="background-color: ${depot.statut_couleur || '#6c757d'}">${depot.statut_nom}</span>`
            : 'Non défini';
            
        const dateDepot = depot.date_depot ? formatDateShort(depot.date_depot) : 'Non définie';
        const datePrevue = depot.date_prevue ? formatDateShort(depot.date_prevue) : 'Non définie';
        
        return `
            <tr>
                <td>#${depot.id}</td>
                <td>${clientNom}</td>
                <td>${depot.description || 'Sans description'}</td>
                <td>${statutBadge}</td>
                <td>${dateDepot}</td>
                <td>${datePrevue}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="generateDepotPDF(${depot.id})" title="Générer PDF">
                            <i class="fas fa-file-pdf"></i>
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="viewDepot(${depot.id})" title="Voir détails">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="editDepot(${depot.id})" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="archiveDepot(${depot.id})" title="Archiver">
                            <i class="fas fa-archive"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    console.log(`✅ ${depots.length} dépôts affichés dans le tableau`);
};

// Génération du PDF pour un dépôt
const generateDepotPDF = async (depotId) => {
    try {
        console.log(`📄 Génération PDF pour le dépôt #${depotId}...`);
        showNotificationSafe('Génération du PDF en cours...', 'info');
        
        // Ouvrir le PDF dans un nouvel onglet
        const pdfUrl = `generate_pdf.php?id=${depotId}`;
        window.open(pdfUrl, '_blank');
        
        showNotificationSafe('PDF généré avec succès', 'success');
        console.log(`✅ PDF généré pour le dépôt #${depotId}`);
        
    } catch (error) {
        console.error(`❌ Erreur lors de la génération PDF pour le dépôt #${depotId}:`, error);
        showNotificationSafe('Erreur lors de la génération du PDF: ' + error.message, 'error');
    }
};

// Voir les détails d'un dépôt
const viewDepot = async (depotId) => {
    try {
        const response = await API.depots.getById(depotId);
        if (response.success) {
            const depot = response.data;
            showDepotDetailsModal(depot);
        } else {
            showNotificationSafe('Erreur lors du chargement des détails: ' + response.error, 'error');
        }
    } catch (error) {
        console.error(`❌ Erreur lors du chargement des détails du dépôt #${depotId}:`, error);
        showNotificationSafe('Erreur lors du chargement des détails: ' + error.message, 'error');
    }
};

// Afficher les détails d'un dépôt dans une modale
const showDepotDetailsModal = (depot) => {
    const clientNom = depot.client_prenom && depot.client_nom 
        ? `${depot.client_prenom} ${depot.client_nom}` 
        : `Client #${depot.client_id}`;
        
    const content = `
        <div class="depot-details">
            <div class="detail-group">
                <h4>Informations générales</h4>
                <p><strong>ID:</strong> #${depot.id}</p>
                <p><strong>Client:</strong> ${clientNom}</p>
                <p><strong>Description:</strong> ${depot.description || 'Non renseignée'}</p>
                <p><strong>Statut:</strong> ${depot.statut_nom || 'Non défini'}</p>
                <p><strong>Date de dépôt:</strong> ${depot.date_depot ? formatDate(depot.date_depot) : 'Non définie'}</p>
                <p><strong>Date prévue:</strong> ${depot.date_prevue ? formatDate(depot.date_prevue) : 'Non définie'}</p>
            </div>
            
            <div class="detail-group">
                <h4>Détails techniques</h4>
                <p><strong>Désignation/Références:</strong> ${depot.designation_references || 'Non renseignée'}</p>
                <p><strong>Observation/Travaux:</strong> ${depot.observation_travaux || 'Non renseignée'}</p>
                <p><strong>Données à sauvegarder:</strong> ${depot.donnees_sauvegarder || 'Non'}</p>
                <p><strong>Outlook à sauvegarder:</strong> ${depot.outlook_sauvegarder || 'Non'}</p>
                <p><strong>Mot de passe:</strong> ${depot.mot_de_passe ? '••••••••' : 'Non défini'}</p>
            </div>
            
            <div class="detail-group">
                <h4>Notes et informations</h4>
                <p><strong>Notes internes:</strong> ${depot.notes || 'Aucune note'}</p>
                <p><strong>Informations complémentaires:</strong> ${depot.informations_complementaires || 'Aucune information'}</p>
            </div>
        </div>
        
        <div style="margin-top: 1rem; text-align: center;">
            <button class="btn btn-primary" onclick="generateDepotPDF(${depot.id}); closeModal();">
                <i class="fas fa-file-pdf"></i> Générer PDF
            </button>
        </div>
    `;
    
    showModal(`Détails du dépôt #${depot.id}`, content);
};

// Modifier un dépôt
const editDepot = (depotId) => {
    // Cette fonction peut être développée pour afficher un formulaire de modification
    showNotificationSafe('Fonction de modification en développement', 'info');
    console.log(`🔧 Modification du dépôt #${depotId} demandée`);
};

// Archiver un dépôt
const archiveDepot = async (depotId) => {
    if (!confirm('Êtes-vous sûr de vouloir archiver ce dépôt ?')) {
        return;
    }
    
    try {
        console.log(`🗄️ Archivage du dépôt #${depotId}...`);
        const response = await API.depots.archive(depotId);
        
        if (response.success) {
            showNotificationSafe('Dépôt archivé avec succès', 'success');
            await loadDepots(); // Recharger la liste
            await loadDashboardData(); // Mettre à jour les statistiques
        } else {
            showNotificationSafe('Erreur lors de l\'archivage: ' + response.error, 'error');
        }
    } catch (error) {
        console.error(`❌ Erreur lors de l'archivage du dépôt #${depotId}:`, error);
        showNotificationSafe('Erreur lors de l\'archivage: ' + error.message, 'error');
    }
};

// Filtrage des dépôts
const filterDepots = () => {
    const searchTerm = document.getElementById('depot-search')?.value.toLowerCase() || '';
    const clientFilter = document.getElementById('client-filter')?.value || '';
    const statusFilter = document.getElementById('status-filter')?.value || '';
    
    currentFilters = {
        search: searchTerm,
        client: clientFilter,
        status: statusFilter
    };
    
    const filteredDepots = currentDepots.filter(depot => {
        const matchesSearch = !searchTerm || 
            depot.description?.toLowerCase().includes(searchTerm) ||
            depot.client_nom?.toLowerCase().includes(searchTerm) ||
            depot.client_prenom?.toLowerCase().includes(searchTerm) ||
            depot.id.toString().includes(searchTerm);
            
        const matchesClient = !clientFilter || depot.client_id.toString() === clientFilter;
        const matchesStatus = !statusFilter || depot.status_id.toString() === statusFilter;
        
        return matchesSearch && matchesClient && matchesStatus;
    });
    
    displayDepots(filteredDepots);
    console.log(`🔍 Filtrage appliqué: ${filteredDepots.length}/${currentDepots.length} dépôts affichés`);
};

// Gestionnaires d'événements pour les filtres
const applyDepotFilters = filterDepots;
const handleDepotSearch = filterDepots;

// Rafraîchir la liste des dépôts
const refreshDepots = async () => {
    console.log('🔄 Rafraîchissement des dépôts...');
    await loadDepots();
    showNotificationSafe('Liste des dépôts actualisée', 'success');
};

// Chargement des autres onglets (fonctions placeholder)
const loadClientsTable = async () => {
    console.log('👥 Chargement de la table des clients...');
    const tbody = document.getElementById('clients-tbody');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Fonctionnalité en développement</td></tr>';
    }
};

const loadArchives = async () => {
    console.log('🗄️ Chargement des archives...');
    const tbody = document.getElementById('archives-tbody');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Fonctionnalité en développement</td></tr>';
    }
};

const loadStatutsTable = async () => {
    console.log('🏷️ Chargement de la table des statuts...');
    const tbody = document.getElementById('statuts-tbody');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Fonctionnalité en développement</td></tr>';
    }
};

const loadAdminData = async () => {
    console.log('⚙️ Chargement des données admin...');
    // Mise à jour des statistiques admin
    const adminStatsCards = document.querySelectorAll('#admin-stats .stat-number');
    adminStatsCards.forEach((card, index) => {
        const values = [currentDepots.length, clients.length, statuts.length, 0];
        card.textContent = values[index] || 0;
    });
};

// Gestionnaires pour les filtres
const handleClientSearch = () => {
    console.log('🔍 Recherche client...');
};

const handleArchiveSearch = () => {
    console.log('🔍 Recherche archives...');
};

// Export des fonctions pour utilisation globale
window.loadDepots = loadDepots;
window.generateDepotPDF = generateDepotPDF;
window.viewDepot = viewDepot;
window.editDepot = editDepot;
window.archiveDepot = archiveDepot;
window.refreshDepots = refreshDepots;
window.filterDepots = filterDepots;
window.applyDepotFilters = applyDepotFilters;
window.handleDepotSearch = handleDepotSearch;
window.loadClientsTable = loadClientsTable;
window.loadArchives = loadArchives;
window.loadStatutsTable = loadStatutsTable;
window.loadAdminData = loadAdminData;
window.handleClientSearch = handleClientSearch;
window.handleArchiveSearch = handleArchiveSearch;

console.log('✅ depot-functions.js chargé avec succès');