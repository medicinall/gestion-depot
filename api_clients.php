<?php
/**
 * API REST pour la gestion des clients
 * Gestion des Dépôts - Version MySQL
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gestion des requêtes OPTIONS (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Configuration de la base de données
$host = 'localhost';
$dbname = 'gestion_depots';
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
$pathParts = array_filter(explode('/', $path));

// Router principal
try {
    switch ($method) {
        case 'GET':
            if (empty($pathParts) || $pathParts[0] === 'clients') {
                if (isset($pathParts[1])) {
                    // GET /clients/{id}
                    getClient($pdo, (int)$pathParts[1]);
                } else {
                    // GET /clients
                    getAllClients($pdo);
                }
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Endpoint non trouvé']);
            }
            break;
            
        case 'POST':
            if ($pathParts[0] === 'clients') {
                // POST /clients
                $input = json_decode(file_get_contents('php://input'), true);
                createClient($pdo, $input);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Endpoint non trouvé']);
            }
            break;
            
        case 'PUT':
            if ($pathParts[0] === 'clients' && isset($pathParts[1])) {
                // PUT /clients/{id}
                $input = json_decode(file_get_contents('php://input'), true);
                updateClient($pdo, (int)$pathParts[1], $input);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Endpoint non trouvé']);
            }
            break;
            
        case 'DELETE':
            if ($pathParts[0] === 'clients' && isset($pathParts[1])) {
                // DELETE /clients/{id}
                deleteClient($pdo, (int)$pathParts[1]);
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
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erreur serveur: ' . $e->getMessage()]);
}

/**
 * Récupérer tous les clients
 */
