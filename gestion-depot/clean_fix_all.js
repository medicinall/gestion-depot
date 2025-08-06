/**
 * CORRECTIF COMPLET SANS CONFLITS
 * Remplace TOUS les fichiers problématiques d'un coup
 * À charger À LA PLACE de client-functions.js, depot-functions.js et load_functions_fix.js
 */

console.log('🔧 CORRECTIF COMPLET - Chargement...');

// ================================
// VARIABLES GLOBALES UNIQUES
// ================================
const AppData = {
    clients: [],
    depots: [],
    statuts: [],
    currentEditingClient: null,
    currentEditingDepot: null
};

// ================================
// FONCTIONS CLIENTS
// ================================
window.loadClients = async function() {
    console.log('📥 Chargement des clients...');
    
    try {
        const response = await API.clients.getAll();
        
        if (response.success) {
            AppData.clients = response.data;
            console.log(`✅ ${AppData.clients.length} clients chargés`);
        } else {
            console.error('❌ Erreur clients:', response.error);
        }
    } catch (error) {
        console.error('❌ Erreur chargement clients:', error);
        AppData.clients = [];
    }
};

window.loadClientsTable = async function() {
    console.log('👥 Chargement tableau clients...');
    
    try {
        const response = await API.clients.getAll({ limit: 100 });
        
        if (response.success && response.data) {
            const tbody = document.getElementById('clients-tbody');
            
            if (tbody) {
                tbody.innerHTML = response.data.map(client => `
                    <tr>
                        <td>${client.id}</td>
                        <td>${client.prenom || ''}</td>
                        <td>${client.nom || ''}</td>
                        <td>${client.email || 'Non renseigné'}</td>
                        <td>${client.telephone || 'Non renseigné'}</td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="editClientAction(${client.id})" title="Modifier">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-info" onclick="viewClientAction(${client.id})" title="Voir détails">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteClientAction(${client.id})" title="Supprimer">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
                
                console.log(`✅ ${response.data.length} clients affichés`);
            }
        }
    } catch (error) {
        console.error('❌ Erreur tableau clients:', error);
    }
};

window.editClientAction = async function(clientId) {
    console.log(`✏️ Modification client ${clientId}`);
    
    try {
        const response = await API.clients.getById(clientId);
        
        if (response.success) {
            const client = response.data;
            const newName = prompt(`Modifier le nom du client:\n\nNom actuel: ${client.nom}\nNouveau nom:`, client.nom || '');
            
            if (newName && newName !== client.nom) {
                const updateResponse = await API.clients.update(clientId, { ...client, nom: newName });
                
                if (updateResponse.success) {
                    showNotificationFixed('Client modifié avec succès', 'success');
                    await window.loadClientsTable();
                } else {
                    showNotificationFixed('Erreur lors de la modification', 'error');
                }
            }
        }
    } catch (error) {
        console.error('❌ Erreur modification client:', error);
        showNotificationFixed('Erreur lors de la modification', 'error');
    }
};

window.viewClientAction = async function(clientId) {
    console.log(`👁️ Visualisation client ${clientId}`);
    
    try {
        const response = await API.clients.getById(clientId);
        
        if (response.success) {
            const client = response.data;
            const details = `
🧑‍💼 DÉTAILS DU CLIENT
═══════════════════════

📋 ID: ${client.id}
👤 Nom: ${client.prenom || ''} ${client.nom || ''}
📧 Email: ${client.email || 'Non renseigné'}
📱 Téléphone: ${client.telephone || 'Non renseigné'}
🏠 Adresse: ${client.adresse || 'Non renseigné'}
📮 Code postal: ${client.code_postal || 'Non renseigné'}
🏙️ Ville: ${client.ville || 'Non renseigné'}
            `;
            
            alert(details);
        }
    } catch (error) {
        console.error('❌ Erreur visualisation client:', error);
    }
};

window.deleteClientAction = async function(clientId) {
    console.log(`🗑️ Suppression client ${clientId}`);
    
    try {
        const response = await API.clients.getById(clientId);
        
        if (response.success) {
            const client = response.data;
            const clientName = `${client.prenom || ''} ${client.nom || ''}`.trim() || `Client #${client.id}`;
            
            if (confirm(`⚠️ ATTENTION ⚠️\n\nSupprimer ${clientName} ?\n\n❌ Action IRRÉVERSIBLE !`)) {
                const deleteResponse = await API.clients.delete(clientId);
                
                if (deleteResponse.success) {
                    showNotificationFixed(`Client ${clientName} supprimé`, 'success');
                    await window.loadClientsTable();
                } else {
                    showNotificationFixed('Erreur lors de la suppression', 'error');
                }
            }
        }
    } catch (error) {
        console.error('❌ Erreur suppression client:', error);
        showNotificationFixed('Erreur lors de la suppression', 'error');
    }
};

// ================================
// FONCTIONS DÉPÔTS  
// ================================
window.loadDepots = async function() {
    console.log('📦 Chargement des dépôts...');
    
    try {
        if (API.depots && API.depots.getAll) {
            const response = await API.depots.getAll();
            
            if (response.success) {
                AppData.depots = response.data;
                displayDepotsFixed(AppData.depots);
                console.log(`✅ ${AppData.depots.length} dépôts chargés`);
                return;
            }
        }
        
        // Dépôts de test si API pas disponible
        AppData.depots = [
            {
                id: 1,
                client_nom: 'Client Test 1',
                description: 'Ordinateur portable - Problème démarrage',
                statut_nom: 'En attente',
                statut_couleur: '#ffc107',
                date_depot: '2025-01-01',
                date_prevue: '2025-01-05'
            },
            {
                id: 2,
                client_nom: 'Client Test 2',
                description: 'Smartphone - Écran cassé',
                statut_nom: 'En cours',
                statut_couleur: '#17a2b8',
                date_depot: '2024-12-30',
                date_prevue: '2025-01-03'
            }
        ];
        
        displayDepotsFixed(AppData.depots);
        console.log(`✅ ${AppData.depots.length} dépôts de test affichés`);
        
    } catch (error) {
        console.error('❌ Erreur chargement dépôts:', error);
        displayDepotsFixed([]);
    }
};

function displayDepotsFixed(depots) {
    const tbody = document.getElementById('depots-tbody');
    
    if (!tbody) {
        console.warn('⚠️ Table depots-tbody non trouvée');
        return;
    }
    
    if (!depots || depots.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div style="padding: 20px;">
                        <p><strong>Aucun dépôt pour le moment</strong></p>
                        <p style="color: #666;">La table des dépôts sera créée après configuration complète</p>
                        <button class="btn btn-primary" onclick="showNotificationFixed('Fonctionnalité en développement', 'info')">
                            Ajouter un dépôt de test
                        </button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = depots.map(depot => `
        <tr>
            <td>${depot.id}</td>
            <td>${depot.client_nom || 'Client inconnu'}</td>
            <td>${depot.description || ''}</td>
            <td>
                <span class="badge" style="background-color: ${depot.statut_couleur || '#007bff'}; color: white; padding: 4px 8px; border-radius: 4px;">
                    ${depot.statut_nom || 'Non défini'}
                </span>
            </td>
            <td>${formatDateFixed(depot.date_depot)}</td>
            <td>${formatDateFixed(depot.date_prevue)}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="showNotificationFixed('Fonction en développement', 'info')" title="Modifier">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-info" onclick="viewDepotAction(${depot.id})" title="Voir détails">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-success" onclick="showNotificationFixed('PDF en développement', 'info')" title="Générer PDF">
                    <i class="fas fa-file-pdf"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

window.viewDepotAction = function(depotId) {
    const depot = AppData.depots.find(d => d.id === depotId);
    
    if (depot) {
        const details = `
📦 DÉTAILS DU DÉPÔT #${depot.id}
═══════════════════════════════

👤 Client: ${depot.client_nom}
📝 Description: ${depot.description}
🏷️ Statut: ${depot.statut_nom}
📅 Date dépôt: ${formatDateFixed(depot.date_depot)}
⏰ Date prévue: ${formatDateFixed(depot.date_prevue)}
        `;
        
        alert(details);
    }
};

window.filterDepots = function(filterType = 'all') {
    console.log(`🔍 Filtrage dépôts: ${filterType}`);
    
    let filteredDepots = [...AppData.depots];
    
    switch (filterType) {
        case 'en_attente':
            filteredDepots = AppData.depots.filter(depot => depot.statut_nom === 'En attente');
            break;
        case 'en_cours':
            filteredDepots = AppData.depots.filter(depot => depot.statut_nom === 'En cours');
            break;
        case 'pret':
            filteredDepots = AppData.depots.filter(depot => depot.statut_nom === 'Prêt');
            break;
        case 'recupere':
            filteredDepots = AppData.depots.filter(depot => depot.statut_nom === 'Récupéré');
            break;
    }
    
    displayDepotsFixed(filteredDepots);
    console.log(`📊 ${filteredDepots.length} dépôts affichés`);
};

window.applyDepotFilters = function() {
    console.log('🔍 Application filtres dépôts...');
    window.filterDepots();
};

// ================================
// FONCTIONS DASHBOARD
// ================================
window.loadDashboardData = async function() {
    console.log('📊 Chargement dashboard...');
    
    try {
        if (API.stats && API.stats.getDashboard) {
            const response = await API.stats.getDashboard();
            
            if (response.success) {
                updateDashboardFixed(response.data);
                console.log('✅ Dashboard mis à jour:', response.data);
                return;
            }
        }
        
        // Calcul manuel si API pas disponible
        const clientsResponse = await API.clients.getAll();
        const totalClients = clientsResponse.success ? (clientsResponse.total || clientsResponse.data.length) : 0;
        
        const stats = {
            totalClients: totalClients,
            totalDepots: AppData.depots.length,
            depotsEnAttente: AppData.depots.filter(d => d.statut_nom === 'En attente').length,
            depotsEnCours: AppData.depots.filter(d => d.statut_nom === 'En cours').length,
            depotsPrets: AppData.depots.filter(d => d.statut_nom === 'Prêt').length,
            depotsTermines: AppData.depots.filter(d => d.statut_nom === 'Récupéré').length
        };
        
        updateDashboardFixed(stats);
        console.log('✅ Dashboard calculé:', stats);
        
    } catch (error) {
        console.error('❌ Erreur dashboard:', error);
        updateDashboardFixed({
            totalClients: 0,
            totalDepots: 0,
            depotsEnAttente: 0,
            depotsEnCours: 0,
            depotsPrets: 0,
            depotsTermines: 0
        });
    }
};

function updateDashboardFixed(stats) {
    const mappings = {
        'total-clients': stats.totalClients || 0,
        'total-depots': stats.totalDepots || 0,
        'depots-en-attente': stats.depotsEnAttente || 0,
        'depots-en-cours': stats.depotsEnCours || 0,
        'depots-prets': stats.depotsPrets || 0,
        'depots-termines': stats.depotsTermines || 0
    };
    
    Object.entries(mappings).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            const numberElement = element.querySelector('.stat-number') || element;
            numberElement.textContent = value;
            console.log(`✅ ${id}: ${value}`);
        }
    });
}

// ================================
// FONCTIONS SÉLECTEURS
// ================================
window.populateAllClientSelects = async function() {
    console.log('👥 Remplissage sélecteurs clients...');
    
    try {
        const response = await API.clients.getAll({ limit: 500 });
        
        if (!response.success) return;
        
        const clients = response.data;
        const clientSelects = document.querySelectorAll('select[id*="client"], select[name*="client"]');
        
        console.log(`🔍 ${clientSelects.length} sélecteurs trouvés pour ${clients.length} clients`);
        
        clientSelects.forEach((select, index) => {
            select.innerHTML = '<option value="">Sélectionner un client...</option>';
            
            clients.forEach(client => {
                const option = document.createElement('option');
                option.value = client.id;
                
                let displayName = '';
                if (client.prenom && client.nom) {
                    displayName = `${client.prenom} ${client.nom}`;
                } else if (client.nom) {
                    displayName = client.nom;
                } else {
                    displayName = `Client #${client.id}`;
                }
                
                if (client.ville) {
                    displayName += ` - ${client.ville}`;
                }
                
                option.textContent = displayName;
                select.appendChild(option);
            });
            
            console.log(`✅ Sélecteur ${index + 1} rempli`);
        });
        
    } catch (error) {
        console.error('❌ Erreur remplissage sélecteurs:', error);
    }
};

