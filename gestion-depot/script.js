// Variables globales
let currentTab = 'dashboard';
let currentUser = { username: 'Utilisateur', nom: 'Utilisateur' };
let clients = [];
let statuts = [];
let depots = [];

// Configuration jsPDF
const { jsPDF } = window.jspdf;

// Simulation d'API
const API = {
    mockData: {
        clients: [
            { id: 1, prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@email.com', telephone: '01.23.45.67.89' },
            { id: 2, prenom: 'Marie', nom: 'Martin', email: 'marie.martin@email.com', telephone: '01.98.76.54.32' },
            { id: 3, prenom: 'Pierre', nom: 'Durand', email: 'pierre.durand@email.com', telephone: '01.11.22.33.44' },
            { id: 4, prenom: 'Sophie', nom: 'Bernard', email: 'sophie.bernard@email.com', telephone: '01.55.66.77.88' }
        ],
        statuts: [
            { id: 1, nom: 'Reçu', couleur_hex: '#6c757d', action: 'Attendre diagnostic' },
            { id: 2, nom: 'Diagnostic', couleur_hex: '#ffc107', action: 'Analyser le problème' },
            { id: 3, nom: 'En cours', couleur_hex: '#007bff', action: 'Traitement en cours' },
            { id: 4, nom: 'En attente pièce', couleur_hex: '#fd7e14', action: 'Commander composants' },
            { id: 5, nom: 'Terminé', couleur_hex: '#28a745', action: 'Prêt pour récupération' },
            { id: 6, nom: 'Livré', couleur_hex: '#20c997', action: 'Dépôt clôturé' },
            { id: 7, nom: 'Problème', couleur_hex: '#dc3545', action: 'Contacter le client' }
        ],
        depots: [
            { 
                id: 1, client_id: 1, status_id: 3,
                description: 'Réparation ordinateur portable - Écran cassé', 
                notes: 'Écran LCD fissuré, clavier fonctionne',
                date_depot: '2024-01-15', date_prevue: '2024-01-20'
            },
            { 
                id: 2, client_id: 2, status_id: 5,
                description: 'Installation Windows et logiciels bureau', 
                notes: 'Formatage complet demandé',
                date_depot: '2024-01-14', date_prevue: '2024-01-16'
            },
            { 
                id: 3, client_id: 3, status_id: 2,
                description: 'Diagnostic panne - PC ne démarre plus', 
                notes: 'Aucun signe de vie, LED éteinte',
                date_depot: '2024-01-16', date_prevue: '2024-01-18'
            },
            { 
                id: 4, client_id: 4, status_id: 7,
                description: 'Récupération données disque dur défaillant', 
                notes: 'Secteurs défectueux détectés',
                date_depot: '2024-01-13', date_prevue: '2024-01-17'
            }
        ]
    },

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    async mockRequest(callback) {
        await this.delay(300);
        try {
            return { success: true, data: callback() };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    clients: {
        async getAll() {
            return await API.mockRequest(() => ({ clients: API.mockData.clients }));
        },

        async create(clientData) {
            return await API.mockRequest(() => {
                const newClient = { id: Date.now(), ...clientData };
                API.mockData.clients.push(newClient);
                return newClient;
            });
        },

        async delete(id) {
            return await API.mockRequest(() => {
                API.mockData.clients = API.mockData.clients.filter(c => c.id !== parseInt(id));
                return { deleted: true };
            });
        }
    },

    statuts: {
        async getAll() {
            return await API.mockRequest(() => ({ statuts: API.mockData.statuts }));
        },

        async create(statusData) {
            return await API.mockRequest(() => {
                const newStatus = { id: Date.now(), ...statusData };
                API.mockData.statuts.push(newStatus);
                return newStatus;
            });
        },

        async delete(id) {
            return await API.mockRequest(() => {
                API.mockData.statuts = API.mockData.statuts.filter(s => s.id !== parseInt(id));
                return { deleted: true };
            });
        }
    },

    depots: {
        async getAll(filters = {}) {
            return await API.mockRequest(() => {
                let depots = [...API.mockData.depots];
                
                if (filters.search) {
                    const search = filters.search.toLowerCase();
                    depots = depots.filter(d => 
                        d.description.toLowerCase().includes(search) ||
                        d.notes.toLowerCase().includes(search)
                    );
                }
                
                if (filters.client_id) {
                    depots = depots.filter(d => d.client_id === parseInt(filters.client_id));
                }
                
                if (filters.status_id) {
                    depots = depots.filter(d => d.status_id === parseInt(filters.status_id));
                }
                
                return { depots };
            });
        },

        async create(depotData) {
            return await API.mockRequest(() => {
                if (!depotData.client_id) throw new Error('Client requis');
                if (!depotData.status_id) throw new Error('Statut requis');
                if (!depotData.description?.trim()) throw new Error('Description requise');

                const newDepot = {
                    id: Date.now(),
                    client_id: parseInt(depotData.client_id),
                    status_id: parseInt(depotData.status_id),
                    description: depotData.description.trim(),
                    notes: depotData.notes?.trim() || '',
                    date_depot: depotData.date_depot || new Date().toISOString().split('T')[0],
                    date_prevue: depotData.date_prevue || null
                };
                
                API.mockData.depots.push(newDepot);
                return newDepot;
            });
        },

        async delete(id) {
            return await API.mockRequest(() => {
                API.mockData.depots = API.mockData.depots.filter(d => d.id !== parseInt(id));
                return { deleted: true };
            });
        },

        async archive(id) {
            return await API.mockRequest(() => {
                const depot = API.mockData.depots.find(d => d.id === parseInt(id));
                if (depot) {
                    depot.archived = true;
                    depot.date_archive = new Date().toISOString().split('T')[0];
                }
                return depot;
            });
        }
    },

    stats: {
        async getDashboard() {
            return await API.mockRequest(() => {
                const depots = API.mockData.depots.filter(d => !d.archived);
                const today = new Date();
                
                return {
                    totalDepots: depots.length,
                    totalClients: API.mockData.clients.length,
                    depotsTermines: depots.filter(d => d.status_id === 5 || d.status_id === 6).length,
                    depotsEnCours: depots.filter(d => d.status_id === 3).length,
                    depotsEnRetard: depots.filter(d => {
                        const datePrevue = new Date(d.date_prevue);
                        return datePrevue < today && d.status_id !== 5 && d.status_id !== 6;
                    }).length,
                    recentActivity: [
                        { text: 'Nouveau dépôt créé', date: new Date().toISOString(), icon: 'plus' },
                        { text: 'Dépôt marqué comme terminé', date: new Date(Date.now() - 3600000).toISOString(), icon: 'check' },
                        { text: 'Client contacté', date: new Date(Date.now() - 7200000).toISOString(), icon: 'phone' }
                    ]
                };
            });
        }
    }
};

// Fonctions PDF
const PDFGenerator = {
    companyInfo: {
        nom: 'Réparations Pro',
        adresse: '123 Rue de la Réparation',
        ville: '75001 Paris',
        telephone: '01 23 45 67 89',
        email: 'contact@reparations-pro.fr'
    },

    generateDepotReceipt(depot) {
        const doc = new jsPDF();
        const client = clients.find(c => c.id === depot.client_id);
        const status = statuts.find(s => s.id === depot.status_id);

        // En-tête
        doc.setFontSize(20);
        doc.setTextColor(44, 62, 80);
        doc.text(this.companyInfo.nom, 20, 25);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(this.companyInfo.adresse, 20, 35);
        doc.text(this.companyInfo.ville, 20, 42);
        doc.text('Tél: ' + this.companyInfo.telephone, 20, 49);

        // Titre
        doc.setFontSize(18);
        doc.setTextColor(231, 76, 60);
        doc.text('REÇU DE DÉPÔT', 105, 25, { align: 'center' });

        // Numéro
        doc.setFontSize(14);
        doc.setTextColor(44, 62, 80);
        doc.text(`N° ${depot.id.toString().padStart(6, '0')}`, 170, 35);

        // Date
        doc.setFontSize(10);
        doc.text(`Date: ${formatDateShort(depot.date_depot)}`, 170, 45);

        // Ligne
        doc.setLineWidth(0.5);
        doc.line(20, 70, 190, 70);

        // Client
        doc.setFontSize(12);
        doc.setTextColor(44, 62, 80);
        doc.text('INFORMATIONS CLIENT', 20, 85);
        
        doc.setFontSize(10);
        doc.text(`Nom: ${client.prenom} ${client.nom}`, 20, 95);
        doc.text(`Email: ${client.email || 'Non renseigné'}`, 20, 102);
        doc.text(`Téléphone: ${client.telephone || 'Non renseigné'}`, 20, 109);

        // Dépôt
        doc.setFontSize(12);
        doc.text('DÉTAILS DU DÉPÔT', 20, 125);
        
        doc.setFontSize(10);
        doc.text(`Statut: ${status.nom}`, 20, 135);

        // Description
        doc.text('Description:', 20, 150);
        const splitDescription = doc.splitTextToSize(depot.description, 170);
        doc.text(splitDescription, 20, 160);

        let currentY = 160 + (splitDescription.length * 7);

        if (depot.notes) {
            doc.text('Notes:', 20, currentY + 10);
            const splitNotes = doc.splitTextToSize(depot.notes, 170);
            doc.text(splitNotes, 20, currentY + 20);
            currentY += 20 + (splitNotes.length * 7);
        }

        // Récupération
        currentY += 20;
        doc.setLineWidth(0.3);
        doc.line(20, currentY, 190, currentY);
        
        doc.setFontSize(12);
        doc.text('INFORMATIONS DE RÉCUPÉRATION', 20, currentY + 15);
        
        doc.setFontSize(10);
        doc.text(`Date prévue: ${depot.date_prevue ? formatDateShort(depot.date_prevue) : 'À définir'}`, 20, currentY + 25);

        return doc;
    }
};

// Initialisation
document.addEventListener("DOMContentLoaded", async () => {
    hideLoadingOverlay();
    await initializeApp();
    setupEventListeners();
});

const setupEventListeners = () => {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const tab = e.currentTarget.dataset.tab;
            if (tab) {
                switchTab(tab);
            }
        });
    });
    
    // Formulaires
    const createDepotForm = document.getElementById('create-depot-form');
    if (createDepotForm) {
        createDepotForm.addEventListener('submit', handleCreateDepot);
    }

    const createClientForm = document.getElementById('create-client-form');
    if (createClientForm) {
        createClientForm.addEventListener('submit', handleCreateClient);
    }

    const createStatusForm = document.getElementById('create-status-form');
    if (createStatusForm) {
        createStatusForm.addEventListener('submit', handleCreateStatus);
    }
    
    // Recherche
    setupSearchListeners();
    
    // Modales
    document.addEventListener('click', (e) => {
        if (e.target.id === 'modal-overlay') {
            closeModal();
        }
    });
    
    // Date
    initializeDateInputs();
};

