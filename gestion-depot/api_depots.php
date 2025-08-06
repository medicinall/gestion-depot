<?php
/**
 * API REST pour la gestion des dépôts
 * Compatible avec votre base "client" existante
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gestion des requêtes OPTIONS (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Configuration pour votre base existante
$host = 'localhost';
$dbname = 'client';  // VOTRE BASE EXISTANTE
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erreur de connexion à la base de données']);
    exit;
}

// Récupérer la méthode et le chemin
$method = $_SERVER['REQUEST_METHOD'];
$path = isset($_GET['path']) ? $_GET['path'] : '';

// Router simple
switch ($method) {
    case 'GET':
        if ($path === '') {
            // Récupérer tous les dépôts
            getDepots();
        } elseif (is_numeric($path)) {
            // Récupérer un dépôt par ID
            getDepot($path);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Endpoint non trouvé']);
        }
        break;
        
    case 'POST':
        if ($path === '') {
            // Créer un nouveau dépôt
            createDepot();
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Endpoint non trouvé']);
        }
        break;
        
    case 'PUT':
        if (is_numeric($path)) {
            // Mettre à jour un dépôt
            updateDepot($path);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Endpoint non trouvé']);
        }
        break;
        
    case 'DELETE':
        if (is_numeric($path)) {
            // Supprimer un dépôt
            deleteDepot($path);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Endpoint non trouvé']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
        break;
}

/**
 * Vérifier si la table depots existe
 */
function tableExists($pdo, $tableName) {
    try {
        $stmt = $pdo->prepare("SHOW TABLES LIKE :table");
        $stmt->execute([':table' => $tableName]);
        return $stmt->rowCount() > 0;
    } catch (PDOException $e) {
        return false;
    }
}

/**
 * Récupérer tous les dépôts
 */