// ================================
// FONCTIONS ARCHIVES ET AUTRES
// ================================
window.loadArchives = function() {
    console.log('📁 Chargement archives...');
    const tbody = document.getElementById('archives-tbody');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Fonctionnalité archives en cours de développement</td></tr>';
    }
};

window.loadStatutsTable = function() {
    console.log('🏷️ Chargement statuts...');
    const tbody = document.getElementById('statuts-tbody');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Fonctionnalité statuts en cours de développement</td></tr>';
    }
};

window.loadAdminData = function() {
    console.log('⚙️ Chargement admin...');
};

// ================================
// FONCTIONS UTILITAIRES
// ================================
function formatDateFixed(dateString) {
    if (!dateString) return 'Non définie';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    } catch (error) {
        return dateString;
    }
}

function showNotificationFixed(message, type = 'info') {
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
    
    let notification = document.getElementById('notification-fixed');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification-fixed';
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
        `;
        document.body.appendChild(notification);
    }
    
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 4000);
}

// ================================
// INITIALISATION AUTOMATIQUE
// ================================
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(async () => {
        console.log('🚀 Initialisation automatique...');
        
        if (typeof API !== 'undefined') {
            try {
                await window.loadClients();
                await window.loadDepots();
                await window.loadDashboardData();
                await window.populateAllClientSelects();
                
                console.log('✅ Initialisation complète terminée');
            } catch (error) {
                console.error('❌ Erreur initialisation:', error);
            }
        }
    }, 3000);
});

console.log('✅ CORRECTIF COMPLET chargé'); 