const initializeDateInputs = () => {
    const dateInput = document.getElementById('depot-date');
    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
};

const initializeApp = async () => {
    showLoadingOverlay();
    try {
        await Promise.all([
            loadClients(),
            loadStatuts(),
            loadDepots(),
            loadDashboardData(),
        ]);
        
        populateSelects();
        await loadTabContent(currentTab);
        
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        showNotification('Erreur lors du chargement des données', 'error');
    } finally {
        hideLoadingOverlay();
    }
};

const loadClients = async () => {
    try {
        const response = await API.clients.getAll();
        if (response.success) {
            clients = response.data.clients || response.data || [];
        }
    } catch (error) {
        console.error('Erreur lors du chargement des clients:', error);
    }
};

const loadStatuts = async () => {
    try {
        const response = await API.statuts.getAll();
        if (response.success) {
            statuts = response.data.statuts || response.data || [];
        }
    } catch (error) {
        console.error('Erreur lors du chargement des statuts:', error);
    }
};

const loadDepots = async (filters = {}) => {
    try {
        const response = await API.depots.getAll(filters);
        if (response.success) {
            depots = response.data.depots || response.data || [];
            if (currentTab === 'depots') {
                updateDepotsTable(depots);
            }
        }
    } catch (error) {
        console.error('Erreur lors du chargement des dépôts:', error);
    }
};

