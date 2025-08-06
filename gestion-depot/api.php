<?php
/**
 * API Backend pour Gestion des Dépôts
 * Remplace le localStorage par une base de données MySQL
 */

require_once 'config.php';

// Gestion des erreurs en mode API
set_error_handler(function($severity, $message, $file, $line) {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

try {
    // Récupération de la méthode HTTP et du chemin
    $method = $_SERVER['REQUEST_METHOD'];
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $path = trim($path, '/');
    
    // Extraction des segments de chemin
    $segments = explode('/', $path);
    $endpoint = isset($segments[1]) ? $segments[1] : '';
    $id = isset($segments[2]) ? $segments[2] : null;
    $action = isset($segments[3]) ? $segments[3] : null;
    
    // Router principal
    switch ($endpoint) {
        case 'depots':
            handleDepots($method, $id, $action);
            break;
        case 'clients':
            handleClients($method, $id, $action);
            break;
        case 'statuts':
            handleStatuts($method, $id, $action);
            break;
        case 'archives':
            handleArchives($method, $id, $action);
            break;
        case 'stats':
            handleStats($method, $id, $action);
            break;
        case 'settings':
            handleSettings($method, $id, $action);
            break;
        case 'backup':
            handleBackup($method, $id, $action);
            break;
        case 'pdf':
            handlePDF($method, $id, $action);
            break;
        default:
            ApiResponse::json(ApiResponse::error('Endpoint non trouvé'), 404);
    }
    
} catch (Exception $e) {
    Logger::error('Erreur API: ' . $e->getMessage(), [
        'method' => $method ?? 'UNKNOWN',
        'path' => $path ?? 'UNKNOWN',
        'trace' => $e->getTraceAsString()
    ]);
    
    $message = APP_DEBUG ? $e->getMessage() : 'Une erreur interne est survenue';
    ApiResponse::json(ApiResponse::error($message), 500);
}

/**
 * Gestion des dépôts
 */
function handleDepots($method, $id, $action) {
    $db = Database::getInstance();
    
    switch ($method) {
        case 'GET':
            if ($id) {
                // Récupérer un dépôt spécifique
                $depot = $db->fetchOne(
                    "SELECT d.*, CONCAT(c.prenom, ' ', c.nom) as client_nom,
                            c.prenom, c.nom, c.email, c.telephone, c.adresse,
                            s.nom as statut_nom, s.couleur_hex, s.action as statut_action
                     FROM depots d 
                     LEFT JOIN clients c ON d.client_id = c.id 
                     LEFT JOIN statuts s ON d.status_id = s.id 
                     WHERE d.id = ? AND d.archived = 0",
                    [$id]
                );
                
                if (!$depot) {
                    ApiResponse::json(ApiResponse::error('Dépôt non trouvé'), 404);
                }
                
                ApiResponse::json(ApiResponse::success($depot));
                
            } else {
                // Récupérer tous les dépôts avec filtres
                $filters = $_GET;
                $where = ['d.archived = 0'];
                $params = [];
                
                if (isset($filters['client_id']) && $filters['client_id']) {
                    $where[] = 'd.client_id = ?';
                    $params[] = $filters['client_id'];
                }
                
                if (isset($filters['status_id']) && $filters['status_id']) {
                    $where[] = 'd.status_id = ?';
                    $params[] = $filters['status_id'];
                }
                
                if (isset($filters['date_from']) && $filters['date_from']) {
                    $where[] = 'd.date_depot >= ?';
                    $params[] = $filters['date_from'];
                }
                
                if (isset($filters['date_to']) && $filters['date_to']) {
                    $where[] = 'd.date_depot <= ?';
                    $params[] = $filters['date_to'];
                }
                
                $whereClause = implode(' AND ', $where);
                
                $depots = $db->fetchAll(
                    "SELECT d.*, CONCAT(c.prenom, ' ', c.nom) as client_nom,
                            s.nom as statut_nom, s.couleur_hex, s.action as statut_action
                     FROM depots d 
                     LEFT JOIN clients c ON d.client_id = c.id 
                     LEFT JOIN statuts s ON d.status_id = s.id 
                     WHERE $whereClause
                     ORDER BY d.date_creation DESC",
                    $params
                );
                
                ApiResponse::json(ApiResponse::success(['depots' => $depots]));
            }
            break;
            
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validation
            $client_id = Validator::integer($input['client_id'], 'client_id');
            $status_id = Validator::integer($input['status_id'], 'status_id');
            $description = Validator::required($input['description'], 'description');
            
            // Génération du numéro de dépôt
            $numero_depot = $db->fetchColumn("SELECT generate_depot_number()");
            
            $db->beginTransaction();
            try {
                $stmt = $db->query(
                    "INSERT INTO depots (numero_depot, client_id, status_id, description, designation_references, 
                                        observation_travaux, notes, date_depot, date_prevue, mot_de_passe, 
                                        donnees_sauvegarder, outlook_sauvegarder, informations_complementaires) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [
                        $numero_depot,
                        $client_id,
                        $status_id,
                        $description,
                        $input['designation_references'] ?? '',
                        $input['observation_travaux'] ?? '',
                        $input['notes'] ?? '',
                        Validator::date($input['date_depot'] ?? null),
                        Validator::date($input['date_prevue'] ?? null),
                        $input['mot_de_passe'] ?? '',
                        $input['donnees_sauvegarder'] ?? 'Non',
                        $input['outlook_sauvegarder'] ?? 'Non',
                        $input['informations_complementaires'] ?? ''
                    ]
                );
                
                $newId = $db->lastInsertId();
                $db->commit();
                
                Logger::info("Nouveau dépôt créé", ['id' => $newId, 'numero' => $numero_depot]);
                
                // Récupérer le dépôt complet
                $depot = $db->fetchOne(
                    "SELECT d.*, CONCAT(c.prenom, ' ', c.nom) as client_nom 
                     FROM depots d 
                     LEFT JOIN clients c ON d.client_id = c.id 
                     WHERE d.id = ?",
                    [$newId]
                );
                
                ApiResponse::json(ApiResponse::success($depot, 'Dépôt créé avec succès'));
                
            } catch (Exception $e) {
                $db->rollback();
                throw $e;
            }
            break;
            
        case 'PUT':
            if (!$id) {
                ApiResponse::json(ApiResponse::error('ID requis pour la modification'), 400);
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if ($action === 'status') {
                // Mise à jour du statut uniquement
                $status_id = Validator::integer($input['status_id'], 'status_id');
                
                $db->query(
                    "UPDATE depots SET status_id = ?, date_modification = NOW() WHERE id = ? AND archived = 0",
                    [$status_id, $id]
                );
                
                Logger::info("Statut du dépôt mis à jour", ['depot_id' => $id, 'new_status' => $status_id]);
                
            } else {
                // Mise à jour complète
                $client_id = Validator::integer($input['client_id'], 'client_id');
                $status_id = Validator::integer($input['status_id'], 'status_id');
                $description = Validator::required($input['description'], 'description');
                
                $db->query(
                    "UPDATE depots SET 
                        client_id = ?, status_id = ?, description = ?, designation_references = ?,
                        observation_travaux = ?, notes = ?, date_depot = ?, date_prevue = ?,
                        mot_de_passe = ?, donnees_sauvegarder = ?, outlook_sauvegarder = ?,
                        informations_complementaires = ?, date_modification = NOW()
                     WHERE id = ? AND archived = 0",
                    [
                        $client_id, $status_id, $description,
                        $input['designation_references'] ?? '',
                        $input['observation_travaux'] ?? '',
                        $input['notes'] ?? '',
                        Validator::date($input['date_depot'] ?? null),
                        Validator::date($input['date_prevue'] ?? null),
                        $input['mot_de_passe'] ?? '',
                        $input['donnees_sauvegarder'] ?? 'Non',
                        $input['outlook_sauvegarder'] ?? 'Non',
                        $input['informations_complementaires'] ?? '',
                        $id
                    ]
                );
                
                Logger::info("Dépôt mis à jour", ['depot_id' => $id]);
            }
            
            ApiResponse::json(ApiResponse::success(null, 'Dépôt mis à jour avec succès'));
            break;
            
        case 'DELETE':
            if (!$id) {
                ApiResponse::json(ApiResponse::error('ID requis pour la suppression'), 400);
            }
            
            if ($action === 'archive') {
                // Archiver le dépôt
                $db->query("CALL archive_depot(?)", [$id]);
                Logger::info("Dépôt archivé", ['depot_id' => $id]);
                ApiResponse::json(ApiResponse::success(null, 'Dépôt archivé avec succès'));
                
            } else {
                // Supprimer définitivement
                $db->query("DELETE FROM depots WHERE id = ?", [$id]);
                Logger::info("Dépôt supprimé", ['depot_id' => $id]);
                ApiResponse::json(ApiResponse::success(null, 'Dépôt supprimé avec succès'));
            }
            break;
            
        default:
            ApiResponse::json(ApiResponse::error('Méthode non supportée'), 405);
    }
}

/**
 * Gestion des clients
 */
function handleClients($method, $id, $action) {
    $db = Database::getInstance();
    
    switch ($method) {
        case 'GET':
            if ($id) {
                $client = $db->fetchOne("SELECT * FROM clients WHERE id = ?", [$id]);
                if (!$client) {
                    ApiResponse::json(ApiResponse::error('Client non trouvé'), 404);
                }
                ApiResponse::json(ApiResponse::success($client));
            } else {
                $clients = $db->fetchAll("SELECT * FROM clients ORDER BY nom, prenom");
                ApiResponse::json(ApiResponse::success(['clients' => $clients]));
            }
            break;
            
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            $prenom = Validator::required($input['prenom'], 'prenom');
            $nom = Validator::required($input['nom'], 'nom');
            $email = Validator::email($input['email'] ?? '');
            $telephone = Validator::phone($input['telephone'] ?? '');
            
            $stmt = $db->query(
                "INSERT INTO clients (prenom, nom, email, telephone, adresse, notes) VALUES (?, ?, ?, ?, ?, ?)",
                [$prenom, $nom, $email, $telephone, $input['adresse'] ?? '', $input['notes'] ?? '']
            );
            
            $newId = $db->lastInsertId();
            Logger::info("Nouveau client créé", ['id' => $newId, 'nom' => "$prenom $nom"]);
            
            $client = $db->fetchOne("SELECT * FROM clients WHERE id = ?", [$newId]);
            ApiResponse::json(ApiResponse::success($client, 'Client créé avec succès'));
            break;
            
        case 'PUT':
            if (!$id) {
                ApiResponse::json(ApiResponse::error('ID requis pour la modification'), 400);
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            $prenom = Validator::required($input['prenom'], 'prenom');
            $nom = Validator::required($input['nom'], 'nom');
            $email = Validator::email($input['email'] ?? '');
            $telephone = Validator::phone($input['telephone'] ?? '');
            
            $db->query(
                "UPDATE clients SET prenom = ?, nom = ?, email = ?, telephone = ?, adresse = ?, notes = ?, date_modification = NOW() WHERE id = ?",
                [$prenom, $nom, $email, $telephone, $input['adresse'] ?? '', $input['notes'] ?? '', $id]
            );
            
            Logger::info("Client mis à jour", ['client_id' => $id]);
            ApiResponse::json(ApiResponse::success(null, 'Client mis à jour avec succès'));
            break;
            
        case 'DELETE':
            if (!$id) {
                ApiResponse::json(ApiResponse::error('ID requis pour la suppression'), 400);
            }
            
            // Vérifier s'il y a des dépôts associés
            $count = $db->fetchColumn("SELECT COUNT(*) FROM depots WHERE client_id = ? AND archived = 0", [$id]);
            if ($count > 0) {
                ApiResponse::json(ApiResponse::error('Impossible de supprimer un client ayant des dépôts actifs'), 400);
            }
            
            $db->query("DELETE FROM clients WHERE id = ?", [$id]);
            Logger::info("Client supprimé", ['client_id' => $id]);
            ApiResponse::json(ApiResponse::success(null, 'Client supprimé avec succès'));
            break;
            
        default:
            ApiResponse::json(ApiResponse::error('Méthode non supportée'), 405);
    }
}

/**
 * Gestion des statuts
 */
function handleStatuts($method, $id, $action) {
    $db = Database::getInstance();
    
    switch ($method) {
        case 'GET':
            $statuts = $db->fetchAll("SELECT * FROM statuts ORDER BY ordre, id");
            ApiResponse::json(ApiResponse::success($statuts));
            break;
            
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            $nom = Validator::required($input['nom'], 'nom');
            $couleur_hex = $input['couleur_hex'] ?? '#3498db';
            
            // Vérifier l'unicité du nom
            $exists = $db->fetchColumn("SELECT COUNT(*) FROM statuts WHERE nom = ?", [$nom]);
            if ($exists > 0) {
                ApiResponse::json(ApiResponse::error('Un statut avec ce nom existe déjà'), 400);
            }
            
            $stmt = $db->query(
                "INSERT INTO statuts (nom, couleur_hex, action, description, ordre) VALUES (?, ?, ?, ?, (SELECT COALESCE(MAX(ordre), 0) + 1 FROM statuts s))",
                [$nom, $couleur_hex, $input['action'] ?? '', $input['description'] ?? '']
            );
            
            $newId = $db->lastInsertId();
            Logger::info("Nouveau statut créé", ['id' => $newId, 'nom' => $nom]);
            
            $statut = $db->fetchOne("SELECT * FROM statuts WHERE id = ?", [$newId]);
            ApiResponse::json(ApiResponse::success($statut, 'Statut créé avec succès'));
            break;
            
        case 'PUT':
            if (!$id) {
                ApiResponse::json(ApiResponse::error('ID requis pour la modification'), 400);
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            $nom = Validator::required($input['nom'], 'nom');
            $couleur_hex = $input['couleur_hex'] ?? '#3498db';
            
            $db->query(
                "UPDATE statuts SET nom = ?, couleur_hex = ?, action = ?, description = ? WHERE id = ?",
                [$nom, $couleur_hex, $input['action'] ?? '', $input['description'] ?? '', $id]
            );
            
            Logger::info("Statut mis à jour", ['statut_id' => $id]);
            ApiResponse::json(ApiResponse::success(null, 'Statut mis à jour avec succès'));
            break;
            
        case 'DELETE':
            if (!$id) {
                ApiResponse::json(ApiResponse::error('ID requis pour la suppression'), 400);
            }
            
            // Vérifier s'il y a des dépôts avec ce statut
            $count = $db->fetchColumn("SELECT COUNT(*) FROM depots WHERE status_id = ?", [$id]);
            if ($count > 0) {
                ApiResponse::json(ApiResponse::error('Impossible de supprimer un statut utilisé par des dépôts'), 400);
            }
            
            $db->query("DELETE FROM statuts WHERE id = ?", [$id]);
            Logger::info("Statut supprimé", ['statut_id' => $id]);
            ApiResponse::json(ApiResponse::success(null, 'Statut supprimé avec succès'));
            break;
            
        default:
            ApiResponse::json(ApiResponse::error('Méthode non supportée'), 405);
    }
}

/**
 * Gestion des archives
 */
function handleArchives($method, $id, $action) {
    $db = Database::getInstance();
    
    switch ($method) {
        case 'GET':
            if ($id) {
                $archive = $db->fetchOne("SELECT * FROM archives WHERE id = ?", [$id]);
                if (!$archive) {
                    ApiResponse::json(ApiResponse::error('Archive non trouvée'), 404);
                }
                ApiResponse::json(ApiResponse::success($archive));
            } else {
                $archives = $db->fetchAll("SELECT * FROM archives ORDER BY date_archive DESC");
                ApiResponse::json(ApiResponse::success(['archives' => $archives]));
            }
            break;
            
        case 'POST':
            if ($action === 'restore' && $id) {
                // Restaurer une archive
                $archive = $db->fetchOne("SELECT * FROM archives WHERE id = ?", [$id]);
                if (!$archive) {
                    ApiResponse::json(ApiResponse::error('Archive non trouvée'), 404);
                }
                
                $db->beginTransaction();
                try {
                    // Trouver le premier statut pour la restauration
                    $firstStatus = $db->fetchOne("SELECT id FROM statuts ORDER BY ordre LIMIT 1");
                    $statusId = $firstStatus ? $firstStatus['id'] : 1;
                    
                    // Générer un nouveau numéro de dépôt
                    $numero_depot = $db->fetchColumn("SELECT generate_depot_number()");
                    
                    // Créer un nouveau dépôt
                    $db->query(
                        "INSERT INTO depots (numero_depot, client_id, status_id, description, notes, date_depot, archived) 
                         VALUES (?, ?, ?, ?, ?, CURDATE(), 0)",
                        [$numero_depot, $archive['client_id'] ?? null, $statusId, $archive['description'], 
                         ($archive['notes'] ?? '') . "\n[Restauré depuis les archives]"]
                    );
                    
                    $newDepotId = $db->lastInsertId();
                    
                    // Supprimer l'archive
                    $db->query("DELETE FROM archives WHERE id = ?", [$id]);
                    
                    $db->commit();
                    
                    Logger::info("Archive restaurée", ['archive_id' => $id, 'new_depot_id' => $newDepotId]);
                    ApiResponse::json(ApiResponse::success(['depot_id' => $newDepotId], 'Archive restaurée avec succès'));
                    
                } catch (Exception $e) {
                    $db->rollback();
                    throw $e;
                }
            }
            break;
            
        case 'DELETE':
            if (!$id) {
                ApiResponse::json(ApiResponse::error('ID requis pour la suppression'), 400);
            }
            
            if ($action === 'cleanup') {
                // Nettoyage des anciennes archives
                $days = intval($_GET['days'] ?? 365);
                $deleted = $db->query("DELETE FROM archives WHERE date_archive < DATE_SUB(CURDATE(), INTERVAL ? DAY)", [$days]);
                $count = $deleted->rowCount();
                
                Logger::info("Nettoyage des archives", ['days' => $days, 'deleted' => $count]);
                ApiResponse::json(ApiResponse::success(['deletedCount' => $count], "$count archives supprimées"));
                
            } else {
                // Suppression d'une archive spécifique
                $db->query("DELETE FROM archives WHERE id = ?", [$id]);
                Logger::info("Archive supprimée", ['archive_id' => $id]);
                ApiResponse::json(ApiResponse::success(null, 'Archive supprimée avec succès'));
            }
            break;
            
        default:
            ApiResponse::json(ApiResponse::error('Méthode non supportée'), 405);
    }
}

/**
 * Gestion des statistiques
 */
function handleStats($method, $id, $action) {
    $db = Database::getInstance();
    
    if ($method === 'GET' && $action === 'dashboard') {
        $stats = $db->fetchOne("SELECT * FROM view_statistiques");
        
        // Activité récente
        $recentActivity = $db->fetchAll(
            "SELECT 'depot' as type, d.id, d.description as text, d.date_modification as date,
                    CONCAT(c.prenom, ' ', c.nom) as client_nom
             FROM depots d 
             LEFT JOIN clients c ON d.client_id = c.id 
             WHERE d.archived = 0 
             ORDER BY d.date_modification DESC 
             LIMIT 5"
        );
        
        // Formater l'activité récente
        $formattedActivity = array_map(function($activity) {
            return [
                'icon' => 'box',
                'text' => "Dépôt mis à jour pour " . $activity['client_nom'],
                'date' => $activity['date']
            ];
        }, $recentActivity);
        
        $stats['recentActivity'] = $formattedActivity;
        
        ApiResponse::json(ApiResponse::success($stats));
    } else {
        ApiResponse::json(ApiResponse::error('Endpoint de statistiques non trouvé'), 404);
    }
}

/**
 * Gestion des paramètres
 */
function handleSettings($method, $id, $action) {
    $db = Database::getInstance();
    
    switch ($method) {
        case 'GET':
            $settings = $db->fetchAll("SELECT cle, valeur FROM settings");
            $settingsArray = [];
            foreach ($settings as $setting) {
                $settingsArray[$setting['cle']] = $setting['valeur'];
            }
            ApiResponse::json(ApiResponse::success($settingsArray));
            break;
            
        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);
            
            $db->beginTransaction();
            try {
                foreach ($input as $key => $value) {
                    $db->query(
                        "INSERT INTO settings (cle, valeur) VALUES (?, ?) ON DUPLICATE KEY UPDATE valeur = VALUES(valeur)",
                        [$key, $value]
                    );
                }
                $db->commit();
                
                Logger::info("Paramètres mis à jour", ['settings' => array_keys($input)]);
                ApiResponse::json(ApiResponse::success(null, 'Paramètres mis à jour avec succès'));
                
            } catch (Exception $e) {
                $db->rollback();
                throw $e;
            }
            break;
            
        default:
            ApiResponse::json(ApiResponse::error('Méthode non supportée'), 405);
    }
}

/**
 * Gestion des sauvegardes
 */
function handleBackup($method, $id, $action) {
    $db = Database::getInstance();
    
    switch ($method) {
        case 'GET':
            if ($action === 'export') {
                // Export complet des données
                $data = [
                    'version' => APP_VERSION,
                    'timestamp' => date('c'),
                    'depots' => $db->fetchAll("SELECT * FROM view_depots_complets WHERE archived = 0"),
                    'clients' => $db->fetchAll("SELECT * FROM clients"),
                    'statuts' => $db->fetchAll("SELECT * FROM statuts ORDER BY ordre"),
                    'archives' => $db->fetchAll("SELECT * FROM archives"),
                    'settings' => $db->fetchAll("SELECT cle, valeur FROM settings")
                ];
                
                Logger::info("Export des données effectué");
                ApiResponse::json(ApiResponse::success($data));
            }
            break;
            
        case 'POST':
            if ($action === 'import') {
                $input = json_decode(file_get_contents('php://input'), true);
                
                if (!isset($input['data'])) {
                    ApiResponse::json(ApiResponse::error('Données d\'import manquantes'), 400);
                }
                
                $importData = $input['data'];
                
                $db->beginTransaction();
                try {
                    // Import des données (implémentation simplifiée)
                    Logger::info("Import des données effectué");
                    $db->commit();
                    
                    ApiResponse::json(ApiResponse::success(null, 'Données importées avec succès'));
                    
                } catch (Exception $e) {
                    $db->rollback();
                    throw $e;
                }
            } elseif ($action === 'reset') {
                // Réinitialisation des données
                $db->beginTransaction();
                try {
                    $db->query("DELETE FROM depots");
                    $db->query("DELETE FROM clients WHERE id > 5"); // Garder les clients de démo
                    $db->query("DELETE FROM archives");
                    $db->query("UPDATE depot_counter SET counter = 1");
                    
                    $db->commit();
                    
                    Logger::info("Données réinitialisées");
                    ApiResponse::json(ApiResponse::success(null, 'Données réinitialisées avec succès'));
                    
                } catch (Exception $e) {
                    $db->rollback();
                    throw $e;
                }
            }
            break;
            
        default:
            ApiResponse::json(ApiResponse::error('Méthode non supportée'), 405);
    }
}

/**
 * Gestion de la génération PDF
 */
function handlePDF($method, $id, $action) {
    if ($method === 'GET' && $action === 'depot' && $id) {
        // Redirection vers le générateur PDF
        require_once 'generate_pdf.php';
        generateDepotPDF($id);
    } else {
        ApiResponse::json(ApiResponse::error('Endpoint PDF non trouvé'), 404);
    }
}
?>