function getAllClients($pdo) {
    try {
        $stmt = $pdo->prepare("
            SELECT 
                c.*,
                COUNT(d.id) as total_depots,
                COUNT(CASE WHEN d.archived = 0 THEN 1 END) as depots_actifs
            FROM clients c
            LEFT JOIN depots d ON c.id = d.client_id
            GROUP BY c.id
            ORDER BY c.nom, c.prenom
        ");
        
        $stmt->execute();
        $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => [
                'clients' => $clients,
                'total' => count($clients)
            ]
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Erreur lors du chargement des clients: ' . $e->getMessage()]);
    }
}

/**
 * Récupérer un client par ID
 */
function getClient($pdo, $id) {
    try {
        $stmt = $pdo->prepare("
            SELECT 
                c.*,
                COUNT(d.id) as total_depots,
                COUNT(CASE WHEN d.archived = 0 THEN 1 END) as depots_actifs
            FROM clients c
            LEFT JOIN depots d ON c.id = d.client_id
            WHERE c.id = :id
            GROUP BY c.id
        ");
        
        $stmt->execute([':id' => $id]);
        $client = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$client) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Client non trouvé']);
            return;
        }
        
        echo json_encode([
            'success' => true,
            'data' => $client
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Erreur lors du chargement du client: ' . $e->getMessage()]);
    }
}

/**
 * Créer un nouveau client
 */
function createClient($pdo, $data) {
    try {
        // Validation des données
        if (empty($data['prenom']) || empty($data['nom'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Le prénom et le nom sont obligatoires']);
            return;
        }
        
        // Vérifier si le client existe déjà
        $stmt = $pdo->prepare("SELECT id FROM clients WHERE prenom = :prenom AND nom = :nom");
        $stmt->execute([
            ':prenom' => $data['prenom'],
            ':nom' => $data['nom']
        ]);
        
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Un client avec ce prénom et nom existe déjà']);
            return;
        }
        
        // Validation email
        if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Adresse email invalide']);
            return;
        }
        
        $stmt = $pdo->prepare("
            INSERT INTO clients (prenom, nom, email, telephone, adresse, code_postal, ville, created_at, updated_at)
            VALUES (:prenom, :nom, :email, :telephone, :adresse, :code_postal, :ville, NOW(), NOW())
        ");
        
        $stmt->execute([
            ':prenom' => $data['prenom'],
            ':nom' => $data['nom'],
            ':email' => $data['email'] ?? null,
            ':telephone' => $data['telephone'] ?? null,
            ':adresse' => $data['adresse'] ?? null,
            ':code_postal' => $data['code_postal'] ?? null,
            ':ville' => $data['ville'] ?? null
        ]);
        
        $clientId = $pdo->lastInsertId();
        
        // Récupérer le client créé
        $stmt = $pdo->prepare("SELECT * FROM clients WHERE id = :id");
        $stmt->execute([':id' => $clientId]);
        $client = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => $client,
            'message' => 'Client créé avec succès'
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Erreur lors de la création du client: ' . $e->getMessage()]);
    }
}

/**
 * Mettre à jour un client
 */
function updateClient($pdo, $id, $data) {
    try {
        // Vérifier que le client existe
        $stmt = $pdo->prepare("SELECT id FROM clients WHERE id = :id");
        $stmt->execute([':id' => $id]);
        
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Client non trouvé']);
            return;
        }
        
        // Validation des données
        if (empty($data['prenom']) || empty($data['nom'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Le prénom et le nom sont obligatoires']);
            return;
        }
        
        // Vérifier si un autre client a déjà ce prénom/nom
        $stmt = $pdo->prepare("SELECT id FROM clients WHERE prenom = :prenom AND nom = :nom AND id != :id");
        $stmt->execute([
            ':prenom' => $data['prenom'],
            ':nom' => $data['nom'],
            ':id' => $id
        ]);
        
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Un autre client avec ce prénom et nom existe déjà']);
            return;
        }
        
        // Validation email
        if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Adresse email invalide']);
            return;
        }
        
        $stmt = $pdo->prepare("
            UPDATE clients 
            SET prenom = :prenom, nom = :nom, email = :email, telephone = :telephone, 
                adresse = :adresse, code_postal = :code_postal, ville = :ville, updated_at = NOW()
            WHERE id = :id
        ");
        
        $stmt->execute([
            ':id' => $id,
            ':prenom' => $data['prenom'],
            ':nom' => $data['nom'],
            ':email' => $data['email'] ?? null,
            ':telephone' => $data['telephone'] ?? null,
            ':adresse' => $data['adresse'] ?? null,
            ':code_postal' => $data['code_postal'] ?? null,
            ':ville' => $data['ville'] ?? null
        ]);
        
        // Récupérer le client mis à jour
        $stmt = $pdo->prepare("SELECT * FROM clients WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $client = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => $client,
            'message' => 'Client mis à jour avec succès'
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Erreur lors de la mise à jour du client: ' . $e->getMessage()]);
    }
}

/**
 * Supprimer un client
 */
function deleteClient($pdo, $id) {
    try {
        // Commencer une transaction
        $pdo->beginTransaction();
        
        // Vérifier que le client existe
        $stmt = $pdo->prepare("SELECT prenom, nom FROM clients WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $client = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$client) {
            $pdo->rollBack();
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Client non trouvé']);
            return;
        }
        
        // Vérifier s'il y a des dépôts associés
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM depots WHERE client_id = :id");
        $stmt->execute([':id' => $id]);
        $depotCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        if ($depotCount > 0) {
            // Supprimer d'abord tous les dépôts associés
            $stmt = $pdo->prepare("DELETE FROM depots WHERE client_id = :id");
            $stmt->execute([':id' => $id]);
        }
        
        // Supprimer le client
        $stmt = $pdo->prepare("DELETE FROM clients WHERE id = :id");
        $stmt->execute([':id' => $id]);
        
        // Valider la transaction
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Client "' . $client['prenom'] . ' ' . $client['nom'] . '" supprimé avec succès' . 
                        ($depotCount > 0 ? " (ainsi que $depotCount dépôt(s) associé(s))" : ''),
            'deleted_depots' => $depotCount
        ]);
        
    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Erreur lors de la suppression du client: ' . $e->getMessage()]);
    }
}
?>