const loadDashboardData = async () => {
    try {
        const response = await API.stats.getDashboard();
        if (response.success) {
            updateDashboardStats(response.data);
        }
    } catch (error) {
        console.error('Erreur lors du chargement du tableau de bord:', error);
    }
};

const populateSelects = () => {
    populateClientSelects();
    populateStatusSelects();
};

const populateClientSelects = () => {
    const selects = document.querySelectorAll('select[name="client_id"], #client-filter, #archive-client-filter');
    
    selects.forEach(select => {
        const firstOption = select.querySelector('option[value=""]');
        select.innerHTML = '';
        if (firstOption) {
            select.appendChild(firstOption);
        }
        
        clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = `${client.prenom} ${client.nom}`;
            select.appendChild(option);
        });
    });
};

const populateStatusSelects = () => {
    const selects = document.querySelectorAll('select[name="status_id"], #status-filter');
    
    selects.forEach(select => {
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
    });
};

const switchTab = async (tabName) => {
    if (!tabName || currentTab === tabName) return;
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeNavItem = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const activeTabContent = document.getElementById(`${tabName}-tab`);
    if (activeTabContent) {
        activeTabContent.classList.add('active');
    }

    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
        const titles = {
            dashboard: 'Tableau de bord',
            depots: 'Gestion des Dépôts',
            clients: 'Gestion des Clients',
            archives: 'Archives',
            statuts: 'Gestion des Statuts'
        };
        pageTitle.textContent = titles[tabName] || 'Application';
    }
    
    currentTab = tabName;
    await loadTabContent(tabName);
};

