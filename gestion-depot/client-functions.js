/**
 * Fonctions JavaScript pour la gestion des clients
 * Compatible avec votre base "client" existante
 * VERSION SANS CONFLITS
 */

// Variables globales spécifiques aux clients (éviter les conflits)
let clientsListData = [];
let currentEditingClientData = null;

/**
 * Initialiser le module clients
 */
async function initializeClients() {
    console.log('🔄 Initialisation du module clients...');
    
    // Charger les clients au démarrage
    await loadClients();
    
    // Initialiser la recherche
    initializeClientSearch();
    
    console.log('✅ Module clients initialisé');
}

/**
 * Charger tous les clients depuis l'API
 */
async function loadClients() {
    try {
        console.log('📋 Chargement des clients...');
        
        const response = await API.clients.getAll();
        
        if (response.success) {
            clientsListData = response.data;
            displayClients(clientsListData);
            console.log(`✅ ${clientsListData.length} clients chargés`);
        } else {
            console.error('❌ Erreur lors du chargement des clients:', response.error);
            showNotification('Erreur lors du chargement des clients', 'error');
        }
    } catch (error) {
        console.error('❌ Erreur lors du chargement des clients:', error);
        showNotification('Erreur de connexion lors du chargement des clients', 'error');
    }
}

/**
 * Afficher les clients dans le tableau
 */
