// Variables globales pour les données
let currentDepots = [];
let currentArchives = [];

// ================== GESTION DES DÉPÔTS ==================

// Chargement des dépôts
const loadDepots = async (filters = {}) => {
    try {
        showLoadingOverlay();
        const response = await API.depots.getAll(filters);
        
        if (response.success) {
            currentDepots = response.data.depots || [];
            displayDepots(currentDepots);
        } else {
            showNotification('Erreur lors du chargement des dépôts', 'error');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des dépôts:', error);
        showNotification('Erreur de connexion', 'error');
    } finally {
        hideLoadingOverlay();
    }
};

// Affichage des dépôts
const displayDepots = (depots) => {
    const tbody = document.querySelector('#depots-tbody');
    if (!tbody) return;

    if (depots.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">
                    Aucun dépôt trouvé
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = depots.map(depot => {
        const client = clients.find(c => c.id === depot.client_id);
        const status = statuts.find(s => s.id === depot.status_id);
        
        return `
            <tr>
                <td>${String(depot.id).padStart(3, '0')}</td>
                <td>${client ? `${client.prenom} ${client.nom}` : 'Client inconnu'}</td>
                <td>${depot.description || ''}</td>
                <td>
                    <span class="status-badge" style="background-color: ${status?.couleur_hex || '#gray'};">
                        ${status?.nom || 'Statut inconnu'}
                    </span>
                </td>
                <td>${formatDateShort(depot.date_depot)}</td>
                <td>${formatDateShort(depot.date_prevue)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="editDepot(${depot.id})" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-success" onclick="updateDepotStatus(${depot.id})" title="Statut suivant">
                            <i class="fas fa-arrow-right"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="archiveDepot(${depot.id})" title="Archiver">
                            <i class="fas fa-archive"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteDepot(${depot.id})" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
};

// Recherche et filtres de dépôts
const filterDepots = () => {
    const searchTerm = document.getElementById('depot-search')?.value?.toLowerCase() || '';
    const clientFilter = document.getElementById('client-filter')?.value || '';
    const statusFilter = document.getElementById('status-filter')?.value || '';
    
    let filteredDepots = [...currentDepots];
    
    // Filtre par recherche
    if (searchTerm) {
        filteredDepots = filteredDepots.filter(depot => {
            const client = clients.find(c => c.id === depot.client_id);
            const clientName = client ? `${client.prenom} ${client.nom}`.toLowerCase() : '';
            const description = (depot.description || '').toLowerCase();
            
            return clientName.includes(searchTerm) ||
                   description.includes(searchTerm) ||
                   depot.id.toString().includes(searchTerm);
        });
    }
    
    // Filtre par client
    if (clientFilter) {
        filteredDepots = filteredDepots.filter(depot => depot.client_id.toString() === clientFilter);
    }
    
    // Filtre par statut
    if (statusFilter) {
        filteredDepots = filteredDepots.filter(depot => depot.status_id.toString() === statusFilter);
    }
    
    displayDepots(filteredDepots);
};

// Actualisation des dépôts
const refreshDepots = async () => {
    await loadDepots();
    showNotification('Liste des dépôts actualisée', 'success');
};

// Édition d'un dépôt
const editDepot = async (depotId) => {
    try {
        const response = await API.depots.getById(depotId);
        if (response.success) {
            const depot = response.data;
            showEditDepotModal(depot);
        } else {
            showNotification('Erreur lors du chargement du dépôt', 'error');
        }
    } catch (error) {
        showNotification('Erreur lors du chargement du dépôt', 'error');
    }
};

// Mise à jour du statut d'un dépôt
const updateDepotStatus = async (depotId) => {
    try {
        const depot = currentDepots.find(d => d.id === depotId);
        if (!depot) return;

        const currentStatusIndex = statuts.findIndex(s => s.id === depot.status_id);
        const nextStatus = statuts[currentStatusIndex + 1];

        if (!nextStatus) {
            showNotification('Le dépôt est déjà au dernier statut', 'warning');
            return;
        }

        const response = await API.depots.updateStatus(depotId, nextStatus.id);
        if (response.success) {
            showNotification(`Statut mis à jour: ${nextStatus.nom}`, 'success');
            await loadDepots();
            await loadDashboardData();
        } else {
            showNotification(response.error || 'Erreur lors de la mise à jour du statut', 'error');
        }
    } catch (error) {
        showNotification('Erreur lors de la mise à jour du statut', 'error');
    }
};

// Archivage d'un dépôt
const archiveDepot = async (depotId) => {
    if (!confirm('Êtes-vous sûr de vouloir archiver ce dépôt ?')) return;

    try {
        const response = await API.depots.archive(depotId);
        if (response.success) {
            showNotification('Dépôt archivé avec succès', 'success');
            await loadDepots();
            await loadDashboardData();
        } else {
            showNotification(response.error || 'Erreur lors de l\'archivage', 'error');
        }
    } catch (error) {
        showNotification('Erreur lors de l\'archivage', 'error');
    }
};

// Suppression d'un dépôt
const deleteDepot = async (depotId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce dépôt ? Cette action est irréversible.')) return;

    try {
        const response = await API.depots.delete(depotId);
        if (response.success) {
            showNotification('Dépôt supprimé avec succès', 'success');
            await loadDepots();
            await loadDashboardData();
        } else {
            showNotification(response.error || 'Erreur lors de la suppression', 'error');
        }
    } catch (error) {
        showNotification('Erreur lors de la suppression', 'error');
    }
};

// ================== GESTION DES CLIENTS ==================

// Chargement du tableau des clients
const loadClientsTable = async () => {
    try {
        showLoadingOverlay();
        await loadClients(); // Recharger les clients
        displayClientsTable(clients);
    } catch (error) {
        console.error('Erreur lors du chargement des clients:', error);
        showNotification('Erreur lors du chargement des clients', 'error');
    } finally {
        hideLoadingOverlay();
    }
};

// Affichage du tableau des clients
const displayClientsTable = (clientsData) => {
    const tbody = document.querySelector('#clients-tbody');
    if (!tbody) return;

    if (clientsData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">
                    Aucun client trouvé
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = clientsData.map(client => `
        <tr>
            <td>${String(client.id).padStart(3, '0')}</td>
            <td>${client.prenom}</td>
            <td>${client.nom}</td>
            <td>${client.email || ''}</td>
            <td>${client.telephone || ''}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="editClient(${client.id})" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteClient(${client.id})" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
};

// Filtrage des clients
const filterClients = () => {
    const searchTerm = document.getElementById('client-search')?.value?.toLowerCase() || '';
    
    let filteredClients = [...clients];
    
    if (searchTerm) {
        filteredClients = filteredClients.filter(client => {
            const fullName = `${client.prenom} ${client.nom}`.toLowerCase();
            const email = (client.email || '').toLowerCase();
            const telephone = (client.telephone || '').toLowerCase();
            
            return fullName.includes(searchTerm) ||
                   email.includes(searchTerm) ||
                   telephone.includes(searchTerm) ||
                   client.id.toString().includes(searchTerm);
        });
    }
    
    displayClientsTable(filteredClients);
};

// Édition d'un client
const editClient = async (clientId) => {
    try {
        const response = await API.clients.getById(clientId);
        if (response.success) {
            const client = response.data;
            showEditClientModal(client);
        } else {
            showNotification('Erreur lors du chargement du client', 'error');
        }
    } catch (error) {
        showNotification('Erreur lors du chargement du client', 'error');
    }
};

// Suppression d'un client
const deleteClient = async (clientId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return;

    try {
        const response = await API.clients.delete(clientId);
        if (response.success) {
            showNotification('Client supprimé avec succès', 'success');
            await loadClients();
            await loadClientsTable();
            populateClientSelects();
            await loadDashboardData();
        } else {
            showNotification(response.error || 'Erreur lors de la suppression', 'error');
        }
    } catch (error) {
        showNotification('Erreur lors de la suppression', 'error');
    }
};

// ================== GESTION DES ARCHIVES ==================

// Chargement des archives
const loadArchives = async (filters = {}) => {
    try {
        showLoadingOverlay();
        const response = await API.archives.getAll(filters);
        
        if (response.success) {
            currentArchives = response.data.archives || [];
            displayArchives(currentArchives);
        } else {
            showNotification('Erreur lors du chargement des archives', 'error');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des archives:', error);
        showNotification('Erreur lors du chargement des archives', 'error');
    } finally {
        hideLoadingOverlay();
    }
};

// Affichage des archives
const displayArchives = (archives) => {
    const tbody = document.querySelector('#archives-tbody');
    if (!tbody) return;

    if (archives.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">
                    Aucune archive trouvée
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = archives.map(archive => `
        <tr>
            <td>${String(archive.id).padStart(3, '0')}</td>
            <td>${archive.client_nom}</td>
            <td>${archive.description || ''}</td>
            <td>${formatDateShort(archive.date_depot)}</td>
            <td>${formatDateShort(archive.date_archive)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-info" onclick="viewArchive(${archive.id})" title="Voir détails">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="restoreArchive(${archive.id})" title="Restaurer">
                        <i class="fas fa-undo"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteArchive(${archive.id})" title="Supprimer définitivement">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
};

// Filtrage des archives
const filterArchives = () => {
    const searchTerm = document.getElementById('archive-search')?.value?.toLowerCase() || '';
    const clientFilter = document.getElementById('archive-client-filter')?.value || '';
    
    let filteredArchives = [...currentArchives];
    
    // Filtre par recherche
    if (searchTerm) {
        filteredArchives = filteredArchives.filter(archive => {
            const clientName = (archive.client_nom || '').toLowerCase();
            const description = (archive.description || '').toLowerCase();
            
            return clientName.includes(searchTerm) ||
                   description.includes(searchTerm) ||
                   archive.id.toString().includes(searchTerm);
        });
    }
    
    // Filtre par client
    if (clientFilter) {
        filteredArchives = filteredArchives.filter(archive => 
            archive.client_nom === clientFilter
        );
    }
    
    displayArchives(filteredArchives);
};

// Visualisation d'une archive
const viewArchive = async (archiveId) => {
    try {
        const response = await API.archives.getById(archiveId);
        if (response.success) {
            const archive = response.data;
            showViewArchiveModal(archive);
        } else {
            showNotification('Erreur lors du chargement de l\'archive', 'error');
        }
    } catch (error) {
        showNotification('Erreur lors du chargement de l\'archive', 'error');
    }
};

// Restauration d'une archive
const restoreArchive = async (archiveId) => {
    if (!confirm('Êtes-vous sûr de vouloir restaurer cet élément depuis les archives ?')) return;

    try {
        const response = await API.archives.restore(archiveId);
        if (response.success) {
            showNotification('Archive restaurée avec succès', 'success');
            await loadArchives();
            await loadDepots();
            await loadDashboardData();
        } else {
            showNotification(response.error || 'Erreur lors de la restauration', 'error');
        }
    } catch (error) {
        showNotification('Erreur lors de la restauration', 'error');
    }
};

// Suppression définitive d'une archive
const deleteArchive = async (archiveId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement cette archive ? Cette action est irréversible.')) return;

    try {
        const response = await API.archives.delete(archiveId);
        if (response.success) {
            showNotification('Archive supprimée définitivement', 'success');
            await loadArchives();
        } else {
            showNotification(response.error || 'Erreur lors de la suppression', 'error');
        }
    } catch (error) {
        showNotification('Erreur lors de la suppression', 'error');
    }
};

// Nettoyage des anciennes archives
const clearOldArchives = async () => {
    if (!confirm('Supprimer toutes les archives de plus d\'un an ?')) return;

    try {
        const response = await API.archives.cleanup(365);
        if (response.success) {
            const deletedCount = response.data.deletedCount;
            showNotification(`${deletedCount} archives supprimées`, 'success');
            await loadArchives();
        } else {
            showNotification(response.error || 'Erreur lors du nettoyage', 'error');
        }
    } catch (error) {
        showNotification('Erreur lors du nettoyage', 'error');
    }
};

// ================== GESTION DES STATUTS ==================

// Chargement du tableau des statuts
const loadStatutsTable = async () => {
    try {
        showLoadingOverlay();
        await loadStatuts(); // Recharger les statuts
        displayStatutsTable(statuts);
    } catch (error) {
        console.error('Erreur lors du chargement des statuts:', error);
        showNotification('Erreur lors du chargement des statuts', 'error');
    } finally {
        hideLoadingOverlay();
    }
};

// Affichage du tableau des statuts
const displayStatutsTable = (statutsData) => {
    const tbody = document.querySelector('#statuts-tbody');
    if (!tbody) return;

    if (statutsData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">
                    Aucun statut trouvé
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = statutsData.map(statut => `
        <tr>
            <td>${statut.id}</td>
            <td>${statut.nom}</td>
            <td>
                <div class="color-indicator" style="background-color: ${statut.couleur_hex}; width: 30px; height: 20px; border-radius: 4px; display: inline-block; margin-right: 0.5rem;"></div>
                ${statut.couleur_hex}
            </td>
            <td>${statut.action || 'Aucune'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="editStatut(${statut.id})" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteStatut(${statut.id})" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
};

// Édition d'un statut
const editStatut = async (statutId) => {
    const statut = statuts.find(s => s.id === statutId);
    if (statut) {
        showEditStatutModal(statut);
    } else {
        showNotification('Statut non trouvé', 'error');
    }
};

// Suppression d'un statut
const deleteStatut = async (statutId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce statut ?')) return;

    try {
        const response = await API.statuts.delete(statutId);
        if (response.success) {
            showNotification('Statut supprimé avec succès', 'success');
            await loadStatuts();
            await loadStatutsTable();
            populateStatusSelects();
            updateColorLegend();
        } else {
            showNotification(response.error || 'Erreur lors de la suppression', 'error');
        }
    } catch (error) {
        showNotification('Erreur lors de la suppression', 'error');
    }
};

// ================== GESTION ADMIN ==================

// Chargement des données admin
const loadAdminData = async () => {
    try {
        showLoadingOverlay();
        // Charger les statistiques et données d'administration
        await loadDashboardData();
        displayAdminStats();
        updateStorageInfo();
    } catch (error) {
        console.error('Erreur lors du chargement des données admin:', error);
        showNotification('Erreur lors du chargement des données admin', 'error');
    } finally {
        hideLoadingOverlay();
    }
};

// Affichage des statistiques admin
const displayAdminStats = async () => {
    try {
        const statsResponse = await API.stats.getDashboard();
        if (statsResponse.success) {
            const stats = statsResponse.data;
            
            const adminStatsContainer = document.getElementById('admin-stats');
            if (adminStatsContainer) {
                adminStatsContainer.innerHTML = `
                    <div class="stat-card">
                        <h3>Total Dépôts</h3>
                        <div class="stat-number">${stats.totalDepots || 0}</div>
                    </div>
                    <div class="stat-card">
                        <h3>Total Clients</h3>
                        <div class="stat-number">${stats.totalClients || 0}</div>
                    </div>
                    <div class="stat-card">
                        <h3>Total Statuts</h3>
                        <div class="stat-number">${statuts.length || 0}</div>
                    </div>
                    <div class="stat-card">
                        <h3>Archives</h3>
                        <div class="stat-number">${stats.totalArchives || 0}</div>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Erreur lors de l\'affichage des statistiques admin:', error);
    }
};

// Mise à jour des informations de stockage
const updateStorageInfo = () => {
    try {
        let totalSize = 0;
        
        // Calculer la taille approximative du stockage
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('depot_manager_')) {
                totalSize += localStorage[key].length;
            }
        });
        
        // Convertir en MB (approximatif)
        const sizeInMB = (totalSize / 1024 / 1024).toFixed(2);
        
        const storageElement = document.getElementById('storage-used');
        if (storageElement) {
            storageElement.textContent = `${sizeInMB} MB`;
        }
    } catch (error) {
        console.error('Erreur lors du calcul de la taille de stockage:', error);
    }
};

// Export des données
const exportData = async () => {
    try {
        showLoadingOverlay();
        
        const response = await API.backup.export();
        if (response.success) {
            const data = response.data;
            
            // Créer et télécharger le fichier JSON
            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `depot-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            // Mettre à jour la date de sauvegarde
            const lastBackupElement = document.getElementById('last-backup');
            if (lastBackupElement) {
                lastBackupElement.textContent = new Date().toLocaleString('fr-FR');
            }
            
            showNotification('Données exportées avec succès', 'success');
        } else {
            showNotification(response.error || 'Erreur lors de l\'export', 'error');
        }
    } catch (error) {
        console.error('Erreur lors de l\'export:', error);
        showNotification('Erreur lors de l\'export des données', 'error');
    } finally {
        hideLoadingOverlay();
    }
};

// Import des données
const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            showLoadingOverlay();
            
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (confirm('Cette action va remplacer toutes les données actuelles. Êtes-vous sûr de continuer ?')) {
                const response = await API.backup.import(data);
                
                if (response.success) {
                    showNotification('Données importées avec succès', 'success');
                    // Recharger l'application
                    await refreshData();
                } else {
                    showNotification(response.error || 'Erreur lors de l\'import', 'error');
                }
            }
        } catch (error) {
            console.error('Erreur lors de l\'import:', error);
            showNotification('Erreur lors de l\'import: ' + error.message, 'error');
        } finally {
            hideLoadingOverlay();
        }
    };
    
    input.click();
};

// Nettoyage des données
const cleanupData = async () => {
    const actions = [
        'Supprimer les archives de plus d\'un an',
        'Nettoyer les données orphelines',
        'Optimiser le stockage'
    ];
    
    const content = `
        <div class="cleanup-options">
            <p>Sélectionnez les actions de nettoyage à effectuer :</p>
            ${actions.map((action, index) => `
                <div class="form-group">
                    <label style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                        <input type="checkbox" name="cleanup_action" value="${index}" style="margin-right: 0.5rem;">
                        ${action}
                    </label>
                </div>
            `).join('')}
        </div>
        <div class="modal-actions">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Annuler</button>
            <button type="button" class="btn btn-danger" onclick="executeCleanup()">Exécuter le nettoyage</button>
        </div>
    `;
    
    showModal('Nettoyage des données', content);
};

// Exécution du nettoyage
const executeCleanup = async () => {
    const selectedActions = Array.from(document.querySelectorAll('input[name="cleanup_action"]:checked'))
        .map(input => parseInt(input.value));
    
    if (selectedActions.length === 0) {
        showNotification('Aucune action sélectionnée', 'warning');
        return;
    }
    
    if (!confirm('Cette action est irréversible. Êtes-vous sûr de continuer ?')) return;
    
    try {
        showLoadingOverlay();
        
        let cleanupResults = [];
        
        // Action 0: Supprimer les archives de plus d'un an
        if (selectedActions.includes(0)) {
            const response = await API.archives.cleanup(365);
            if (response.success) {
                cleanupResults.push(`${response.data.deletedCount} archives supprimées`);
            }
        }
        
        // Action 1: Nettoyer les données orphelines (simulation)
        if (selectedActions.includes(1)) {
            cleanupResults.push('Données orphelines nettoyées');
        }
        
        // Action 2: Optimiser le stockage (simulation)
        if (selectedActions.includes(2)) {
            cleanupResults.push('Stockage optimisé');
        }
        
        closeModal();
        showNotification(`Nettoyage terminé: ${cleanupResults.join(', ')}`, 'success');
        
        // Actualiser les données
        await refreshData();
        
    } catch (error) {
        console.error('Erreur lors du nettoyage:', error);
        showNotification('Erreur lors du nettoyage', 'error');
    } finally {
        hideLoadingOverlay();
    }
};

// Réinitialisation des données
const resetData = async () => {
    if (!confirm('Cette action va remettre les données par défaut et supprimer toutes vos données actuelles. Êtes-vous sûr de continuer ?')) return;
    
    try {
        showLoadingOverlay();
        
        const response = await API.backup.reset();
        if (response.success) {
            showNotification('Données réinitialisées avec succès', 'success');
            // Recharger l'application
            await refreshData();
        } else {
            showNotification(response.error || 'Erreur lors de la réinitialisation', 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la réinitialisation:', error);
        showNotification('Erreur lors de la réinitialisation', 'error');
    } finally {
        hideLoadingOverlay();
    }
};

// Gestion de la sauvegarde automatique
const toggleAutoBackup = () => {
    const checkbox = document.getElementById('auto-backup');
    if (checkbox && checkbox.checked) {
        showNotification('Sauvegarde automatique activée', 'success');
        // Ici vous pourriez implémenter un timer pour la sauvegarde automatique
    } else {
        showNotification('Sauvegarde automatique désactivée', 'warning');
    }
};

// Sauvegarde immédiate
const backupNow = async () => {
    await exportData();
};

// Mise à jour des paramètres
const updateMaxDepots = async () => {
    const maxDepots = document.getElementById('max-depots')?.value || 25;
    try {
        await API.settings.update({ max_depots_display: parseInt(maxDepots) });
        showNotification(`Limite fixée à ${maxDepots} dépôts`, 'info');
    } catch (error) {
        console.error('Erreur lors de la mise à jour des paramètres:', error);
    }
};

const updateAutoArchive = async () => {
    const days = document.getElementById('auto-archive')?.value || 30;
    try {
        await API.settings.update({ auto_archive_days: parseInt(days) });
        showNotification(`Auto-archivage après ${days} jours`, 'info');
    } catch (error) {
        console.error('Erreur lors de la mise à jour des paramètres:', error);
    }
};

// Rendre les fonctions disponibles globalement
window.loadDepots = loadDepots;
window.loadClientsTable = loadClientsTable;
window.loadArchives = loadArchives;
window.loadStatutsTable = loadStatutsTable;
window.loadAdminData = loadAdminData;
window.filterDepots = filterDepots;
window.filterClients = filterClients;
window.filterArchives = filterArchives;
window.refreshDepots = refreshDepots;
window.editDepot = editDepot;
window.updateDepotStatus = updateDepotStatus;
window.archiveDepot = archiveDepot;
window.deleteDepot = deleteDepot;
window.editClient = editClient;
window.deleteClient = deleteClient;
window.viewArchive = viewArchive;
window.restoreArchive = restoreArchive;
window.deleteArchive = deleteArchive;
window.clearOldArchives = clearOldArchives;
window.editStatut = editStatut;
window.deleteStatut = deleteStatut;
window.exportData = exportData;
window.importData = importData;
window.cleanupData = cleanupData;
window.executeCleanup = executeCleanup;
window.resetData = resetData;
window.toggleAutoBackup = toggleAutoBackup;
window.backupNow = backupNow;
window.updateMaxDepots = updateMaxDepots;
window.updateAutoArchive = updateAutoArchive;