const loadTabContent = async (tabName) => {
    try {
        switch (tabName) {
            case 'dashboard':
                await loadDashboardData();
                break;
            case 'depots':
                await loadDepots();
                break;
            case 'clients':
                updateClientsTable(clients);
                break;
            case 'statuts':
                updateStatutsTable(statuts);
                break;
        }
    } catch (error) {
        console.error(`Erreur lors du chargement de l'onglet ${tabName}:`, error);
        showNotification('Erreur lors du chargement des données', 'error');
    }
};

const updateDashboardStats = (stats) => {
    const updateElement = (id, value) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value || 0;
        }
    };
    
    updateElement('total-depots', stats.totalDepots);
    updateElement('total-clients', stats.totalClients);
    updateElement('depots-termines', stats.depotsTermines);
    updateElement('depots-en-cours', stats.depotsEnCours);
    updateElement('depots-en-retard', stats.depotsEnRetard);
    
    updateColorLegend();
    updateRecentActivity(stats.recentActivity || []);
};

const updateColorLegend = () => {
    const legendContainer = document.getElementById('color-legend');
    if (!legendContainer) return;
    
    legendContainer.innerHTML = '';
    
    statuts.forEach(status => {
        const count = depots.filter(d => d.status_id === status.id).length;
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `
            <div class="legend-color" style="background-color: ${status.couleur_hex || '#cccccc'}"></div>
            <div class="legend-text">
                <div class="legend-name">${status.nom} (${count})</div>
                <div class="legend-action">${status.action || 'Aucune action'}</div>
            </div>
        `;
        legendContainer.appendChild(legendItem);
    });
};

const updateRecentActivity = (activities) => {
    const activityContainer = document.getElementById('recent-activity');
    if (!activityContainer) return;
    
    if (!activities || activities.length === 0) {
        activityContainer.innerHTML = '<p class="text-muted text-center">Aucune activité récente</p>';
        return;
    }
    
    activityContainer.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas fa-${activity.icon || 'info-circle'}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-text">${activity.text || 'Activité'}</div>
                <div class="activity-time">${formatDate(activity.date)}</div>
            </div>
        </div>
    `).join('');
};

const updateDepotsTable = (depotsList) => {
    const tableBody = document.querySelector('#depots-table tbody');
    if (!tableBody) return;
    
    if (!depotsList || depotsList.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Aucun dépôt trouvé</td></tr>';
        return;
    }
    
    tableBody.innerHTML = depotsList.map(depot => {
        const client = clients.find(c => c.id === depot.client_id);
        const status = statuts.find(s => s.id === depot.status_id);
        
        return `
            <tr>
                <td><strong>#${depot.id.toString().padStart(4, '0')}</strong></td>
                <td>${client ? `${client.prenom} ${client.nom}` : 'Client inconnu'}</td>
                <td>
                    <div style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${depot.description}
                    </div>
                </td>
                <td>
                    <span class="status-badge" style="background-color: ${status?.couleur_hex || '#cccccc'}">
                        ${status?.nom || 'Statut inconnu'}
                    </span>
                </td>
                <td>${formatDateShort(depot.date_depot)}</td>
                <td>${formatDateShort(depot.date_prevue)}</td>
                <td>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-info" onclick="generateDepotPDF(${depot.id})" title="Générer PDF">
                            <i class="fas fa-file-pdf"></i>
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="editDepot(${depot.id})" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteDepot(${depot.id})" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="archiveDepot(${depot.id})" title="Archiver">
                            <i class="fas fa-archive"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
};

