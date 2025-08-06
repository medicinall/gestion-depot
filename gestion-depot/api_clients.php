<?php
/**
 * API REST adaptée pour votre base "client" existante
 * Gestion des clients avec votre structure de table existante
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
            // Récupérer tous les clients
            getClients();
        } elseif (is_numeric($path)) {
            // Récupérer un client par ID
            getClient($path);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Endpoint non trouvé']);
        }
        break;
        
    case 'POST':
        if ($path === '') {
            // Créer un nouveau client
            createClient();
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Endpoint non trouvé']);
        }
        break;
        
    case 'PUT':
        if (is_numeric($path)) {
            // Mettre à jour un client
            updateClient($path);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Endpoint non trouvé']);
        }
        break;
        
    case 'DELETE':
        if (is_numeric($path)) {
            // Supprimer un client
            deleteClient($path);
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
 * Fonction pour adapter les données de votre table vers l'interface
 */
function adaptClientFromDb($dbRow) {
    // Séparer le nom et prénom si possible
    $fullName = trim($dbRow['Nom'] ?? '');
    $nameParts = explode(' ', $fullName, 2);
    
    return [
        'id' => (int)$dbRow['No'],
        'prenom' => count($nameParts) > 1 ? trim($nameParts[0]) : '',
        'nom' => count($nameParts) > 1 ? trim($nameParts[1]) : $fullName,
        'email' => !empty($dbRow['Mail']) ? $dbRow['Mail'] : null,
        'telephone' => !empty($dbRow['Tel1']) ? $dbRow['Tel1'] : null,
        'telephone2' => !empty($dbRow['Tel2']) ? $dbRow['Tel2'] : null,
        'adresse' => !empty($dbRow['Adresse']) ? $dbRow['Adresse'] : null,
        'code_postal' => !empty($dbRow['CP']) ? (string)$dbRow['CP'] : null,
        'ville' => !empty($dbRow['Ville']) ? $dbRow['Ville'] : null
    ];
}

/**
 * Fonction pour adapter les données de l'interface vers votre table
 */
function adaptClientToDb($clientData) {
    // Combiner prénom et nom
    $nom = trim(($clientData['prenom'] ?? '') . ' ' . ($clientData['nom'] ?? ''));
    
    return [
        'Nom' => $nom,
        'Adresse' => $clientData['adresse'] ?? null,
        'CP' => !empty($clientData['code_postal']) ? (int)$clientData['code_postal'] : null,
        'Ville' => $clientData['ville'] ?? null,
        'Tel1' => $clientData['telephone'] ?? null,
        'Tel2' => $clientData['telephone2'] ?? null,
        'Mail' => $clientData['email'] ?? null
    ];
}

/**
 * Récupérer tous les clients
 */
function getClients() {
    global $pdo;
    
    try {
        $search = isset($_GET['search']) ? $_GET['search'] : '';
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
        
        $sql = "SELECT * FROM client";
        $params = [];
        
        if (!empty($search)) {
            $sql .= " WHERE Nom LIKE :search OR Mail LIKE :search OR Tel1 LIKE :search OR Ville LIKE :search";
            $params[':search'] = "%$search%";
        }
        
        $sql .= " ORDER BY No DESC LIMIT :limit OFFSET :offset";
        
        $stmt = $pdo->prepare($sql);
        
        // Bind des paramètres
        foreach ($params as $key => $value) {
            $stmt->bindParam($key, $value);
        }
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        
        $stmt->execute();
        $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Adapter les données pour l'interface
        $adaptedClients = array_map('adaptClientFromDb', $clients);
        
        // Compter le total pour la pagination
        $countSql = "SELECT COUNT(*) FROM client";
        if (!empty($search)) {
            $countSql .= " WHERE Nom LIKE :search OR Mail LIKE :search OR Tel1 LIKE :search OR Ville LIKE :search";
        }
        
        $countStmt = $pdo->prepare($countSql);
        if (!empty($search)) {
            $countStmt->bindParam(':search', $params[':search']);
        }
        $countStmt->execute();
        $total = $countStmt->fetchColumn();
        
        echo json_encode([
            'success' => true,
            'data' => $adaptedClients,
            'total' => (int)$total,
            'limit' => $limit,
            'offset' => $offset
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Erreur lors de la récupération des clients: ' . $e->getMessage()]);
    }
}

/**
 * Récupérer un client par ID
 */
function getClient($id) {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("SELECT * FROM client WHERE No = :id");
        $stmt->execute([':id' => $id]);
        $client = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($client) {
            echo json_encode([
                'success' => true,
                'data' => adaptClientFromDb($client)
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Client non trouvé']);
        }
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Erreur lors de la récupération du client: ' . $e->getMessage()]);
    }
}

/**
 * Créer un nouveau client
 */
function createClient() {
    global $pdo;
    
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Données JSON invalides']);
            return;
        }
        
        // Validation basique
        if (empty($input['nom'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Le nom est obligatoire']);
            return;
        }
        
        $clientData = adaptClientToDb($input);
        
        $sql = "INSERT INTO client (Nom, Adresse, CP, Ville, Tel1, Tel2, Mail) 
                VALUES (:Nom, :Adresse, :CP, :Ville, :Tel1, :Tel2, :Mail)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($clientData);
        
        $newId = $pdo->lastInsertId();
        
        // Récupérer le client créé
        $stmt = $pdo->prepare("SELECT * FROM client WHERE No = :id");
        $stmt->execute([':id' => $newId]);
        $newClient = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => adaptClientFromDb($newClient),
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
function updateClient($id) {
    global $pdo;
    
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Données JSON invalides']);
            return;
        }
        
        // Vérifier que le client existe
        $stmt = $pdo->prepare("SELECT * FROM client WHERE No = :id");
        $stmt->execute([':id' => $id]);
        $existingClient = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$existingClient) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Client non trouvé']);
            return;
        }
        
        $clientData = adaptClientToDb($input);
        
        $sql = "UPDATE client SET 
                Nom = :Nom, 
                Adresse = :Adresse, 
                CP = :CP, 
                Ville = :Ville, 
                Tel1 = :Tel1, 
                Tel2 = :Tel2, 
                Mail = :Mail 
                WHERE No = :id";
        
        $clientData[':id'] = $id;
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($clientData);
        
        // Récupérer le client mis à jour
        $stmt = $pdo->prepare("SELECT * FROM client WHERE No = :id");
        $stmt->execute([':id' => $id]);
        $updatedClient = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => adaptClientFromDb($updatedClient),
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
function deleteClient($id) {
    global $pdo;
    
    try {
        // Vérifier que le client existe
        $stmt = $pdo->prepare("SELECT * FROM client WHERE No = :id");
        $stmt->execute([':id' => $id]);
        $client = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$client) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Client non trouvé']);
            return;
        }
        
        // Vérifier s'il y a des dépôts associés (si la table existe)
        try {
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM depots WHERE client_id = :id");
            $stmt->execute([':id' => $id]);
            $depotCount = $stmt->fetchColumn();
            
            if ($depotCount > 0) {
                http_response_code(400);
                echo json_encode([
                    'success' => false, 
                    'error' => "Impossible de supprimer ce client : il a $depotCount dépôt(s) associé(s)"
                ]);
                return;
            }
        } catch (PDOException $e) {
            // Table depots n'existe pas encore, on peut continuer
        }
        
        // Supprimer le client
        $stmt = $pdo->prepare("DELETE FROM client WHERE No = :id");
        $stmt->execute([':id' => $id]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Client supprimé avec succès'
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Erreur lors de la suppression du client: ' . $e->getMessage()]);
    }
}
?>