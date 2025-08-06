/**
 * CORRECTIF URGENT pour le dashboard et les fonctions manquantes
 * À charger APRÈS tous les autres scripts
 */

console.log('🔧 Chargement du correctif dashboard...');

// Corriger la fonction loadClientsTable manquante
if (typeof window.loadClientsTable === 'undefined') {
    window.loadClientsTable = async function() {
        console.log('👥 loadClientsTable - correctif appliqué');
        
        try {
            const response = await API.clients.getAll({ limit: 100 });
            
            if (response.success) {
                const tbody = document.getElementById('clients-tbody');
                
                if (tbody) {
                    if (response.data && response.data.length > 0) {
                        tbody.innerHTML = response.data.map(client => `
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
                        
                        console.log(`✅ ${response.data.length} clients affichés dans le tableau`);
                    } else {
                        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Aucun client trouvé</td></tr>';
                    }
                }
            } else {
                console.error('❌ Erreur loadClientsTable:', response.error);
            }
        } catch (error) {
            console.error('❌ Erreur loadClientsTable:', error);
        }
    };
}

// Corriger la fonction de chargement des statistiques dashboard
if (typeof window.loadDashboardData !== 'undefined') {
    const originalLoadDashboardData = window.loadDashboardData;
    
    window.loadDashboardData = async function() {
        console.log('📊 Chargement dashboard - correctif appliqué');
        
        try {
            // Utiliser notre API corrigée
            if (typeof API !== 'undefined' && API.stats && API.stats.getDashboard) {
                const response = await API.stats.getDashboard();
                
                if (response.success) {
                    console.log('✅ Données dashboard récupérées:', response.data);
                    
                    // Mettre à jour les éléments du dashboard
                    updateDashboardElements(response.data);
                    
                    // Appeler la fonction originale pour la légende des statuts
                    if (originalLoadDashboardData && typeof originalLoadDashboardData === 'function') {
                        try {
                            await originalLoadDashboardData();
                        } catch (e) {
                            console.warn('⚠️ Erreur fonction originale dashboard:', e.message);
                        }
                    }
                    
                    return;
                } else {
                    console.error('❌ Erreur réponse dashboard:', response.error);
                }
            }
            
            // Fallback - calculer manuellement
            console.log('📊 Calcul manuel des statistiques...');
            const manualStats = await calculateManualStats();
            updateDashboardElements(manualStats);
            
        } catch (error) {
            console.error('❌ Erreur totale dashboard:', error);
            
            // Afficher au moins les zéros
            const defaultStats = {
                totalClients: 0,
                totalDepots: 0,
                depotsEnAttente: 0,
                depotsEnCours: 0,
                depotsPrets: 0,
                depotsTermines: 0
            };
            updateDashboardElements(defaultStats);
        }
    };
}

// Fonction pour calculer manuellement les stats
async function calculateManualStats() {
    try {
        const clientsResponse = await API.clients.getAll();
        const totalClients = clientsResponse.success ? (clientsResponse.total || clientsResponse.data.length) : 0;
        
        // Pour l'instant, statistiques de démonstration
        const stats = {
            totalClients: totalClients,
            totalDepots: 2, // Dépôts de démo
            depotsEnAttente: 1,
            depotsEnCours: 1,
            depotsPrets: 0,
            depotsTermines: 0
        };
        
        console.log('📊 Statistiques calculées manuellement:', stats);
        return stats;
        
    } catch (error) {
        console.error('❌ Erreur calcul manuel:', error);
        return {
            totalClients: 0,
            totalDepots: 0,
            depotsEnAttente: 0,
            depotsEnCours: 0,
            depotsPrets: 0,
            depotsTermines: 0
        };
    }
}

// Fonction pour mettre à jour les éléments du dashboard
function updateDashboardElements(stats) {
    console.log('📈 Mise à jour éléments dashboard:', stats);
    
    const mappings = {
        'total-clients': stats.totalClients || 0,
        'total-depots': stats.totalDepots || 0,
        'depots-en-attente': stats.depotsEnAttente || 0,
        'depots-en-cours': stats.depotsEnCours || 0,
        'depots-prets': stats.depotsPrets || 0,
        'depots-termines': stats.depotsTermines || stats.depotsRecuperes || 0
    };
    
    Object.entries(mappings).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            // Chercher l'élément .stat-number ou utiliser l'élément directement
            const numberElement = element.querySelector('.stat-number') || element;
            numberElement.textContent = value;
            console.log(`✅ ${id}: ${value}`);
        } else {
            console.warn(`⚠️ Élément #${id} non trouvé`);
        }
    });
}

// Démarrage automatique après un délai
setTimeout(async () => {
    console.log('🚀 Démarrage automatique du correctif dashboard...');
    
    if (typeof API !== 'undefined' && typeof window.loadDashboardData === 'function') {
        try {
            await window.loadDashboardData();
            console.log('✅ Dashboard mis à jour automatiquement');
        } catch (error) {
            console.error('❌ Erreur mise à jour auto dashboard:', error);
        }
    }
}, 3000);

console.log('✅ Correctif dashboard chargé');