const updateClientsTable = (clientsList) => {
    const tableBody = document.querySelector('#clients-table tbody');
    if (!tableBody) return;
    
    if (!clientsList || clientsList.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Aucun client trouvé</td></tr>';
        return;
    }
    
    tableBody.innerHTML = clientsList.map(client => `
        <tr>
            <td>${client.id}</td>
            <td><strong>${client.prenom} ${client.nom}</strong></td>
            <td>${client.email || 'Non renseigné'}</td>
            <td>${client.telephone || 'Non renseigné'}</td>
            <td>
                <div class="d-flex gap-2">
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

const updateStatutsTable = (statusList) => {
    const tableBody = document.querySelector('#statuts-table tbody');
    if (!tableBody) return;
    
    if (!statusList || statusList.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Aucun statut trouvé</td></tr>';
        return;
    }
    
    tableBody.innerHTML = statusList.map(status => `
        <tr>
            <td>${status.id}</td>
            <td>
                <div class="legend-color" style="background-color: ${status.couleur_hex || '#cccccc'}; width: 20px; height: 20px; border-radius: 50%; display: inline-block;"></div>
            </td>
            <td><strong>${status.nom}</strong></td>
            <td>${status.action || ''}</td>
            <td>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-primary" onclick="editStatus(${status.id})" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteStatus(${status.id})" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
};

const setupSearchListeners = () => {
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
                timeout = setTimeout(() => handler(e.target.value), 300);
            });
        }
    });
};

const handleDepotSearch = (searchTerm) => {
    const filters = { search: searchTerm };
    loadDepots(filters);
};

const handleClientSearch = (searchTerm) => {
    console.log('Recherche client:', searchTerm);
};

const handleArchiveSearch = (searchTerm) => {
    console.log('Recherche archive:', searchTerm);
};