function displayClients(clientsToDisplay) {
    const tbody = document.getElementById('clients-tbody');
    
    if (!tbody) {
        console.warn('⚠️ Élément clients-tbody non trouvé');
        return;
    }
    
    if (!clientsToDisplay || clientsToDisplay.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Aucun client trouvé</td></tr>';
        return;
    }
    
    tbody.innerHTML = clientsToDisplay.map(client => `
        <tr>
            <td>${client.id}</td>
            <td>${client.prenom || ''}</td>
            <td>${client.nom || ''}</td>
            <td>${client.email || 'Non renseigné'}</td>
            <td>${client.telephone || 'Non renseigné'}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editClient(${client.id})" title="Modifier">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-info" onclick="viewClient(${client.id})" title="Voir détails">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteClient(${client.id})" title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Initialiser la recherche de clients
 */
function initializeClientSearch() {
    const searchInput = document.getElementById('client-search');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            if (searchTerm === '') {
                displayClients(clientsListData);
            } else {
                const filteredClients = clientsListData.filter(client => 
                    (client.nom && client.nom.toLowerCase().includes(searchTerm)) ||
                    (client.prenom && client.prenom.toLowerCase().includes(searchTerm)) ||
                    (client.email && client.email.toLowerCase().includes(searchTerm)) ||
                    (client.telephone && client.telephone.includes(searchTerm)) ||
                    (client.ville && client.ville.toLowerCase().includes(searchTerm))
                );
                
                displayClients(filteredClients);
            }
        });
    }
}

/**
 * Actualiser la liste des clients
 */
async function refreshClients() {
    console.log('🔄 Actualisation de la liste des clients...');
    await loadClients();
    showNotification('Liste des clients actualisée', 'success');
}

/**
 * Afficher la modale de création de client
 */
function showCreateClientModal() {
    currentEditingClientData = null;
    
    // Réinitialiser le formulaire
    const form = document.getElementById('client-form');
    if (form) {
        form.reset();
    }
    
    // Mettre à jour le titre de la modale
    const modalTitle = document.getElementById('client-modal-title');
    if (modalTitle) {
        modalTitle.textContent = 'Nouveau client';
    }
    
    // Afficher la modale
    const modal = document.getElementById('client-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

/**
 * Modifier un client
 */
async function editClient(clientId) {
    try {
        const response = await API.clients.getById(clientId);
        
        if (response.success) {
            currentEditingClientData = response.data;
            
            // Remplir le formulaire
            fillClientForm(response.data);
            
            // Mettre à jour le titre de la modale
            const modalTitle = document.getElementById('client-modal-title');
            if (modalTitle) {
                modalTitle.textContent = 'Modifier le client';
            }
            
            // Afficher la modale
            const modal = document.getElementById('client-modal');
            if (modal) {
                modal.style.display = 'block';
            }
        } else {
            showNotification('Erreur lors de la récupération du client', 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la modification du client:', error);
        showNotification('Erreur lors de la récupération du client', 'error');
    }
}

/**
 * Remplir le formulaire avec les données du client
 */
function fillClientForm(client) {
    const fields = ['prenom', 'nom', 'email', 'telephone', 'adresse', 'code_postal', 'ville'];
    
    fields.forEach(field => {
        const input = document.getElementById(`client-${field}`);
        if (input && client[field]) {
            input.value = client[field];
        }
    });
}

/**
 * Voir les détails d'un client
 */
async function viewClient(clientId) {
    try {
        const response = await API.clients.getById(clientId);
        
        if (response.success) {
            const client = response.data;
            
            // Afficher les détails dans une alerte ou une modale
            const details = `
Détails du client:
─────────────────
ID: ${client.id}
Nom: ${client.prenom} ${client.nom}
Email: ${client.email || 'Non renseigné'}
Téléphone: ${client.telephone || 'Non renseigné'}
Adresse: ${client.adresse || 'Non renseigné'}
Code postal: ${client.code_postal || 'Non renseigné'}  
Ville: ${client.ville || 'Non renseigné'}
            `;
            
            alert(details);
        } else {
            showNotification('Erreur lors de la récupération du client', 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la visualisation du client:', error);
        showNotification('Erreur lors de la récupération du client', 'error');
    }
}

/**
 * Supprimer un client
 */
async function deleteClient(clientId) {
    const client = clientsListData.find(c => c.id === clientId);
    const clientName = client ? `${client.prenom} ${client.nom}` : `Client #${clientId}`;
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${clientName} ?\n\nCette action est irréversible.`)) {
        return;
    }
    
    try {
        const response = await API.clients.delete(clientId);
        
        if (response.success) {
            showNotification('Client supprimé avec succès', 'success');
            await loadClients(); // Recharger la liste
        } else {
            showNotification(response.error || 'Erreur lors de la suppression', 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la suppression du client:', error);
        showNotification('Erreur lors de la suppression du client', 'error');
    }
}

/**
 * Sauvegarder un client (création ou modification)
 */
async function saveClient() {
    const form = document.getElementById('client-form');
    
    if (!form) {
        console.error('Formulaire client non trouvé');
        return;
    }
    
    // Récupérer les données du formulaire
    const formData = new FormData(form);
    const clientData = {};
    
    for (let [key, value] of formData.entries()) {
        // Retirer le préfixe 'client-' des noms de champs
        const fieldName = key.replace('client-', '');
        clientData[fieldName] = value.trim();
    }
    
    // Validation
    if (!clientData.nom) {
        showNotification('Le nom est obligatoire', 'error');
        return;
    }
    
    try {
        let response;
        
        if (currentEditingClientData) {
            // Modification
            response = await API.clients.update(currentEditingClientData.id, clientData);
        } else {
            // Création
            response = await API.clients.create(clientData);
        }
        
        if (response.success) {
            const action = currentEditingClientData ? 'modifié' : 'créé';
            showNotification(`Client ${action} avec succès`, 'success');
            
            // Fermer la modale
            closeClientModal();
            
            // Recharger la liste
            await loadClients();
        } else {
            showNotification(response.error || 'Erreur lors de la sauvegarde', 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du client:', error);
        showNotification('Erreur lors de la sauvegarde du client', 'error');
    }
}

/**
 * Fermer la modale client
 */
function closeClientModal() {
    const modal = document.getElementById('client-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    currentEditingClientData = null;
    
    const form = document.getElementById('client-form');
    if (form) {
        form.reset();
    }
}

/**
 * Afficher une notification
 */
function showNotification(message, type = 'info') {
    // Créer la notification si elle n'existe pas
    let notification = document.getElementById('notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            max-width: 300px;
            word-wrap: break-word;
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
    
    // Masquer après 3 secondes
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Initialiser au chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    // Attendre que l'API soit disponible
    if (typeof API !== 'undefined') {
        initializeClients();
    } else {
        // Réessayer après un court délai
        setTimeout(() => {
            if (typeof API !== 'undefined') {
                initializeClients();
            } else {
                console.error('❌ API non disponible pour les clients');
            }
        }, 1000);
    }
});