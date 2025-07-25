#!/bin/bash

# 🚀 START NOW - Démarrage Ultra Rapide (30 secondes)
# Pour tester immédiatement sans configuration

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "┌─────────────────────────────────────────────┐"
echo "│          🚀 START NOW - 30 SECONDES        │"
echo "│     Démarrage Ultra Rapide pour Tester     │"
echo "└─────────────────────────────────────────────┘"
echo -e "${NC}"

# Vérifier PHP
if ! command -v php &> /dev/null; then
    echo -e "${YELLOW}⚠️  PHP non trouvé, installation rapide...${NC}"
    
    # Auto-détecter et installer PHP
    if command -v apt &> /dev/null; then
        sudo apt update && sudo apt install -y php php-sqlite3
    elif command -v dnf &> /dev/null; then
        sudo dnf install -y php php-pdo
    elif command -v pacman &> /dev/null; then
        sudo pacman -S php php-sqlite
    else
        echo "❌ Installez PHP manuellement et relancez ce script"
        exit 1
    fi
fi

echo -e "${GREEN}✅ PHP détecté${NC}"

# Créer la base SQLite avec données de test
echo -e "${BLUE}📊 Création de la base avec données de test...${NC}"

sqlite3 depot_manager.db << 'EOF'
-- Structure des tables
CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100),
    email VARCHAR(150),
    telephone VARCHAR(20),
    adresse VARCHAR(255),
    code_postal VARCHAR(10),
    ville VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS statuts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom VARCHAR(50) NOT NULL UNIQUE,
    couleur_hex VARCHAR(7) DEFAULT '#3498db',
    ordre INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS depots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_depot VARCHAR(20) UNIQUE,
    client_id INTEGER,
    status_id INTEGER DEFAULT 1,
    description TEXT,
    notes TEXT,
    date_depot DATE DEFAULT CURRENT_DATE,
    date_prevue DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (status_id) REFERENCES statuts(id)
);

-- Données de test
INSERT OR REPLACE INTO statuts (id, nom, couleur_hex, ordre) VALUES 
(1, 'En attente', '#f39c12', 1),
(2, 'En cours', '#3498db', 2),
(3, 'Terminé', '#27ae60', 3),
(4, 'Livré', '#2ecc71', 4),
(5, 'Annulé', '#e74c3c', 5);

INSERT OR REPLACE INTO clients (id, nom, prenom, email, telephone, adresse, code_postal, ville) VALUES 
(1, 'TRENCHARD', 'Clement', 'trenchard.clement@yahoo.fr', '06.72.63.01.00', '57 rue saint nicolas', '76000', 'Rouen'),
(2, 'LEFEBVRE', 'Jean', 'j.lefebvre@email.com', '02.35.76.15.09', '3, rue du Maréchal Juin', '76960', 'Notre Dame de Bondeville'),
(3, 'LEMATTRE', 'Pierre', 'p.lemattre@email.com', '02.35.78.09.86', '180 rue du général de gaulle', '76770', 'Le Houlme'),
(4, 'VILPOIX', 'Alain', 'vilpoixalain@free.fr', '02.35.33.20.24', '1997 route du bois Ricard', '76360', 'Pissy Poville'),
(5, 'REMILLY', 'Odette', 'gerard.remilly0667@orange.fr', '02.32.80.28.24', '24 impasse des prairies', '76690', 'Fontaine le Bourg');

INSERT OR REPLACE INTO depots (id, numero_depot, client_id, status_id, description, notes, date_depot, date_prevue) VALUES 
(1, 'DEP-2025-001', 1, 1, 'Réparation ordinateur portable ASUS X550', 'Écran cassé, disque dur à vérifier, sauvegarde données', date('now'), date('now', '+3 days')),
(2, 'DEP-2025-002', 2, 2, 'Récupération données disque dur externe', 'Disque dur externe 1TB Western Digital, ne démarre plus', date('now', '-1 day'), date('now', '+1 day')),
(3, 'DEP-2025-003', 3, 3, 'Installation Windows 11 + Office', 'PC assemblé neuf, installation complète avec transfert de données', date('now', '-2 days'), date('now')),
(4, 'DEP-2025-004', 4, 2, 'Réparation imprimante HP LaserJet', 'Bourrage papier récurrent, nettoyage et réparation', date('now', '-1 day'), date('now', '+2 days')),
(5, 'DEP-2025-005', 5, 1, 'Diagnostic PC lent', 'PC très lent au démarrage, probable virus ou problème hardware', date('now'), date('now', '+1 day'));
EOF