const handleCreateDepot = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const depotData = {
        client_id: formData.get('client_id'),
        status_id: formData.get('status_id'),
        description: formData.get('description'),
        notes: formData.get('notes'),
        date_depot: formData.get('date_depot'),
        date_prevue: formData.get('date_prevue')
    };
    
    showLoadingOverlay();
    
    try {
        const response = await API.depots.create(depotData);
        if (response.success) {
            showNotification('Dépôt créé avec succès', 'success');
            resetDepotForm();
            if (currentTab === 'depots') {
                await loadDepots();
            } else if (currentTab === 'dashboard') {
                await loadDashboardData();
            }
        } else {
            showNotification(response.error || 'Erreur lors de la création', 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la création du dépôt:', error);
        showNotification('Erreur: ' + error.message, 'error');
    } finally {
        hideLoadingOverlay();
    }
};

const handleCreateClient = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const clientData = {
        prenom: formData.get('prenom'),
        nom: formData.get('nom'),
        email: formData.get('email'),
        telephone: formData.get('telephone')
    };
    
    try {
        const response = await API.clients.create(clientData);
        if (response.success) {
            showNotification('Client créé avec succès', 'success');
            e.target.reset();
            await loadClients();
            populateClientSelects();
            if (currentTab === 'clients') {
                updateClientsTable(clients);
            }
        } else {
            showNotification(response.error || 'Erreur lors de la création', 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la création du client:', error);
        showNotification('Erreur: ' + error.message, 'error');
    }
};

const handleCreateStatus = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const statusData = {
        nom: formData.get('nom'),
        couleur_hex: formData.get('couleur_hex'),
        action: formData.get('action')
    };
    
    try {
        const response = await API.statuts.create(statusData);
        if (response.success) {
            showNotification('Statut créé avec succès', 'success');
            e.target.reset();
            await loadStatuts();
            populateStatusSelects();
            if (currentTab === 'statuts') {
                updateStatutsTable(statuts);
            }
        } else {
            showNotification(response.error || 'Erreur lors de la création', 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la création du statut:', error);
        showNotification('Erreur: ' + error.message, 'error');
    }
};

// Actions sur les dépôts
const generateDepotPDF = (id) => {
    const depot = depots.find(d => d.id === id);
    if (!depot) {
        showNotification('Dépôt non trouvé', 'error');
        return;
    }

    const doc = PDFGenerator.generateDepotReceipt(depot);
    doc.save(`depot-${depot.id}.pdf`);
    showNotification('PDF généré avec succès', 'success');
};

const editDepot = (id) => {
    showNotification('Fonction d\'édition en cours de développement', 'info');
};

const deleteDepot = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce dépôt ?')) return;
    
    try {
        const response = await API.depots.delete(id);
        if (response.success) {
            showNotification('Dépôt supprimé avec succès', 'success');
            await loadDepots();
            await loadDashboardData();
        } else {
            showNotification(response.error || 'Erreur lors de la suppression', 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        showNotification('Erreur: ' + error.message, 'error');
    }
};

const archiveDepot = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir archiver ce dépôt ?')) return;
    
    try {
        const response = await API.depots.archive(id);
        if (response.success) {
            showNotification('Dépôt archivé avec succès', 'success');
            await loadDepots();
            await loadDashboardData();
        } else {
            showNotification(response.error || 'Erreur lors de l\'archivage', 'error');
        }
    } catch (error) {
        console.error('Erreur lors de l\'archivage:', error);
        showNotification('Erreur: ' + error.message, 'error');
    }
};

// Actions sur les clients
const editClient = (id) => {
    showNotification('Fonction d\'édition en cours de développement', 'info');
};

const deleteClient = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return;
    
    try {
        const response = await API.clients.delete(id);
        if (response.success) {
            showNotification('Client supprimé avec succès', 'success');
            await loadClients();
            populateClientSelects();
            if (currentTab === 'clients') {
                updateClientsTable(clients);
            }
        } else {
            showNotification(response.error || 'Erreur lors de la suppression', 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        showNotification('Erreur: ' + error.message, 'error');
    }
};

// Actions sur les statuts
const editStatus = (id) => {
    showNotification('Fonction d\'édition en cours de développement', 'info');
};

const deleteStatus = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce statut ?')) return;
    
    try {
        const response = await API.statuts.delete(id);
        if (response.success) {
            showNotification('Statut supprimé avec succès', 'success');
            await loadStatuts();
            populateStatusSelects();
            if (currentTab === 'statuts') {
                updateStatutsTable(statuts);
            }
        } else {
            showNotification(response.error || 'Erreur lors de la suppression', 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        showNotification('Erreur: ' + error.message, 'error');
    }
};

// Fonctions utilitaires
const resetDepotForm = () => {
    const form = document.getElementById('create-depot-form');
    if (form) {
        form.reset();
        const dateInput = document.getElementById('depot-date');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
    }
};

const refreshDepots = () => {
    loadDepots();
    showNotification('Données actualisées', 'success');
};

const showQuickAdd = () => {
    switchTab('depots');
};

const generateReport = () => {
    showNotification('Génération de rapport en cours de développement', 'info');
};

const showLoadingOverlay = () => {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.remove('hidden');
};

const hideLoadingOverlay = () => {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.add('hidden');
};

const showNotification = (message, type = 'info') => {
    const notificationsContainer = document.getElementById('notifications');
    if (!notificationsContainer) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    notificationsContainer.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
};

const getNotificationIcon = (type) => {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
};

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
        return dateString;
    }
};

const formatDateShort = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    } catch (error) {
        return dateString;
    }
};

const showModal = (title, content) => {
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalOverlay = document.getElementById('modal-overlay');
    
    if (modalTitle) modalTitle.textContent = title;
    if (modalBody) modalBody.innerHTML = content;
    if (modalOverlay) modalOverlay.classList.remove('hidden');
};

const closeModal = () => {
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) modalOverlay.classList.add('hidden');
};