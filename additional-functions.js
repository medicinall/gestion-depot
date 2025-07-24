// ================== MODALES DE DÉPÔTS ==================

// Modal d'édition de dépôt
const showEditDepotModal = (depot) => {
    const content = `
        <form id="edit-depot-form">
            <input type="hidden" name="depot_id" value="${depot.id}">
            
            <div class="form-row">
                <div class="form-group">
                    <label for="edit-client-id">Client:</label>
                    <select name="client_id" id="edit-client-id" required>
                        ${clients.map(client => `
                            <option value="${client.id}" ${client.id === depot.client_id ? 'selected' : ''}>
                                ${client.prenom} ${client.nom}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit-status-id">Statut:</label>
                    <select name="status_id" id="edit-status-id" required>
                        ${statuts.map(status => `
                            <option value="${status.id}" ${status.id === depot.status_id ? 'selected' : ''}>
                                ${status.nom}
                            </option>
                        `).join('')}
                    </select>
                </div>
            </div>
            
            <div class="form-group">
                <label for="edit-description">Description:</label>
                <textarea name="description" id="edit-description" rows="3" required>${depot.description || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label for="edit-notes">Notes:</label>
                <textarea name="notes" id="edit-notes" rows="3">${depot.notes || ''}</textarea>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="edit-date-depot">Date de dépôt:</label>
                    <input type="date" name="date_depot" id="edit-date-depot" value="${depot.date_depot ? depot.date_depot.split('T')[0] : ''}">
                </div>
                <div class="form-group">
                    <label for="edit-date-prevue">Date prévue:</label>
                    <input type="date" name="date_prevue" id="edit-date-prevue" value="${depot.date_prevue ? depot.date_prevue.split('T')[0] : ''}">
                </div>
            </div>
            
            <div class="modal-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Annuler</button>
                <button type="submit" class="btn btn-primary">Sauvegarder</button>
            </div>
        </form>
    `;
    
    showModal('Modifier le dépôt #' + String(depot.id).padStart(3, '0'), content);
    
    // Ajouter l'écouteur pour le formulaire
    document.getElementById('edit-depot-form').addEventListener('submit', handleEditDepot);
};

// Gestion de l'édition de dépôt
const handleEditDepot = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const depotId = parseInt(formData.get('depot_id'));
    const depotData = {
        client_id: parseInt(formData.get('client_id')),
        status_id: parseInt(formData.get('status_id')),
        description: formData.get('description'),
        notes: formData.get('notes'),
        date_depot: formData.get('date_depot'),
        date_prevue: formData.get('date_prevue')
    };
    
    try {
        const response = await API.depots.update(depotId, depotData);
        if (response.success) {
            showNotification('Dépôt modifié avec succès', 'success');
            closeModal();
            await loadDepots();
            await loadDashboardData();
        } else {
            showNotification(response.error || 'Erreur lors de la modification', 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la modification du dépôt:', error);
        showNotification('Erreur: ' + error.message, 'error');
    }
};

// ================== MODALES DE CLIENTS ==================

// Modal de création de client
const showCreateClientModal = () => {
    const content = `
        <form id="create-client-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="client-prenom">Prénom:</label>
                    <input type="text" name="prenom" id="client-prenom" required>
                </div>
                <div class="form-group">
                    <label for="client-nom">Nom:</label>
                    <input type="text" name="nom" id="client-nom" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="client-email">Email:</label>
                    <input type="email" name="email" id="client-email">
                </div>
                <div class="form-group">
                    <label for="client-telephone">Téléphone:</label>
                    <input type="tel" name="telephone" id="client-telephone">
                </div>
            </div>
            <div class="form-group">
                <label for="client-adresse">Adresse:</label>
                <textarea name="adresse" id="client-adresse" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label for="client-notes">Notes:</label>
                <textarea name="notes" id="client-notes" rows="3"></textarea>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Annuler</button>
                <button type="submit" class="btn btn-primary">Créer le client</button>
            </div>
        </form>
    `;
    
    showModal('Nouveau client', content);
    
    // Ajouter l'écouteur pour le formulaire
    document.getElementById('create-client-form').addEventListener('submit', handleCreateClient);
};

// Gestion de la création de client
const handleCreateClient = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const clientData = {
        prenom: formData.get('prenom'),
        nom: formData.get('nom'),
        email: formData.get('email'),
        telephone: formData.get('telephone'),
        adresse: formData.get('adresse'),
        notes: formData.get('notes')
    };
    
    try {
        const response = await API.clients.create(clientData);
        if (response.success) {
            showNotification('Client créé avec succès', 'success');
            closeModal();
            await loadClients();
            await loadClientsTable();
            populateClientSelects();
            await loadDashboardData();
        } else {
            showNotification(response.error || 'Erreur lors de la création', 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la création du client:', error);
        showNotification('Erreur: ' + error.message, 'error');
    }
};

// Modal d'édition de client
const showEditClientModal = (client) => {
    const content = `
        <form id="edit-client-form">
            <input type="hidden" name="client_id" value="${client.id}">
            
            <div class="form-row">
                <div class="form-group">
                    <label for="edit-client-prenom">Prénom:</label>
                    <input type="text" name="prenom" id="edit-client-prenom" value="${client.prenom || ''}" required>
                </div>
                <div class="form-group">
                    <label for="edit-client-nom">Nom:</label>
                    <input type="text" name="nom" id="edit-client-nom" value="${client.nom || ''}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="edit-client-email">Email:</label>
                    <input type="email" name="email" id="edit-client-email" value="${client.email || ''}">
                </div>
                <div class="form-group">
                    <label for="edit-client-telephone">Téléphone:</label>
                    <input type="tel" name="telephone" id="edit-client-telephone" value="${client.telephone || ''}">
                </div>
            </div>
            <div class="form-group">
                <label for="edit-client-adresse">Adresse:</label>
                <textarea name="adresse" id="edit-client-adresse" rows="3">${client.adresse || ''}</textarea>
            </div>
            <div class="form-group">
                <label for="edit-client-notes">Notes:</label>
                <textarea name="notes" id="edit-client-notes" rows="3">${client.notes || ''}</textarea>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Annuler</button>
                <button type="submit" class="btn btn-primary">Sauvegarder</button>
            </div>
        </form>
    `;
    
    showModal('Modifier le client', content);
    
    // Ajouter l'écouteur pour le formulaire
    document.getElementById('edit-client-form').addEventListener('submit', handleEditClient);
};

// Gestion de l'édition de client
const handleEditClient = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const clientId = parseInt(formData.get('client_id'));
    const clientData = {
        prenom: formData.get('prenom'),
        nom: formData.get('nom'),
        email: formData.get('email'),
        telephone: formData.get('telephone'),
        adresse: formData.get('adresse'),
        notes: formData.get('notes')
    };
    
    try {
        const response = await API.clients.update(clientId, clientData);
        if (response.success) {
            showNotification('Client modifié avec succès', 'success');
            closeModal();
            await loadClients();
            await loadClientsTable();
            populateClientSelects();
        } else {
            showNotification(response.error || 'Erreur lors de la modification', 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la modification du client:', error);
        showNotification('Erreur: ' + error.message, 'error');
    }
};

// ================== MODALES DE STATUTS ==================

// Modal de création de statut
const showCreateStatutModal = () => {
    const content = `
        <form id="create-statut-form">
            <div class="form-group">
                <label for="statut-nom">Nom du statut:</label>
                <input type="text" name="nom" id="statut-nom" required>
            </div>
            <div class="form-group">
                <label for="statut-couleur">Couleur:</label>
                <input type="color" name="couleur_hex" id="statut-couleur" value="#3498db" required>
            </div>
            <div class="form-group">
                <label for="statut-action">Action associée:</label>
                <input type="text" name="action" id="statut-action" placeholder="Ex: Contacter le client">
            </div>
            <div class="form-group">
                <label for="statut-description">Description:</label>
                <textarea name="description" id="statut-description" rows="3"></textarea>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Annuler</button>
                <button type="submit" class="btn btn-primary">Créer le statut</button>
            </div>
        </form>
    `;
    
    showModal('Nouveau statut', content);
    
    // Ajouter l'écouteur pour le formulaire
    document.getElementById('create-statut-form').addEventListener('submit', handleCreateStatut);
};

// Gestion de la création de statut
const handleCreateStatut = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const statutData = {
        nom: formData.get('nom'),
        couleur_hex: formData.get('couleur_hex'),
        action: formData.get('action'),
        description: formData.get('description')
    };
    
    try {
        const response = await API.statuts.create(statutData);
        if (response.success) {
            showNotification('Statut créé avec succès', 'success');
            closeModal();
            await loadStatuts();
            await loadStatutsTable();
            populateStatusSelects();
            updateColorLegend();
        } else {
            showNotification(response.error || 'Erreur lors de la création', 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la création du statut:', error);
        showNotification('Erreur: ' + error.message, 'error');
    }
};

// Modal d'édition de statut
const showEditStatutModal = (statut) => {
    const content = `
        <form id="edit-statut-form">
            <input type="hidden" name="statut_id" value="${statut.id}">
            
            <div class="form-group">
                <label for="edit-statut-nom">Nom du statut:</label>
                <input type="text" name="nom" id="edit-statut-nom" value="${statut.nom || ''}" required>
            </div>
            <div class="form-group">
                <label for="edit-statut-couleur">Couleur:</label>
                <input type="color" name="couleur_hex" id="edit-statut-couleur" value="${statut.couleur_hex || '#3498db'}" required>
            </div>
            <div class="form-group">
                <label for="edit-statut-action">Action associée:</label>
                <input type="text" name="action" id="edit-statut-action" value="${statut.action || ''}">
            </div>
            <div class="form-group">
                <label for="edit-statut-description">Description:</label>
                <textarea name="description" id="edit-statut-description" rows="3">${statut.description || ''}</textarea>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Annuler</button>
                <button type="submit" class="btn btn-primary">Sauvegarder</button>
            </div>
        </form>
    `;
    
    showModal('Modifier le statut', content);
    
    // Ajouter l'écouteur pour le formulaire
    document.getElementById('edit-statut-form').addEventListener('submit', handleEditStatut);
};

// Gestion de l'édition de statut
const handleEditStatut = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const statutId = parseInt(formData.get('statut_id'));
    const statutData = {
        nom: formData.get('nom'),
        couleur_hex: formData.get('couleur_hex'),
        action: formData.get('action'),
        description: formData.get('description')
    };
    
    try {
        const response = await API.statuts.update(statutId, statutData);
        if (response.success) {
            showNotification('Statut modifié avec succès', 'success');
            closeModal();
            await loadStatuts();
            await loadStatutsTable();
            populateStatusSelects();
            updateColorLegend();
        } else {
            showNotification(response.error || 'Erreur lors de la modification', 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la modification du statut:', error);
        showNotification('Erreur: ' + error.message, 'error');
    }
};

// ================== MODALES D'ARCHIVES ==================

// Modal de visualisation d'archive
const showViewArchiveModal = (archive) => {
    const content = `
        <div class="archive-details">
            <div class="detail-row">
                <strong>ID:</strong> ${String(archive.id).padStart(3, '0')}
            </div>
            <div class="detail-row">
                <strong>Client:</strong> ${archive.client_nom}
            </div>
            <div class="detail-row">
                <strong>Description:</strong> ${archive.description || 'Aucune description'}
            </div>
            <div class="detail-row">
                <strong>Notes:</strong> ${archive.notes || 'Aucune note'}
            </div>
            <div class="detail-row">
                <strong>Date de dépôt:</strong> ${formatDateShort(archive.date_depot)}
            </div>
            <div class="detail-row">
                <strong>Date d'archivage:</strong> ${formatDateShort(archive.date_archive)}
            </div>
            <div class="detail-row">
                <strong>Statut final:</strong> 
                <span class="status-badge" style="background-color: #95a5a6;">
                    ${archive.statut_final || 'Inconnu'}
                </span>
            </div>
        </div>
        <div class="modal-actions">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Fermer</button>
            <button type="button" class="btn btn-success" onclick="restoreArchive(${archive.id}); closeModal();">
                <i class="fas fa-undo"></i> Restaurer
            </button>
        </div>
        <style>
        .archive-details .detail-row {
            margin-bottom: 1rem;
            padding: 0.75rem;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .archive-details .detail-row:last-child {
            border-bottom: none;
        }
        .archive-details .detail-row strong {
            min-width: 150px;
            color: var(--primary-color);
        }
        </style>
    `;
    
    showModal('Détails de l\'archive #' + String(archive.id).padStart(3, '0'), content);
};

// ================== FONCTIONS UTILITAIRES ==================

// Fonction de validation des formulaires
const validateForm = (formData, requiredFields) => {
    const errors = [];
    
    requiredFields.forEach(field => {
        const value = formData.get(field);
        if (!value || value.trim() === '') {
            errors.push(`Le champ ${field} est requis`);
        }
    });
    
    return errors;
};

// Fonction de nettoyage des données de formulaire
const sanitizeFormData = (formData) => {
    const sanitized = {};
    
    for (let [key, value] of formData.entries()) {
        if (typeof value === 'string') {
            sanitized[key] = value.trim();
        } else {
            sanitized[key] = value;
        }
    }
    
    return sanitized;
};

// Fonction de génération de couleurs aléatoires pour les statuts
const generateRandomColor = () => {
    const colors = [
        '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
        '#1abc9c', '#34495e', '#e67e22', '#95a5a6', '#f1c40f'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

// Fonction de confirmation avec modal personnalisée
const showConfirmModal = (title, message, onConfirm, onCancel = null) => {
    const content = `
        <div style="padding: 1rem 0;">
            <p>${message}</p>
        </div>
        <div class="modal-actions">
            <button type="button" class="btn btn-secondary" onclick="handleModalCancel()">Annuler</button>
            <button type="button" class="btn btn-danger" onclick="handleModalConfirm()">Confirmer</button>
        </div>
    `;
    
    showModal(title, content);
    
    // Ajouter les gestionnaires temporaires
    window.handleModalConfirm = () => {
        closeModal();
        if (onConfirm) onConfirm();
        // Nettoyer les gestionnaires
        delete window.handleModalConfirm;
        delete window.handleModalCancel;
    };
    
    window.handleModalCancel = () => {
        closeModal();
        if (onCancel) onCancel();
        // Nettoyer les gestionnaires
        delete window.handleModalConfirm;
        delete window.handleModalCancel;
    };
};

// Fonction de gestion des erreurs avec retry
const handleApiError = async (error, operation, retryFunction = null) => {
    console.error(`Erreur lors de ${operation}:`, error);
    
    if (retryFunction && error.message.includes('réseau')) {
        const retry = confirm(`Erreur réseau lors de ${operation}. Voulez-vous réessayer ?`);
        if (retry) {
            try {
                await retryFunction();
            } catch (retryError) {
                showNotification(`Erreur persistante lors de ${operation}`, 'error');
            }
        }
    } else {
        showNotification(`Erreur lors de ${operation}: ${error.message}`, 'error');
    }
};

// Fonction de debounce pour les recherches
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Fonction de formatage des numéros de téléphone
const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    
    // Supprimer tous les caractères non numériques
    const cleaned = phone.replace(/\D/g, '');
    
    // Formater selon le format français
    if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    }
    
    return phone;
};

// Fonction de validation d'email
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Fonction de capitalisation
const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Fonction de génération de rapport
const generateReport = async (type, filters = {}) => {
    try {
        showLoadingOverlay();
        
        let data;
        let reportTitle;
        
        switch (type) {
            case 'depots':
                const depotsResponse = await API.depots.getAll(filters);
                data = depotsResponse.success ? depotsResponse.data.depots : [];
                reportTitle = 'Rapport des Dépôts';
                break;
                
            case 'clients':
                const clientsResponse = await API.clients.getAll();
                data = clientsResponse.success ? clientsResponse.data.clients : [];
                reportTitle = 'Rapport des Clients';
                break;
                
            case 'archives':
                const archivesResponse = await API.archives.getAll(filters);
                data = archivesResponse.success ? archivesResponse.data.archives : [];
                reportTitle = 'Rapport des Archives';
                break;
                
            default:
                throw new Error('Type de rapport non supporté');
        }
        
        // Générer le contenu du rapport
        const reportContent = generateReportContent(type, data, reportTitle);
        
        // Créer et télécharger le fichier
        const blob = new Blob([reportContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `rapport-${type}-${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        showNotification('Rapport généré avec succès', 'success');
        
    } catch (error) {
        console.error('Erreur lors de la génération du rapport:', error);
        showNotification('Erreur lors de la génération du rapport', 'error');
    } finally {
        hideLoadingOverlay();
    }
};

// Fonction de génération du contenu HTML du rapport
const generateReportContent = (type, data, title) => {
    const currentDate = new Date().toLocaleDateString('fr-FR');
    
    let tableHeaders = '';
    let tableRows = '';
    
    switch (type) {
        case 'depots':
            tableHeaders = '<th>ID</th><th>Client</th><th>Description</th><th>Statut</th><th>Date Dépôt</th><th>Date Prévue</th>';
            tableRows = data.map(depot => {
                const client = clients.find(c => c.id === depot.client_id);
                const status = statuts.find(s => s.id === depot.status_id);
                return `
                    <tr>
                        <td>${String(depot.id).padStart(3, '0')}</td>
                        <td>${client ? `${client.prenom} ${client.nom}` : 'Client inconnu'}</td>
                        <td>${depot.description || ''}</td>
                        <td>${status?.nom || 'Statut inconnu'}</td>
                        <td>${formatDateShort(depot.date_depot)}</td>
                        <td>${formatDateShort(depot.date_prevue)}</td>
                    </tr>
                `;
            }).join('');
            break;
            
        case 'clients':
            tableHeaders = '<th>ID</th><th>Prénom</th><th>Nom</th><th>Email</th><th>Téléphone</th>';
            tableRows = data.map(client => `
                <tr>
                    <td>${String(client.id).padStart(3, '0')}</td>
                    <td>${client.prenom}</td>
                    <td>${client.nom}</td>
                    <td>${client.email || ''}</td>
                    <td>${client.telephone || ''}</td>
                </tr>
            `).join('');
            break;
            
        case 'archives':
            tableHeaders = '<th>ID</th><th>Client</th><th>Description</th><th>Date Dépôt</th><th>Date Archive</th>';
            tableRows = data.map(archive => `
                <tr>
                    <td>${String(archive.id).padStart(3, '0')}</td>
                    <td>${archive.client_nom}</td>
                    <td>${archive.description || ''}</td>
                    <td>${formatDateShort(archive.date_depot)}</td>
                    <td>${formatDateShort(archive.date_archive)}</td>
                </tr>
            `).join('');
            break;
    }
    
    return `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 2rem; }
                .header { text-align: center; margin-bottom: 2rem; }
                .header h1 { color: #2c3e50; }
                .header p { color: #666; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
                th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #ddd; }
                th { background-color: #f8f9fa; font-weight: bold; }
                tr:hover { background-color: #f8f9fa; }
                .footer { text-align: center; margin-top: 2rem; color: #666; font-size: 0.9rem; }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${title}</h1>
                <p>Généré le ${currentDate}</p>
                <p>Total: ${data.length} éléments</p>
            </div>
            
            <table>
                <thead>
                    <tr>${tableHeaders}</tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
            
            <div class="footer">
                <p>Rapport généré par le système de gestion des dépôts</p>
            </div>
        </body>
        </html>
    `;
};

// Rendre les fonctions disponibles globalement
window.showEditDepotModal = showEditDepotModal;
window.handleEditDepot = handleEditDepot;
window.showCreateClientModal = showCreateClientModal;
window.handleCreateClient = handleCreateClient;
window.showEditClientModal = showEditClientModal;
window.handleEditClient = handleEditClient;
window.showCreateStatutModal = showCreateStatutModal;
window.handleCreateStatut = handleCreateStatut;
window.showEditStatutModal = showEditStatutModal;
window.handleEditStatut = handleEditStatut;
window.showViewArchiveModal = showViewArchiveModal;
window.showConfirmModal = showConfirmModal;
window.handleApiError = handleApiError;
window.debounce = debounce;
window.formatPhoneNumber = formatPhoneNumber;
window.isValidEmail = isValidEmail;
window.capitalize = capitalize;
window.generateReport = generateReport;
window.generateRandomColor = generateRandomColor;