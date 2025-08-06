<?php
/**
 * API REST pour la gestion des statuts
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

// Récupérer la méthode
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getStatuts();
        break;
        
    case 'POST':
        createStatut();
        break;
        
    case 'PUT':
        updateStatut();
        break;
        
    case 'DELETE':
        deleteStatut();
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
        break;
}

/**
 * Récupérer tous les statuts
 */
function getStatuts() {
    global $pdo;
    
    try {
        // Vérifier si la table statuts existe
        $stmt = $pdo->query("SHOW TABLES LIKE 'statuts'");
        if ($stmt->rowCount() == 0) {
            // Si la table n'existe pas, retourner des statuts par défaut
            $defaultStatuts = [
                ['id' => 1, 'nom' => 'En attente', 'couleur_hex' => '#ffc107', 'ordre' => 1],
                ['id' => 2, 'nom' => 'En cours', 'couleur_hex' => '#17a2b8', 'ordre' => 2],
                ['id' => 3, 'nom' => 'Prêt', 'couleur_hex' => '#28a745', 'ordre' => 3],
                ['id' => 4, 'nom' => 'Récupéré', 'couleur_hex' => '#6c757d', 'ordre' => 4],
                ['id' => 5, 'nom' => 'Abandonné', 'couleur_hex' => '#dc3545', 'ordre' => 5]
            ];
            
            echo json_encode([
                'success' => true,
                'data' => $defaultStatuts
            ]);
            return;
        }
        
        $stmt = $pdo->query("SELECT * FROM statuts WHERE actif = 1 ORDER BY ordre ASC");
        $statuts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => $statuts
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Erreur lors de la récupération des statuts: ' . $e->getMessage()]);
    }
}

/**
 * Créer un nouveau statut
 */
function createStatut() {
    global $pdo;
    
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || empty($input['nom'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Le nom du statut est obligatoire']);
            return;
        }
        
        $stmt = $pdo->prepare("
            INSERT INTO statuts (nom, description, couleur_hex, ordre, actif)
            VALUES (:nom, :description, :couleur_hex, :ordre, 1)
        ");
        
        $stmt->execute([
            ':nom' => $input['nom'],
            ':description' => $input['description'] ?? '',
            ':couleur_hex' => $input['couleur_hex'] ?? '#007bff',
            ':ordre' => $input['ordre'] ?? 1
        ]);
        
        $newId = $pdo->lastInsertId();
        
        // Récupérer le statut créé
        $stmt = $pdo->prepare("SELECT * FROM statuts WHERE id = :id");
        $stmt->execute([':id' => $newId]);
        $newStatut = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => $newStatut,
            'message' => 'Statut créé avec succès'
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Erreur lors de la création du statut: ' . $e->getMessage()]);
    }
}

/**
 * Mettre à jour un statut
 */
function updateStatut() {
    // Pour simplifier, on peut implémenter plus tard
    echo json_encode(['success' => false, 'error' => 'Fonction non implémentée']);
}

/**
 * Supprimer un statut
 */
function deleteStatut() {
    // Pour simplifier, on peut implémenter plus tard
    echo json_encode(['success' => false, 'error' => 'Fonction non implémentée']);
}
?>