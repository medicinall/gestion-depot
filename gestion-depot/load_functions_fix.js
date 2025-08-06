        console.log('✅ Patch de compatibilité appliqué avec succès');
        
        // === INITIALISATION AUTOMATIQUE ===
        
        // Remplir automatiquement tous les sélecteurs clients
        setTimeout(async () => {
            if (typeof window.populateAllClientSelects === 'function') {
                await window.populateAllClientSelects();
            }
        }, 3000);
        
        // Déclencher le chargement initial si on est sur un onglet spécifique
        const currentUrl = window.location.hash || '#dashboard';
        const currentTab = currentUrl./**
 * PATCH de compatibilité pour connecter app_fixed.js avec les nouveaux modules
 * Ce fichier fait le lien entre l'ancien et le nouveau code
 */

console.log('🔗 Chargement du patch de compatibilité...');

// Attendre que tous les modules soient chargés
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        console.log('🔧 Application du patch de compatibilité...');
        
        // === FONCTIONS POUR LES DÉPÔTS ===
        
        // Fonction loadDepots pour app_fixed.js
        window.loadDepots = async function() {
            console.log('📦 loadDepots appelée depuis app_fixed.js');
            
            try {
                // Charger les dépôts depuis l'API ou afficher des données de test
                if (typeof API !== 'undefined' && API.depots && API.depots.getAll) {
                    const response = await API.depots.getAll();
                    if (response.success) {
                        displayDepotsInTable(response.data);
                        return;
                    }
                }
                
                // Afficher des dépôts de test si l'API n'est pas disponible
                const testDepots = [
                    {
                        id: 1,
                        client_nom: 'Client Test 1',
                        description: 'Ordinateur portable - Problème de démarrage',
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
                
                displayDepotsInTable(testDepots);
                console.log('✅ Dépôts de test affichés');
                
            } catch (error) {
                console.error('❌ Erreur dans loadDepots:', error);
                displayDepotsInTable([]);
            }
        };
        
        // Fonction pour afficher les dépôts dans le tableau
        function displayDepotsInTable(depots) {
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
                                <button class="btn btn-primary" onclick="showNotification('Fonctionnalité en cours de développement', 'info')">
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
                    <td>${formatDateForDisplay(depot.date_depot)}</td>
                    <td>${formatDateForDisplay(depot.date_prevue)}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="showNotification('Fonction en développement', 'info')" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-info" onclick="showDepotDetails(${depot.id})" title="Voir détails">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-success" onclick="showNotification('PDF en développement', 'info')" title="Générer PDF">
                            <i class="fas fa-file-pdf"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
        
        // === FONCTIONS POUR LES CLIENTS ===
        
        // Fonction loadClientsTable pour app_fixed.js
        window.loadClientsTable = async function() {
            console.log('👥 loadClientsTable appelée depuis app_fixed.js');
            
            try {
                if (typeof API !== 'undefined' && API.clients && API.clients.getAll) {
                    const response = await API.clients.getAll({ limit: 50 });
                    
                    if (response.success) {
                        displayClientsInTable(response.data);
                        console.log(`✅ ${response.data.length} clients affichés dans le tableau`);
                    } else {
                        throw new Error(response.error);
                    }
                } else {
                    throw new Error('API clients non disponible');
                }
                
            } catch (error) {
                console.error('❌ Erreur dans loadClientsTable:', error);
                displayClientsInTable([]);
            }
        };
        
        // Fonction pour afficher les clients dans le tableau
        function displayClientsInTable(clients) {
            const tbody = document.getElementById('clients-tbody');
            
            if (!tbody) {
                console.warn('⚠️ Table clients-tbody non trouvée');
                return;
            }
            
            if (!clients || clients.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Aucun client trouvé</td></tr>';
                return;
            }
            
            tbody.innerHTML = clients.map(client => `
                <tr>
                    <td>${client.id}</td>
                    <td>${client.prenom || ''}</td>
                    <td>${client.nom || ''}</td>
                    <td>${client.email || 'Non renseigné'}</td>
                    <td>${client.telephone || 'Non renseigné'}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="editClientFromTable(${client.id})" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-info" onclick="showClientDetails(${client.id})" title="Voir détails">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteClientFromTable(${client.id})" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
        
        // === FONCTION POUR LE DASHBOARD ===
        
        // Fonction loadDashboardData améliorée
        const originalLoadDashboardData = window.loadDashboardData;
        window.loadDashboardData = async function() {
            console.log('📊 loadDashboardData appelée depuis le patch');
            
            try {
                // Utiliser la nouvelle API pour les statistiques
                if (typeof API !== 'undefined' && API.stats && API.stats.getBasicStats) {
                    const response = await API.stats.getBasicStats();
                    
                    if (response.success) {
                        updateDashboardDisplay(response.data);
                        console.log('✅ Statistiques du dashboard mises à jour');
                        return;
                    }
                }
                
                // Fallback : calculer manuellement
                const clientsResponse = await API.clients.getAll();
                const stats = {
                    totalClients: clientsResponse.success ? clientsResponse.total : 0,
                    totalDepots: 0, // Sera mis à jour quand la table depots existera
                    depotsEnAttente: 0,
                    depotsEnCours: 0,
                    depotsPrets: 0,
                    depotsRecuperes: 0
                };
                
                updateDashboardDisplay(stats);
                
            } catch (error) {
                console.error('❌ Erreur dans loadDashboardData:', error);
                // Afficher des stats par défaut
                updateDashboardDisplay({
                    totalClients: 0,
                    totalDepots: 0,
                    depotsEnAttente: 0,
                    depotsEnCours: 0,
                    depotsPrets: 0
                });
            }
        };
        
        // Fonction pour mettre à jour l'affichage du dashboard
        function updateDashboardDisplay(stats) {
            console.log('📈 Mise à jour de l\'affichage dashboard:', stats);
            
            // Mettre à jour les cartes de statistiques
            const statElements = {
                'total-clients': stats.totalClients,
                'total-depots': stats.totalDepots,
                'depots-en-attente': stats.depotsEnAttente,
                'depots-en-cours': stats.depotsEnCours,
                'depots-prets': stats.depotsPrets,
                'depots-termines': stats.depotsRecuperes || 0
            };
            
            Object.entries(statElements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    // Chercher l'élément .stat-number ou utiliser l'élément directement
                    const numberElement = element.querySelector('.stat-number') || element;
                    numberElement.textContent = value || 0;
                } else {
                    console.warn(`⚠️ Élément #${id} non trouvé pour la valeur ${value}`);
                }
            });
        }
        
        // === FONCTIONS UTILITAIRES ===
        
        // Formater les dates pour l'affichage
        function formatDateForDisplay(dateString) {
            if (!dateString) return 'Non définie';
            
            try {
                const date = new Date(dateString);
                return date.toLocaleDateString('fr-FR');
            } catch (error) {
                return dateString;
            }
        }
        
        // Afficher les détails d'un dépôt
        window.showDepotDetails = function(depotId) {
            const details = `
Détails du dépôt #${depotId}:
─────────────────────────
Fonctionnalité en cours de développement.
La visualisation complète sera disponible 
une fois la table depots créée.
            `;
            alert(details);
        };
        
        // === FONCTIONS POUR LES BOUTONS CLIENTS ===
        
        // Fonctions pour les boutons des clients
        window.editClientFromTable = async function(clientId) {
            console.log(`✏️ Modification du client ${clientId}`);
            
            try {
                // Récupérer les données du client
                const response = await API.clients.getById(clientId);
                
                if (!response.success) {
                    showNotification('Erreur lors de la récupération du client', 'error');
                    return;
                }
                
                const client = response.data;
                
                // Remplir et afficher le formulaire de modification
                showClientEditModal(client);
                
            } catch (error) {
                console.error('❌ Erreur lors de la modification du client:', error);
                showNotification('Erreur lors de la récupération des données du client', 'error');
            }
        };
        
        window.showClientDetails = async function(clientId) {
            console.log(`👁️ Affichage des détails du client ${clientId}`);
            
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
                } else {
                    showNotification('Erreur lors de la récupération du client', 'error');
                }
            } catch (error) {
                console.error('❌ Erreur lors de l\'affichage des détails:', error);
                showNotification('Erreur lors de la récupération des données', 'error');
            }
        };
        
        window.deleteClientFromTable = async function(clientId) {
            console.log(`🗑️ Suppression du client ${clientId}`);
            
            try {
                // Récupérer d'abord les infos du client pour confirmation
                const response = await API.clients.getById(clientId);
                
                if (!response.success) {
                    showNotification('Erreur lors de la récupération du client', 'error');
                    return;
                }
                
                const client = response.data;
                const clientName = `${client.prenom || ''} ${client.nom || ''}`.trim() || `Client #${client.id}`;
                
                if (!confirm(`⚠️ ATTENTION ⚠️\n\nÊtes-vous sûr de vouloir supprimer :\n${clientName} ?\n\n❌ Cette action est IRRÉVERSIBLE !\n\nTous les dépôts associés à ce client seront également affectés.`)) {
                    return;
                }
                
                // Supprimer le client
                const deleteResponse = await API.clients.delete(clientId);
                
                if (deleteResponse.success) {
                    showNotification(`Client ${clientName} supprimé avec succès`, 'success');
                    
                    // Recharger le tableau
                    if (typeof window.loadClientsTable === 'function') {
                        await window.loadClientsTable();
                    }
                    
                    // Mettre à jour les statistiques
                    if (typeof window.loadDashboardData === 'function') {
                        await window.loadDashboardData();
                    }
                } else {
                    showNotification(deleteResponse.error || 'Erreur lors de la suppression', 'error');
                }
                
            } catch (error) {
                console.error('❌ Erreur lors de la suppression du client:', error);
                showNotification('Erreur lors de la suppression du client', 'error');
            }
        };
        
        // Fonction pour afficher le formulaire de modification d'un client
        function showClientEditModal(client) {
            console.log('📝 Affichage du formulaire de modification client');
            
            // Vérifier si on a une modale cliente
            let modal = document.getElementById('client-modal');
            
            if (!modal) {
                console.warn('⚠️ Modale client non trouvée, utilisation d\'une solution alternative');
                
                // Créer un formulaire simplifié dans une nouvelle fenêtre ou prompt
                const newData = prompt(`Modification du client:\n\nNom actuel: ${client.nom}\nNouveau nom (ou laissez vide pour ne pas changer):`, client.nom || '');
                
                if (newData !== null && newData !== client.nom) {
                    // Sauvegarder la modification
                    API.clients.update(client.id, { ...client, nom: newData })
                        .then(response => {
                            if (response.success) {
                                showNotification('Client modifié avec succès', 'success');
                                if (typeof window.loadClientsTable === 'function') {
                                    window.loadClientsTable();
                                }
                            } else {
                                showNotification('Erreur lors de la modification', 'error');
                            }
                        })
                        .catch(error => {
                            console.error('Erreur modification:', error);
                            showNotification('Erreur lors de la modification', 'error');
                        });
                }
                return;
            }
            
            // Remplir le formulaire avec les données existantes
            const fields = ['prenom', 'nom', 'email', 'telephone', 'adresse', 'code_postal', 'ville'];
            
            fields.forEach(field => {
                const input = document.getElementById(`client-${field}`);
                if (input && client[field]) {
                    input.value = client[field];
                }
            });
            
            // Mettre à jour le titre de la modale
            const modalTitle = document.getElementById('client-modal-title');
            if (modalTitle) {
                modalTitle.textContent = `Modifier ${client.prenom || ''} ${client.nom || ''}`.trim();
            }
            
            // Stocker l'ID du client en cours de modification
            window.currentEditingClientId = client.id;
            
            // Afficher la modale
            modal.style.display = 'block';
        }
        
        // === FONCTIONS DE COMPATIBILITÉ SUPPLÉMENTAIRES ===
        
        // Autres fonctions que app_fixed.js pourrait appeler
        window.loadArchives = window.loadArchives || function() {
            console.log('📁 loadArchives - fonctionnalité en développement');
            const tbody = document.getElementById('archives-tbody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Fonctionnalité archives en cours de développement</td></tr>';
            }
        };
        
        window.loadStatutsTable = window.loadStatutsTable || function() {
            console.log('🏷️ loadStatutsTable - fonctionnalité en développement');
            const tbody = document.getElementById('statuts-tbody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Fonctionnalité statuts en cours de développement</td></tr>';
            }
        };
        
        window.loadAdminData = window.loadAdminData || function() {
            console.log('⚙️ loadAdminData - fonctionnalité en développement');
        };
        
        console.log('✅ Patch de compatibilité appliqué avec succès');
        
        // === INITIALISATION AUTOMATIQUE ===
        
        // Remplir automatiquement tous les sélecteurs clients
        setTimeout(async () => {
            if (typeof window.populateAllClientSelects === 'function') {
                await window.populateAllClientSelects();
            }
        }, 3000);
        
        // Déclencher le chargement initial si on est sur un onglet spécifique
        const currentUrl = window.location.hash || '#dashboard';
        const currentTab = currentUrl.replace('#', '');
        
        if (currentTab === 'dashboard') {
            setTimeout(() => {
                if (typeof window.loadDashboardData === 'function') {
                    window.loadDashboardData();
                }
            }, 1000);
        }
        
    }, 2000); // Délai pour s'assurer que tous les modules sont chargés
});

// === FONCTIONS GLOBALES POUR ÉVITER LES CONFLITS ===

// Supprimer les déclarations en conflit et les remplacer par des fonctions globales
window.clientsData = []; // Remplace la variable clients en conflit
window.depotsData = []; // Remplace la variable depots en conflit

// Fonction pour éviter les conflits de variables
window.initializeGlobalData = function() {
    console.log('🔄 Initialisation des données globales...');
    
    // Nettoyer les conflits potentiels
    if (typeof clients !== 'undefined') {
        console.log('⚠️ Variable clients en conflit détectée, résolution...');
        window.clientsData = clients;
    }
    
    if (typeof depots !== 'undefined') {
        console.log('⚠️ Variable depots en conflit détectée, résolution...');
        window.depotsData = depots;
    }
};

// Appeler l'initialisation après un délai
setTimeout(() => {
    if (typeof window.initializeGlobalData === 'function') {
        window.initializeGlobalData();
    }
}, 1000);