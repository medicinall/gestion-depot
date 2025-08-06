<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gestion des requêtes OPTIONS (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'fpdf.php';
require_once 'DepotPDFGenerator.php';

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

// Récupérer l'ID du dépôt depuis l'URL
$depotId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($depotId === 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'ID de dépôt manquant']);
    exit;
}

try {
    // Récupérer les données du dépôt avec les informations du client et du statut
    $stmt = $pdo->prepare("
        SELECT 
            d.*,
            c.prenom as client_prenom,
            c.nom as client_nom,
            c.email as client_email,
            c.telephone as client_telephone,
            c.adresse as client_adresse,
            c.code_postal as client_code_postal,
            c.ville as client_ville,
            s.nom as statut_nom,
            s.couleur_hex as statut_couleur
        FROM depots d
        LEFT JOIN clients c ON d.client_id = c.id
        LEFT JOIN statuts s ON d.status_id = s.id
        WHERE d.id = :depot_id AND d.archived = 0
    ");
    
    $stmt->execute([':depot_id' => $depotId]);
    $depot = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$depot) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Dépôt non trouvé']);
        exit;
    }
    
    // Préparer les données pour le PDF
    $depotData = [
        'id' => $depot['id'],
        'description' => $depot['description'],
        'notes' => $depot['notes'],
        'date_depot' => $depot['date_depot'],
        'date_prevue' => $depot['date_prevue'],
        'designation_references' => $depot['designation_references'] ?? $depot['description'],
        'observation_travaux' => $depot['observation_travaux'] ?? $depot['notes'],
        'donnees_sauvegarder' => $depot['donnees_sauvegarder'] ?? 'Non',
        'outlook_sauvegarder' => $depot['outlook_sauvegarder'] ?? 'Non',
        'mot_de_passe' => $depot['mot_de_passe'] ?? '',
        'informations_complementaires' => $depot['informations_complementaires'] ?? ''
    ];
    
    $clientData = [
        'prenom' => $depot['client_prenom'],
        'nom' => $depot['client_nom'],
        'email' => $depot['client_email'],
        'telephone' => $depot['client_telephone'],
        'adresse' => $depot['client_adresse'],
        'code_postal' => $depot['client_code_postal'],
        'ville' => $depot['client_ville']
    ];
    
    $statutData = [
        'nom' => $depot['statut_nom'],
        'couleur' => $depot['statut_couleur']
    ];
    
    // Générer le PDF
    $pdfGenerator = new DepotPDFGenerator($depotData, $clientData, $statutData);
    $pdfGenerator->generate();
    
    // Définir le nom du fichier
    $filename = 'fiche_depot_' . $depotId . '_' . date('Y-m-d') . '.pdf';
    
    // Envoyer le PDF au navigateur
    header('Content-Type: application/pdf');
    header('Content-Disposition: inline; filename="' . $filename . '"');
    header('Cache-Control: private, max-age=0, must-revalidate');
    header('Pragma: public');
    
    $pdfGenerator->Output('I', $filename);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'error' => 'Erreur lors de la génération du PDF: ' . $e->getMessage()
    ]);
}
?>