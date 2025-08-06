<?php
/**
 * Script de migration des données localStorage vers MySQL
 * Permet de récupérer les données existantes
 */

require_once 'config.php';

?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Migration - Gestion des Dépôts</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 900px;
            margin: 40px auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 30px;
        }
        .step {
            margin: 20px 0;
            padding: 15px;
            border-left: 4px solid #3498db;
            background: #f8f9fa;
        }
        .success {
            border-left-color: #27ae60;
            background: #d4edda;
            color: #155724;
        }
        .error {
            border-left-color: #e74c3c;
            background: #f8d7da;
            color: #721c24;
        }
        .warning {
            border-left-color: #f39c12;
            background: #fff3cd;
            color: #856404;
        }
        .btn {
            background: #3498db;
            color: white;
            padding: 12px 25px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            text-decoration: none;
            display: inline-block;
            margin: 10px 5px;
        }
        .btn:hover {
            background: #2980b9;
        }
        .btn-success {
            background: #27ae60;
        }
        .btn-danger {
            background: #e74c3c;
        }
        .btn-warning {
            background: #f39c12;
        }
        .data-area {
            background: #2c3e50;
            color: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            font-family: monospace;
            white-space: pre-wrap;
            max-height: 300px;
            overflow-y: auto;
        }
        .form-group {
            margin: 15px 0;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        .form-group textarea {
            width: 100%;
            min-height: 200px;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-family: monospace;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .stat-card {
            background: #3498db;
            color: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        .stat-number {
            font-size: 24px;
            font-weight: bold;
        }
        .stat-label {
            font-size: 14px;
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔄 Migration des Données</h1>
        
        <?php
        $action = $_GET['action'] ?? 'info';
        
        switch ($action) {
            case 'info':
                displayMigrationInfo();
                break;
            case 'extract':
                displayExtractionForm();
                break;
            case 'import':
                handleDataImport();
                break;
            case 'backup':
                displayBackupForm();
                break;
            default:
                displayMigrationInfo();
        }
        
        /**
         * Informations sur la migration
         */
        function displayMigrationInfo() {
            echo '<h2>📋 Information sur la migration</h2>';
            
            echo '<div class="step">';
            echo '<h3>Pourquoi migrer ?</h3>';
            echo '<p>Cette migration vous permet de :</p>';
            echo '<ul>';
            echo '<li><strong>Centraliser les données</strong> : Plus de problème de synchronisation entre PC</li>';
            echo '<li><strong>Générer des PDF</strong> : Fiches de dépôt automatiques</li>';
            echo '<li><strong>Sauvegardes automatiques</strong> : Vos données sont sécurisées</li>';
            echo '<li><strong>Performances améliorées</strong> : Base de données optimisée</li>';
            echo '<li><strong>Fonctionnalités avancées</strong> : Statistiques, rapports, etc.</li>';
            echo '</ul>';
            echo '</div>';
            
            echo '<div class="step warning">';
            echo '<h3>⚠️ Important</h3>';
            echo '<p>Cette migration est <strong>irréversible</strong>. Nous recommandons de :</p>';
            echo '<ul>';
            echo '<li>Faire une sauvegarde de vos données actuelles</li>';
            echo '<li>Tester la migration sur un environnement de test</li>';
            echo '<li>Vérifier que XAMPP et MySQL fonctionnent correctement</li>';
            echo '</ul>';
            echo '</div>';
            
            echo '<div class="step">';
            echo '<h3>🚀 Processus de migration</h3>';
            echo '<ol>';
            echo '<li><strong>Extraction</strong> : Récupération des données localStorage</li>';
            echo '<li><strong>Validation</strong> : Vérification des données</li>';
            echo '<li><strong>Import</strong> : Insertion dans MySQL</li>';
            echo '<li><strong>Vérification</strong> : Test du bon fonctionnement</li>';
            echo '</ol>';
            echo '</div>';
            
            echo '<div class="step">';
            echo '<h3>📊 Actions disponibles</h3>';
            echo '<a href="?action=extract" class="btn btn-success">📤 Extraire les données localStorage</a>';
            echo '<a href="?action=backup" class="btn btn-warning">💾 Sauvegarder les données MySQL</a>';
            echo '<a href="api.php/backup/export" class="btn" target="_blank">📥 Export JSON complet</a>';
            echo '</div>';
        }
        
        /**
         * Formulaire d'extraction des données localStorage
         */
        function displayExtractionForm() {
            echo '<h2>📤 Extraction des données localStorage</h2>';
            
            echo '<div class="step">';
            echo '<h3>Étape 1 : Récupération automatique</h3>';
            echo '<p>Cliquez sur le bouton ci-dessous pour extraire automatiquement vos données localStorage :</p>';
            echo '<button onclick="extractLocalStorageData()" class="btn btn-success">🔍 Extraire les données</button>';
            echo '</div>';
            
            echo '<div class="step" id="extraction-result" style="display: none;">';
            echo '<h3>Données extraites</h3>';
            echo '<div id="extraction-stats" class="stats"></div>';
            echo '<div id="extraction-data" class="data-area"></div>';
            echo '</div>';
            
            echo '<form method="post" action="?action=import" id="import-form" style="display: none;">';
            echo '<div class="step">';
            echo '<h3>Étape 2 : Validation et import</h3>';
            echo '<div class="form-group">';
            echo '<label for="json-data">Données JSON extraites :</label>';
            echo '<textarea name="json_data" id="json-data" required></textarea>';
            echo '</div>';
            echo '<button type="submit" class="btn btn-success">🚀 Importer dans MySQL</button>';
            echo '<button type="button" onclick="validateData()" class="btn">✅ Valider les données</button>';
            echo '</div>';
            echo '</form>';
            
            echo '<div class="step warning">';
            echo '<h3>⚠️ Instructions manuelles</h3>';
            echo '<p>Si l\'extraction automatique ne fonctionne pas :</p>';
            echo '<ol>';
            echo '<li>Ouvrez votre ancienne application (version localStorage)</li>';
            echo '<li>Ouvrez la console du navigateur (F12)</li>';
            echo '<li>Exécutez ce code :</li>';
            echo '</ol>';
            echo '<div class="data-area">';
            echo 'const data = {
    depots: JSON.parse(localStorage.getItem("depot_manager_depots") || "[]"),
    clients: JSON.parse(localStorage.getItem("depot_manager_clients") || "[]"),
    statuts: JSON.parse(localStorage.getItem("depot_manager_statuts") || "[]"),
    archives: JSON.parse(localStorage.getItem("depot_manager_archives") || "[]"),
    settings: JSON.parse(localStorage.getItem("depot_manager_settings") || "{}")
};
console.log("Données à copier:", JSON.stringify(data, null, 2));';
            echo '</div>';
            echo '<p>Copiez le résultat et collez-le dans le formulaire ci-dessus.</p>';
            echo '</div>';
            
            ?>
            <script>
            function extractLocalStorageData() {
                try {
                    // Essayer d'extraire les données depuis localStorage
                    const data = {
                        depots: JSON.parse(localStorage.getItem("depot_manager_depots") || "[]"),
                        clients: JSON.parse(localStorage.getItem("depot_manager_clients") || "[]"),
                        statuts: JSON.parse(localStorage.getItem("depot_manager_statuts") || "[]"),
                        archives: JSON.parse(localStorage.getItem("depot_manager_archives") || "[]"),
                        settings: JSON.parse(localStorage.getItem("depot_manager_settings") || "{}")
                    };
                    
                    // Calculer les statistiques
                    const stats = {
                        depots: data.depots.length,
                        clients: data.clients.length,
                        statuts: data.statuts.length,
                        archives: data.archives.length,
                        settings: Object.keys(data.settings).length
                    };
                    
                    // Afficher les statistiques
                    document.getElementById('extraction-stats').innerHTML = `
                        <div class="stat-card">
                            <div class="stat-number">${stats.depots}</div>
                            <div class="stat-label">Dépôts</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${stats.clients}</div>
                            <div class="stat-label">Clients</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${stats.statuts}</div>
                            <div class="stat-label">Statuts</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${stats.archives}</div>
                            <div class="stat-label">Archives</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${stats.settings}</div>
                            <div class="stat-label">Paramètres</div>
                        </div>
                    `;
                    
                    // Afficher les données
                    document.getElementById('extraction-data').textContent = JSON.stringify(data, null, 2);
                    document.getElementById('json-data').value = JSON.stringify(data, null, 2);
                    
                    // Afficher les sections
                    document.getElementById('extraction-result').style.display = 'block';
                    document.getElementById('import-form').style.display = 'block';
                    
                    alert('✅ Données extraites avec succès ! Vous pouvez maintenant les importer.');
                    
                } catch (error) {
                    alert('❌ Erreur lors de l\'extraction : ' + error.message + '\n\nVeuillez utiliser la méthode manuelle.');
                }
            }
            
            function validateData() {
                try {
                    const jsonData = document.getElementById('json-data').value;
                    const data = JSON.parse(jsonData);
                    
                    let errors = [];
                    
                    // Vérifications basiques
                    if (!Array.isArray(data.depots)) errors.push('Format invalide pour les dépôts');
                    if (!Array.isArray(data.clients)) errors.push('Format invalide pour les clients');
                    if (!Array.isArray(data.statuts)) errors.push('Format invalide pour les statuts');
                    if (!Array.isArray(data.archives)) errors.push('Format invalide pour les archives');
                    
                    if (errors.length > 0) {
                        alert('❌ Erreurs détectées :\n' + errors.join('\n'));
                    } else {
                        alert('✅ Données valides ! Vous pouvez procéder à l\'import.');
                    }
                    
                } catch (error) {
                    alert('❌ JSON invalide : ' + error.message);
                }
            }
            </script>
            <?php
        }
        
        /**
         * Traitement de l'import des données
         */
        function handleDataImport() {
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                header('Location: ?action=extract');
                exit;
            }
            
            $jsonData = $_POST['json_data'] ?? '';
            
            if (empty($jsonData)) {
                echo '<div class="step error">❌ Aucune donnée fournie</div>';
                return;
            }
            
            try {
                $data = json_decode($jsonData, true);
                
                if (json_last_error() !== JSON_ERROR_NONE) {
                    throw new Exception('JSON invalide: ' . json_last_error_msg());
                }
                
                echo '<h2>🚀 Import des données en cours...</h2>';
                
                $db = Database::getInstance();
                $db->beginTransaction();
                
                $imported = [
                    'clients' => 0,
                    'statuts' => 0,
                    'depots' => 0,
                    'archives' => 0,
                    'settings' => 0
                ];
                
                try {
                    // Import des clients
                    if (isset($data['clients']) && is_array($data['clients'])) {
                        foreach ($data['clients'] as $client) {
                            $db->query(
                                "INSERT INTO clients (prenom, nom, email, telephone, adresse, notes) VALUES (?, ?, ?, ?, ?, ?) 
                                 ON DUPLICATE KEY UPDATE prenom = VALUES(prenom), nom = VALUES(nom)",
                                [
                                    $client['prenom'] ?? '',
                                    $client['nom'] ?? '',
                                    $client['email'] ?? '',
                                    $client['telephone'] ?? '',
                                    $client['adresse'] ?? '',
                                    $client['notes'] ?? ''
                                ]
                            );
                            $imported['clients']++;
                        }
                    }
                    
                    // Import des statuts
                    if (isset($data['statuts']) && is_array($data['statuts'])) {
                        foreach ($data['statuts'] as $statut) {
                            $db->query(
                                "INSERT INTO statuts (nom, couleur_hex, action, description, ordre) VALUES (?, ?, ?, ?, ?) 
                                 ON DUPLICATE KEY UPDATE couleur_hex = VALUES(couleur_hex), action = VALUES(action)",
                                [
                                    $statut['nom'] ?? '',
                                    $statut['couleur_hex'] ?? '#3498db',
                                    $statut['action'] ?? '',
                                    $statut['description'] ?? '',
                                    $statut['ordre'] ?? 1
                                ]
                            );
                            $imported['statuts']++;
                        }
                    }
                    
                    // Import des dépôts
                    if (isset($data['depots']) && is_array($data['depots'])) {
                        foreach ($data['depots'] as $depot) {
                            // Générer un nouveau numéro de dépôt
                            $numero_depot = $db->fetchColumn("SELECT generate_depot_number()");
                            
                            $db->query(
                                "INSERT INTO depots (numero_depot, client_id, status_id, description, notes, date_depot, date_prevue) 
                                 VALUES (?, ?, ?, ?, ?, ?, ?)",
                                [
                                    $numero_depot,
                                    $depot['client_id'] ?? 1,
                                    $depot['status_id'] ?? 1,
                                    $depot['description'] ?? '',
                                    $depot['notes'] ?? '',
                                    $depot['date_depot'] ?? date('Y-m-d'),
                                    $depot['date_prevue'] ?? date('Y-m-d', strtotime('+3 days'))
                                ]
                            );
                            $imported['depots']++;
                        }
                    }
                    
                    // Import des archives
                    if (isset($data['archives']) && is_array($data['archives'])) {
                        foreach ($data['archives'] as $archive) {
                            $db->query(
                                "INSERT INTO archives (client_nom, description, notes, date_depot, date_archive, statut_final) 
                                 VALUES (?, ?, ?, ?, ?, ?)",
                                [
                                    $archive['client_nom'] ?? 'Client inconnu',
                                    $archive['description'] ?? '',
                                    $archive['notes'] ?? '',
                                    $archive['date_depot'] ?? date('Y-m-d'),
                                    $archive['date_archive'] ?? date('Y-m-d'),
                                    $archive['statut_final'] ?? 'Terminé'
                                ]
                            );
                            $imported['archives']++;
                        }
                    }
                    
                    // Import des paramètres
                    if (isset($data['settings']) && is_array($data['settings'])) {
                        foreach ($data['settings'] as $key => $value) {
                            $db->query(
                                "INSERT INTO settings (cle, valeur) VALUES (?, ?) 
                                 ON DUPLICATE KEY UPDATE valeur = VALUES(valeur)",
                                [$key, $value]
                            );
                            $imported['settings']++;
                        }
                    }
                    
                    $db->commit();
                    
                    echo '<div class="step success">';
                    echo '<h3>✅ Import réussi !</h3>';
                    echo '<div class="stats">';
                    foreach ($imported as $type => $count) {
                        echo "<div class='stat-card'>";
                        echo "<div class='stat-number'>$count</div>";
                        echo "<div class='stat-label'>$type</div>";
                        echo "</div>";
                    }
                    echo '</div>';
                    echo '<p>Toutes vos données ont été importées avec succès dans MySQL.</p>';
                    echo '<a href="index.html" class="btn btn-success">🚀 Accéder à l\'application</a>';
                    echo '<a href="?action=backup" class="btn">💾 Faire une sauvegarde</a>';
                    echo '</div>';
                    
                } catch (Exception $e) {
                    $db->rollback();
                    throw $e;
                }
                
            } catch (Exception $e) {
                echo '<div class="step error">';
                echo '<h3>❌ Erreur lors de l\'import</h3>';
                echo '<p>Erreur: ' . htmlspecialchars($e->getMessage()) . '</p>';
                echo '<a href="?action=extract" class="btn">🔙 Retour</a>';
                echo '</div>';
            }
        }
        
        /**
         * Formulaire de sauvegarde
         */
        function displayBackupForm() {
            echo '<h2>💾 Sauvegarde des données MySQL</h2>';
            
            try {
                $db = Database::getInstance();
                
                // Statistiques actuelles
                $stats = [
                    'clients' => $db->fetchColumn("SELECT COUNT(*) FROM clients"),
                    'depots' => $db->fetchColumn("SELECT COUNT(*) FROM depots WHERE archived = 0"),
                    'statuts' => $db->fetchColumn("SELECT COUNT(*) FROM statuts"),
                    'archives' => $db->fetchColumn("SELECT COUNT(*) FROM archives"),
                    'settings' => $db->fetchColumn("SELECT COUNT(*) FROM settings")
                ];
                
                echo '<div class="step">';
                echo '<h3>📊 Données actuelles</h3>';
                echo '<div class="stats">';
                foreach ($stats as $type => $count) {
                    echo "<div class='stat-card'>";
                    echo "<div class='stat-number'>$count</div>";
                    echo "<div class='stat-label'>$type</div>";
                    echo "</div>";
                }
                echo '</div>';
                echo '</div>';
                
                echo '<div class="step">';
                echo '<h3>💾 Options de sauvegarde</h3>';
                echo '<a href="api.php/backup/export" class="btn btn-success" target="_blank">📥 Export JSON complet</a>';
                echo '<button onclick="generateSQLDump()" class="btn">📄 Générer dump SQL</button>';
                echo '<a href="backup_mysql.php" class="btn btn-warning" target="_blank">🗃️ Sauvegarde complète</a>';
                echo '</div>';
                
                echo '<div class="step warning">';
                echo '<h3>⚠️ Recommandations</h3>';
                echo '<ul>';
                echo '<li>Effectuez des sauvegardes régulières (quotidiennes recommandées)</li>';
                echo '<li>Stockez les sauvegardes en lieu sûr (cloud, disque externe)</li>';
                echo '<li>Testez la restauration de vos sauvegardes</li>';
                echo '<li>Conservez plusieurs versions de sauvegarde</li>';
                echo '</ul>';
                echo '</div>';
                
            } catch (Exception $e) {
                echo '<div class="step error">';
                echo '<h3>❌ Erreur</h3>';
                echo '<p>Impossible d\'accéder à la base de données: ' . htmlspecialchars($e->getMessage()) . '</p>';
                echo '</div>';
            }
            
            ?>
            <script>
            function generateSQLDump() {
                alert('Fonctionnalité en cours de développement.\nUtilisez phpMyAdmin pour exporter la base "depot_manager".');
            }
            </script>
            <?php
        }
        ?>
        
        <div class="step">
            <h3>🔗 Navigation</h3>
            <a href="?action=info" class="btn">📋 Informations</a>
            <a href="?action=extract" class="btn">📤 Migration</a>
            <a href="?action=backup" class="btn">💾 Sauvegarde</a>
            <a href="install.php" class="btn">🔧 Installation</a>
            <a href="index.html" class="btn btn-success">🏠 Application</a>
        </div>
    </div>
</body>
</html>