function getDepots() {
    global $pdo;
    
    try {
        // Vérifier si la table depots existe
        if (!tableExists($pdo, 'depots')) {
            // Retourner des dépôts de démonstration
            $demoDepots = [
                [
                    'id' => 1,
                    'client_id' => 1,
                    'client_nom' => 'Client Démo 1',
                    'description' => 'Ordinateur portable - Problème de démarrage',
                    'notes' => 'Écran noir au démarrage, ventilateur fonctionne',
                    'date_depot' => date('Y-m-d'),
                    'date_prevue' => date('Y-m-d', strtotime('+3 days')),
                    'status_id' => 1,
                    'statut_nom' => 'En attente',
                    'statut_couleur' => '#ffc107'
                ],
                [
                    'id' => 2,
                    'client_id' => 2,
                    'client_nom' => 'Client Démo 2',
                    'description' => 'Smartphone écran cassé',
                    'notes' => 'Chute, écran fissuré mais tactile fonctionne',
                    'date_depot' => date('Y-m-d', strtotime('-1 day')),
                    'date_prevue' => date('Y-m-d', strtotime('+2 days')),
                    'status_id' => 2,
                    'statut_nom' => 'En cours',
                    'statut_couleur' => '#17a2b8'
                ]
            ];
            
            echo json_encode([
                'success' => true,
                'data' => $demoDepots,
                'total' => count($demoDepots),
                'message' => 'Données de démonstration - Table depots non encore créée'
            ]);
            return;
        }
        
        // Si la table existe, récupérer les vrais dépôts
        $search = isset($_GET['search']) ? $_GET['search'] : '';
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
        
        $sql = "
            SELECT 
                d.*,
                c.Nom as client_nom,
                s.nom as statut_nom,
                s.couleur_hex as statut_couleur
            FROM depots d
            LEFT JOIN client c ON d.client_id = c.No
            LEFT JOIN statuts s ON d.status_id = s.id
            WHERE d.archived = 0
        ";
        
        $params = [];
        
        if (!empty($search)) {
            $sql .= " AND (c.Nom LIKE :search OR d.description LIKE :search)";
            $params[':search'] = "%$search%";
        }
        
        $sql .= " ORDER BY d.date_depot DESC LIMIT :limit OFFSET :offset";
        
        $stmt = $pdo->prepare($sql);
        
        foreach ($params as $key => $value) {
            $stmt->bindParam($key, $value);
        }
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        
        $stmt->execute();
        $depots = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Compter le total
        $countSql = "SELECT COUNT(*) FROM depots d WHERE d.archived = 0";
        if (!empty($search)) {
            $countSql .= " AND EXISTS (SELECT 1 FROM client c WHERE c.No = d.client_id AND (c.Nom LIKE :search OR d.description LIKE :search))";
        }
        
        $countStmt = $pdo->prepare($countSql);
        if (!empty($search)) {
            $countStmt->bindParam(':search', $params[':search']);
        }
        $countStmt->execute();
        $total = $countStmt->fetchColumn();
        
        echo json_encode([
            'success' => true,
            'data' => $depots,
            'total' => (int)$total,
            'limit' => $limit,
            'offset' => $offset
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Erreur lors de la récupération des dépôts: ' . $e->getMessage()]);
    }
}

/**
 * Récupérer un dépôt par ID
 */
function getDepot($id) {
    global $pdo;
    
    try {
        if (!tableExists($pdo, 'depots')) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Table depots non encore créée']);
            return;
        }
        
        $stmt = $pdo->prepare("
            SELECT 
                d.*,
                c.Nom as client_nom,
                s.nom as statut_nom,
                s.couleur_hex as statut_couleur
            FROM depots d
            LEFT JOIN client c ON d.client_id = c.No
            LEFT JOIN statuts s ON d.status_id = s.id
            WHERE d.id = :id
        ");
        
        $stmt->execute([':id' => $id]);
        $depot = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($depot) {
            echo json_encode([
                'success' => true,
                'data' => $depot
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Dépôt non trouvé']);
        }
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Erreur lors de la récupération du dépôt: ' . $e->getMessage()]);
    }
}

/**
 * Créer un nouveau dépôt
 */
function createDepot() {
    global $pdo;
    
    try {
        if (!tableExists($pdo, 'depots')) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Table depots non encore créée. Exécutez configure_existing_database.php d\'abord.']);
            return;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Données JSON invalides']);
            return;
        }
        
        // Validation
        if (empty($input['client_id']) || empty($input['description'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Client et description sont obligatoires']);
            return;
        }
        
        $stmt = $pdo->prepare("
            INSERT INTO depots (client_id, description, notes, date_depot, date_prevue, status_id, archived)
            VALUES (:client_id, :description, :notes, :date_depot, :date_prevue, :status_id, 0)
        ");
        
        $stmt->execute([
            ':client_id' => $input['client_id'],
            ':description' => $input['description'],
            ':notes' => $input['notes'] ?? '',
            ':date_depot' => $input['date_depot'] ?? date('Y-m-d'),
            ':date_prevue' => $input['date_prevue'] ?? null,
            ':status_id' => $input['status_id'] ?? 1
        ]);
        
        $newId = $pdo->lastInsertId();
        
        // Récupérer le dépôt créé
        $stmt = $pdo->prepare("
            SELECT 
                d.*,
                c.Nom as client_nom,
                s.nom as statut_nom,
                s.couleur_hex as statut_couleur
            FROM depots d
            LEFT JOIN client c ON d.client_id = c.No
            LEFT JOIN statuts s ON d.status_id = s.id
            WHERE d.id = :id
        ");
        
        $stmt->execute([':id' => $newId]);
        $newDepot = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => $newDepot,
            'message' => 'Dépôt créé avec succès'
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Erreur lors de la création du dépôt: ' . $e->getMessage()]);
    }
}

/**
 * Mettre à jour un dépôt
 */
function updateDepot($id) {
    global $pdo;
    
    try {
        if (!tableExists($pdo, 'depots')) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Table depots non encore créée']);
            return;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Données JSON invalides']);
            return;
        }
        
        // Vérifier que le dépôt existe
        $stmt = $pdo->prepare("SELECT id FROM depots WHERE id = :id");
        $stmt->execute([':id' => $id]);
        
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Dépôt non trouvé']);
            return;
        }
        
        $stmt = $pdo->prepare("
            UPDATE depots SET 
                client_id = :client_id,
                description = :description,
                notes = :notes,
                date_depot = :date_depot,
                date_prevue = :date_prevue,
                status_id = :status_id,
                updated_at = NOW()
            WHERE id = :id
        ");
        
        $stmt->execute([
            ':id' => $id,
            ':client_id' => $input['client_id'],
            ':description' => $input['description'],
            ':notes' => $input['notes'] ?? '',
            ':date_depot' => $input['date_depot'],
            ':date_prevue' => $input['date_prevue'] ?? null,
            ':status_id' => $input['status_id']
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Dépôt mis à jour avec succès'
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Erreur lors de la mise à jour du dépôt: ' . $e->getMessage()]);
    }
}

/**
 * Supprimer un dépôt
 */
function deleteDepot($id) {
    global $pdo;
    
    try {
        if (!tableExists($pdo, 'depots')) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Table depots non encore créée']);
            return;
        }
        
        $stmt = $pdo->prepare("DELETE FROM depots WHERE id = :id");
        $stmt->execute([':id' => $id]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Dépôt supprimé avec succès'
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Dépôt non trouvé']);
        }
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Erreur lors de la suppression du dépôt: ' . $e->getMessage()]);
    }
}
?>