echo -e "${GREEN}✅ Base créée avec 5 clients et 5 dépôts de test${NC}"

# Créer la configuration
cat > config.php << 'EOF'
<?php
// Configuration ultra rapide SQLite
$dbConfig = [
    'dsn' => 'sqlite:depot_manager.db',
    'type' => 'sqlite'
];

define('QUICK_START', true);
define('APP_URL', 'http://localhost:8000');

$companyConfig = [
    'nom' => 'WEB INFORMATIQUE',
    'adresse' => '154 bis rue du général de Gaulle',
    'telephone' => '06.99.50.76.76',
    'email' => 'contact@webinformatique.eu'
];
?>
EOF

# Créer l'API simplifiée
cat > api.php << 'EOF'
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require_once 'config.php';

try {
    $pdo = new PDO($dbConfig['dsn']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? '/';
$segments = array_filter(explode('/', trim($path, '/')));
$resource = $segments[0] ?? '';
$id = $segments[1] ?? null;

function sendResponse($success, $data = null, $error = null) {
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'error' => $error
    ]);
    exit;
}

switch ($resource) {
    case 'clients':
        switch ($method) {
            case 'GET':
                if ($id) {
                    $stmt = $pdo->prepare("SELECT * FROM clients WHERE id = ?");
                    $stmt->execute([$id]);
                    $client = $stmt->fetch(PDO::FETCH_ASSOC);
                    sendResponse(!!$client, $client, $client ? null : 'Client non trouvé');
                } else {
                    $stmt = $pdo->query("SELECT * FROM clients ORDER BY nom, prenom");
                    $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    sendResponse(true, $clients);
                }
                break;
                
            case 'POST':
                $data = json_decode(file_get_contents('php://input'), true);
                $required = ['nom'];
                foreach ($required as $field) {
                    if (empty($data[$field])) {
                        sendResponse(false, null, "Le champ $field est requis");
                    }
                }
                
                $stmt = $pdo->prepare("
                    INSERT INTO clients (nom, prenom, email, telephone, adresse, code_postal, ville, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
                ");
                $stmt->execute([
                    $data['nom'],
                    $data['prenom'] ?? '',
                    $data['email'] ?? '',
                    $data['telephone'] ?? '',
                    $data['adresse'] ?? '',
                    $data['code_postal'] ?? '',
                    $data['ville'] ?? ''
                ]);
                
                $newId = $pdo->lastInsertId();
                $stmt = $pdo->prepare("SELECT * FROM clients WHERE id = ?");
                $stmt->execute([$newId]);
                $client = $stmt->fetch(PDO::FETCH_ASSOC);
                
                sendResponse(true, $client);
                break;
        }
        break;
        
    case 'depots':
        switch ($method) {
            case 'GET':
                if ($id) {
                    $stmt = $pdo->prepare("
                        SELECT d.*, c.nom as client_nom, c.prenom as client_prenom, 
                               c.telephone as client_telephone, c.email as client_email,
                               s.nom as status_nom, s.couleur_hex 
                        FROM depots d 
                        LEFT JOIN clients c ON d.client_id = c.id 
                        LEFT JOIN statuts s ON d.status_id = s.id 
                        WHERE d.id = ?
                    ");
                    $stmt->execute([$id]);
                    $depot = $stmt->fetch(PDO::FETCH_ASSOC);
                    sendResponse(!!$depot, $depot, $depot ? null : 'Dépôt non trouvé');
                } else {
                    $stmt = $pdo->query("
                        SELECT d.*, c.nom as client_nom, c.prenom as client_prenom, 
                               s.nom as status_nom, s.couleur_hex 
                        FROM depots d 
                        LEFT JOIN clients c ON d.client_id = c.id 
                        LEFT JOIN statuts s ON d.status_id = s.id 
                        ORDER BY d.created_at DESC
                    ");
                    $depots = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    sendResponse(true, $depots);
                }
                break;
                
            case 'POST':
                $data = json_decode(file_get_contents('php://input'), true);
                $required = ['client_id', 'description'];
                foreach ($required as $field) {
                    if (empty($data[$field])) {
                        sendResponse(false, null, "Le champ $field est requis");
                    }
                }
                
                // Générer numéro de dépôt
                $stmt = $pdo->query("SELECT COUNT(*) + 1 as next_num FROM depots WHERE date_depot = date('now')");
                $nextNum = $stmt->fetch(PDO::FETCH_ASSOC)['next_num'];
                $numeroDepot = 'DEP-' . date('Y') . '-' . str_pad($nextNum, 3, '0', STR_PAD_LEFT);
                
                $stmt = $pdo->prepare("
                    INSERT INTO depots (numero_depot, client_id, status_id, description, notes, date_depot, date_prevue, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, date('now'), ?, datetime('now'), datetime('now'))
                ");
                $stmt->execute([
                    $numeroDepot,
                    $data['client_id'],
                    $data['status_id'] ?? 1,
                    $data['description'],
                    $data['notes'] ?? '',
                    $data['date_prevue'] ?? date('Y-m-d', strtotime('+3 days'))
                ]);
                
                $newId = $pdo->lastInsertId();
                $stmt = $pdo->prepare("
                    SELECT d.*, c.nom as client_nom, c.prenom as client_prenom, 
                           s.nom as status_nom, s.couleur_hex 
                    FROM depots d 
                    LEFT JOIN clients c ON d.client_id = c.id 
                    LEFT JOIN statuts s ON d.status_id = s.id 
                    WHERE d.id = ?
                ");
                $stmt->execute([$newId]);
                $depot = $stmt->fetch(PDO::FETCH_ASSOC);
                
                sendResponse(true, $depot);
                break;
        }
        break;
        
    case 'statuts':
        if ($method === 'GET') {
            $stmt = $pdo->query("SELECT * FROM statuts ORDER BY ordre");
            $statuts = $stmt->fetchAll(PDO::FETCH_ASSOC);
            sendResponse(true, $statuts);
        }
        break;
        
    case 'stats':
        if ($method === 'GET') {
            $stats = [];
            
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM clients");
            $stats['clients'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
            
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM depots");
            $stats['depots'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
            
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM depots WHERE status_id = 1");
            $stats['en_attente'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
            
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM depots WHERE status_id = 2");
            $stats['en_cours'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
            
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM depots WHERE status_id = 3");
            $stats['termines'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
            
            sendResponse(true, $stats);
        }
        break;
        
    case 'test':
        sendResponse(true, [
            'message' => 'API fonctionne parfaitement !',
            'timestamp' => date('Y-m-d H:i:s'),
            'database' => 'SQLite connectée',
            'php_version' => PHP_VERSION
        ]);
        break;
        
    default:
        http_response_code(404);
        sendResponse(false, null, 'Endpoint non trouvé. Endpoints disponibles: /clients, /depots, /statuts, /stats, /test');
}
?>
EOF

# Créer l'interface de test
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚀 Gestion des Dépôts - Test Rapide</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; color: white; margin-bottom: 30px; }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
        .success-badge { background: #27ae60; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; margin: 10px; font-weight: bold; box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3); }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 25px; border-radius: 15px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.1); transition: transform 0.3s ease; }
        .stat-card:hover { transform: translateY(-5px); }
        .stat-number { font-size: 3em; font-weight: bold; margin-bottom: 10px; }
        .stat-label { color: #666; font-size: 1.1em; }
        .card { background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-bottom: 30px; overflow: hidden; }
        .card-header { background: linear-gradient(45deg, #3498db, #2ecc71); color: white; padding: 20px; font-size: 1.3em; font-weight: bold; }
        .card-content { padding: 25px; }
        .table { width: 100%; border-collapse: collapse; }
        .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
        .table th { background: #f8f9fa; font-weight: 600; color: #555; }
        .table tr:hover { background: #f8f9fa; }
        .status { padding: 6px 12px; border-radius: 20px; color: white; font-size: 0.85em; font-weight: bold; }
        .loading { text-align: center; padding: 40px; color: #666; }
        .error { background: #e74c3c; color: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .btn { background: linear-gradient(45deg, #3498db, #2ecc71); color: white; padding: 12px 25px; border: none; border-radius: 25px; cursor: pointer; font-size: 1em; font-weight: bold; margin: 10px 5px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3); }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4); }
        .quick-actions { text-align: center; margin: 30px 0; }
        .demo-notice { background: linear-gradient(45deg, #f39c12, #e67e22); color: white; padding: 15px; border-radius: 10px; margin: 20px 0; text-align: center; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Gestion des Dépôts</h1>
            <p>Test Rapide - Réparation Informatique</p>
            <div class="success-badge">✅ Installation réussie en 30 secondes !</div>
            <div class="demo-notice">
                🎯 Mode démonstration avec données de test - Prêt pour vos vrais clients !
            </div>
        </div>

        <div class="stats" id="stats">
            <div class="stat-card">
                <div class="stat-number" style="color: #3498db;" id="stat-clients">-</div>
                <div class="stat-label">Clients</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" style="color: #e74c3c;" id="stat-depots">-</div>
                <div class="stat-label">Dépôts Total</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" style="color: #f39c12;" id="stat-attente">-</div>
                <div class="stat-label">En Attente</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" style="color: #27ae60;" id="stat-termines">-</div>
                <div class="stat-label">Terminés</div>
            </div>
        </div>

        <div class="quick-actions">
            <button class="btn" onclick="testAPI()">🧪 Tester l'API</button>
            <button class="btn" onclick="refreshData()">🔄 Actualiser</button>
            <button class="btn" onclick="window.open('api.php/test', '_blank')">📊 API Test</button>
        </div>

        <div class="card">
            <div class="card-header">📋 Dépôts Actifs (Données de Test)</div>
            <div class="card-content">
                <div id="depots-loading" class="loading">Chargement des dépôts...</div>
                <table class="table" id="depots-table" style="display:none;">
                    <thead>
                        <tr>
                            <th>N° Dépôt</th>
                            <th>Client</th>
                            <th>Description</th>
                            <th>Statut</th>
                            <th>Date Dépôt</th>
                            <th>Date Prévue</th>
                        </tr>
                    </thead>
                    <tbody id="depots-body"></tbody>
                </table>
            </div>
        </div>

        <div class="card">
            <div class="card-header">👥 Clients Enregistrés</div>
            <div class="card-content">
                <div id="clients-loading" class="loading">Chargement des clients...</div>
                <table class="table" id="clients-table" style="display:none;">
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Prénom</th>
                            <th>Email</th>
                            <th>Téléphone</th>
                            <th>Ville</th>
                        </tr>
                    </thead>
                    <tbody id="clients-body"></tbody>
                </table>
            </div>
        </div>
    </div>

    <script>
        let apiUrl = 'api.php';

        function showError(message) {
            console.error(message);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error';
            errorDiv.innerHTML = '❌ ' + message;
            document.querySelector('.container').insertBefore(errorDiv, document.querySelector('.stats'));
            setTimeout(() => errorDiv.remove(), 5000);
        }

        function testAPI() {
            fetch(apiUrl + '/test')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('✅ API Test Réussi!\n\n' + 
                              'Message: ' + data.data.message + '\n' +
                              'Base: ' + data.data.database + '\n' +
                              'PHP: ' + data.data.php_version);
                    } else {
                        alert('❌ Test échoué: ' + data.error);
                    }
                })
                .catch(error => {
                    alert('❌ Erreur de connexion API: ' + error.message);
                });
        }

        function loadStats() {
            fetch(apiUrl + '/stats')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        document.getElementById('stat-clients').textContent = data.data.clients;
                        document.getElementById('stat-depots').textContent = data.data.depots;
                        document.getElementById('stat-attente').textContent = data.data.en_attente;
                        document.getElementById('stat-termines').textContent = data.data.termines;
                    }
                })
                .catch(error => showError('Erreur chargement stats: ' + error.message));
        }

        function loadDepots() {
            fetch(apiUrl + '/depots')
                .then(response => response.json())
                .then(data => {
                    const loading = document.getElementById('depots-loading');
                    const table = document.getElementById('depots-table');
                    const tbody = document.getElementById('depots-body');
                    
                    loading.style.display = 'none';
                    
                    if (data.success && data.data.length > 0) {
                        tbody.innerHTML = '';
                        data.data.forEach(depot => {
                            const row = tbody.insertRow();
                            row.innerHTML = `
                                <td><strong>${depot.numero_depot || 'N/A'}</strong></td>
                                <td>${depot.client_prenom || ''} ${depot.client_nom || 'Client inconnu'}</td>
                                <td>${depot.description || 'Pas de description'}</td>
                                <td><span class="status" style="background:${depot.couleur_hex || '#3498db'}">${depot.status_nom || 'En attente'}</span></td>
                                <td>${depot.date_depot || 'N/A'}</td>
                                <td>${depot.date_prevue || 'N/A'}</td>
                            `;
                        });
                        table.style.display = 'table';
                    } else {
                        loading.innerHTML = 'Aucun dépôt trouvé';
                        loading.style.display = 'block';
                    }
                })
                .catch(error => {
                    document.getElementById('depots-loading').innerHTML = 'Erreur de chargement';
                    showError('Erreur dépôts: ' + error.message);
                });
        }

        function loadClients() {
            fetch(apiUrl + '/clients')
                .then(response => response.json())
                .then(data => {
                    const loading = document.getElementById('clients-loading');
                    const table = document.getElementById('clients-table');
                    const tbody = document.getElementById('clients-body');
                    
                    loading.style.display = 'none';
                    
                    if (data.success && data.data.length > 0) {
                        tbody.innerHTML = '';
                        data.data.forEach(client => {
                            const row = tbody.insertRow();
                            row.innerHTML = `
                                <td><strong>${client.nom || 'N/A'}</strong></td>
                                <td>${client.prenom || 'N/A'}</td>
                                <td>${client.email || 'N/A'}</td>
                                <td>${client.telephone || 'N/A'}</td>
                                <td>${client.ville || 'N/A'}</td>
                            `;
                        });
                        table.style.display = 'table';
                    } else {
                        loading.innerHTML = 'Aucun client trouvé';
                        loading.style.display = 'block';
                    }
                })
                .catch(error => {
                    document.getElementById('clients-loading').innerHTML = 'Erreur de chargement';
                    showError('Erreur clients: ' + error.message);
                });
        }

        function refreshData() {
            // Réinitialiser les affichages
            document.getElementById('depots-loading').style.display = 'block';
            document.getElementById('depots-loading').innerHTML = 'Actualisation...';
            document.getElementById('depots-table').style.display = 'none';
            
            document.getElementById('clients-loading').style.display = 'block';
            document.getElementById('clients-loading').innerHTML = 'Actualisation...';
            document.getElementById('clients-table').style.display = 'none';
            
            // Recharger toutes les données
            loadStats();
            loadDepots();
            loadClients();
        }

        // Charger les données au démarrage
        document.addEventListener('DOMContentLoaded', function() {
            loadStats();
            loadDepots();
            loadClients();
        });
    </script>
</body>
</html>
EOF

echo -e "${GREEN}✅ Interface créée${NC}"

# Créer les dossiers nécessaires
mkdir -p uploads pdf_output logs backups
chmod 755 uploads pdf_output logs backups

echo -e "${GREEN}✅ Dossiers créés${NC}"

# Démarrer le serveur
echo -e "${BLUE}🚀 Démarrage du serveur PHP sur le port 8000...${NC}"

# Vérifier si le port est libre
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 8000 occupé, utilisation du port 8001...${NC}"
    PORT=8001
else
    PORT=8000
fi

# Démarrer le serveur en arrière-plan
php -S localhost:$PORT > server.log 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > server.pid

# Attendre que le serveur démarre
sleep 2

# Vérifier que le serveur fonctionne
if kill -0 $SERVER_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Serveur démarré avec succès !${NC}"
    echo ""
    echo -e "${BLUE}┌─────────────────────────────────────────────┐${NC}"
    echo -e "${BLUE}│              🎉 C'EST PRÊT !                │${NC}"
    echo -e "${BLUE}└─────────────────────────────────────────────┘${NC}"
    echo ""
    echo -e "${GREEN}🌐 Application web :${NC} http://localhost:$PORT"
    echo -e "${GREEN}🧪 Test API :${NC} http://localhost:$PORT/api.php/test"
    echo -e "${GREEN}📊 Statistiques :${NC} http://localhost:$PORT/api.php/stats"
    echo ""
    echo -e "${YELLOW}🛑 Pour arrêter :${NC} kill $SERVER_PID"
    echo -e "${YELLOW}📝 Logs serveur :${NC} tail -f server.log"
    echo ""
    echo -e "${BLUE}💡 Fonctionnalités disponibles :${NC}"
    echo "   • 5 clients de test pré-configurés"
    echo "   • 5 dépôts d'exemple avec différents statuts"
    echo "   • API REST complète (/clients, /depots, /stats)"
    echo "   • Interface moderne et responsive"
    echo "   • Prêt pour l'import de votre client.sql"
    echo ""
    
    # Essayer d'ouvrir le navigateur
    if command -v xdg-open &> /dev/null; then
        echo -e "${GREEN}🚀 Ouverture du navigateur...${NC}"
        xdg-open "http://localhost:$PORT" &
    elif command -v open &> /dev/null; then
        open "http://localhost:$PORT" &
    else
        echo -e "${YELLOW}💻 Ouvrez manuellement :${NC} http://localhost:$PORT"
    fi
    
    echo ""
    echo -e "${GREEN}✨ Testez dès maintenant votre système de gestion !✨${NC}"

else
    echo -e "${RED}❌ Erreur lors du démarrage du serveur${NC}"
    echo "Vérifiez le fichier server.log pour plus de détails"
    exit 1
fi