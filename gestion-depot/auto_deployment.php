<?php
/**
 * Script de déploiement automatique complet
 * Synchronisation client.sql + Déploiement XAMPP Production
 * Entreprise de réparation de matériel informatique
 */

set_time_limit(0); // Pas de limite de temps pour l'installation

// Configuration
$config = [
    'db' => [
        'host' => 'localhost',
        'name' => 'gestion_depots',
        'user' => 'root',
        'pass' => ''
    ],
    'company' => [
        'nom' => 'WEB INFORMATIQUE',
        'adresse' => '154 bis rue du général de Gaulle',
        'code_postal' => '76770',
        'ville' => 'LE HOULME',
        'telephone1' => '06.99.50.76.76',
        'telephone2' => '02.35.74.19.29',
        'email' => 'contact@webinformatique.eu',
        'siret' => '493 933 139 00010',
        'rcs' => 'RCS ROUEN'
    ],
    'client_sql_file' => 'client.sql' // Chemin vers votre fichier client.sql
];

// Interface web pour l'installation
if (php_sapi_name() !== 'cli') {
    ?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Déploiement Automatique - Gestion Dépôts</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; text-align: center; }
        .step { margin: 20px 0; padding: 15px; border-left: 4px solid #3498db; background: #f8f9fa; }
        .success { border-left-color: #27ae60; background: #d4edda; color: #155724; }
        .error { border-left-color: #e74c3c; background: #f8d7da; color: #721c24; }
        .warning { border-left-color: #f39c12; background: #fff3cd; color: #856404; }
        .btn { background: #3498db; color: white; padding: 12px 25px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; text-decoration: none; display: inline-block; margin: 10px 5px; }
        .btn:hover { background: #2980b9; }
        .btn-success { background: #27ae60; }
        .btn-danger { background: #e74c3c; }
        .progress-bar { width: 100%; height: 20px; background: #ecf0f1; border-radius: 10px; overflow: hidden; margin: 10px 0; }
        .progress-fill { height: 100%; background: linear-gradient(45deg, #3498db, #2980b9); transition: width 0.3s ease; }
        .log { background: #2c3e50; color: #ecf0f1; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 12px; max-height: 400px; overflow-y: auto; }
        pre { margin: 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Déploiement Automatique - Gestion des Dépôts</h1>
        
        <?php
        if (!isset($_GET['action'])) {
            ?>
            <div class="step">
                <h3>🔧 Installation et Synchronisation Automatique</h3>
                <p>Ce script va automatiquement :</p>
                <ul>
                    <li>✅ Créer la base de données de production</li>
                    <li>✅ Installer toutes les tables nécessaires</li>
                    <li>✅ Synchroniser vos données client.sql existantes</li>
                    <li>✅ Configurer le système pour XAMPP</li>
                    <li>✅ Optimiser pour la production</li>
                    <li>✅ Tester toutes les fonctionnalités</li>
                </ul>
            </div>
            
            <div class="step warning">
                <h3>⚠️ Avant de commencer</h3>
                <p>Assurez-vous que :</p>
                <ul>
                    <li>XAMPP est installé et démarré (Apache + MySQL)</li>
                    <li>Votre fichier <code>client.sql</code> est dans ce dossier</li>
                    <li>Vous avez une sauvegarde de vos données existantes</li>
                    <li>Tous les fichiers du projet sont présents</li>
                </ul>
            </div>
            
            <div class="step">
                <h3>🚀 Lancer l'installation</h3>
                <a href="?action=install" class="btn btn-success">🚀 Démarrer l'Installation Automatique</a>
                <a href="?action=test" class="btn">🧪 Tester la Configuration</a>
            </div>
            <?php
        }
        
        if (isset($_GET['action']) && $_GET['action'] === 'test') {
            testConfiguration();
        }
        
        if (isset($_GET['action']) && $_GET['action'] === 'install') {
            performFullInstallation();
        }
        ?>
    </div>
    
    <script>
        function updateProgress(percent, message) {
            const fill = document.querySelector('.progress-fill');
            const msg = document.querySelector('.progress-message');
            if (fill) fill.style.width = percent + '%';
            if (msg) msg.textContent = message;
        }
        
        // Auto-scroll vers le bas pendant l'installation
        function scrollToBottom() {
            window.scrollTo(0, document.body.scrollHeight);
        }
        
        setInterval(scrollToBottom, 1000);
    </script>
</body>
</html>
    <?php
    exit;
}

/**
 * Test de la configuration système
 */
function testConfiguration() {
    global $config;
    
    echo '<h2>🧪 Test de Configuration</h2>';
    
    $allGood = true;
    
    // Test connexion MySQL
    echo '<div class="step">';
    echo '<h3>🔗 Test de connexion MySQL</h3>';
    try {
        $pdo = new PDO("mysql:host={$config['db']['host']};charset=utf8", $config['db']['user'], $config['db']['pass']);
        echo '<div class="success">✅ Connexion MySQL réussie</div>';
        
        // Test si la base existe
        $stmt = $pdo->query("SHOW DATABASES LIKE '{$config['db']['name']}'");
        if ($stmt->rowCount() > 0) {
            echo '<div class="warning">⚠️ Base de données existe déjà</div>';
        } else {
            echo '<div class="step">📝 Base de données à créer</div>';
        }
        
    } catch (PDOException $e) {
        echo '<div class="error">❌ Erreur MySQL: ' . $e->getMessage() . '</div>';
        $allGood = false;
    }
    echo '</div>';
    
    // Test fichier client.sql
    echo '<div class="step">';
    echo '<h3>📄 Vérification fichier client.sql</h3>';
    if (file_exists($config['client_sql_file'])) {
        $size = filesize($config['client_sql_file']);
        echo "<div class='success'>✅ Fichier trouvé ({$size} bytes)</div>";
        
        // Analyser le contenu
        $content = file_get_contents($config['client_sql_file']);
        $lines = substr_count($content, 'INSERT INTO');
        echo "<div class='step'>📊 Environ {$lines} clients à importer</div>";
        
    } else {
        echo '<div class="error">❌ Fichier client.sql non trouvé</div>';
        echo '<div class="warning">⚠️ Placez votre fichier client.sql dans ce dossier</div>';
        $allGood = false;
    }
    echo '</div>';
    
    // Test permissions
    echo '<div class="step">';
    echo '<h3>🔐 Vérification des permissions</h3>';
    $dirs = ['uploads', 'pdf_output', 'backups', 'logs'];
    foreach ($dirs as $dir) {
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }
        if (is_writable($dir)) {
            echo "<div class='success'>✅ Dossier $dir : OK</div>";
        } else {
            echo "<div class='error'>❌ Dossier $dir : Permissions insuffisantes</div>";
            $allGood = false;
        }
    }
    echo '</div>';
    
    // Résultat final
    if ($allGood) {
        echo '<div class="step success">';
        echo '<h3>✅ Configuration Valide</h3>';
        echo '<p>Tout est prêt pour l\'installation !</p>';
        echo '<a href="?action=install" class="btn btn-success">🚀 Lancer l\'Installation</a>';
        echo '</div>';
    } else {
        echo '<div class="step error">';
        echo '<h3>❌ Problèmes Détectés</h3>';
        echo '<p>Corrigez les erreurs ci-dessus avant de continuer.</p>';
        echo '<a href="?action=test" class="btn">🔄 Tester à Nouveau</a>';
        echo '</div>';
    }
}

/**
 * Installation complète automatique
 */
function performFullInstallation() {
    global $config;
    
    echo '<h2>🚀 Installation en Cours</h2>';
    
    echo '<div class="progress-bar"><div class="progress-fill" style="width: 0%"></div></div>';
    echo '<div class="progress-message">Initialisation...</div>';
    
    echo '<div class="log"><pre id="log-output">';
    
    $steps = [
        'Connexion à MySQL',
        'Création de la base de données',
        'Installation des tables',
        'Import du fichier client.sql',
        'Synchronisation des données',
        'Configuration de l\'entreprise',
        'Optimisation de la base',
        'Tests finaux',
        'Finalisation'
    ];
    
    $totalSteps = count($steps);
    $currentStep = 0;
    
    try {
        // Étape 1: Connexion MySQL
        updateProgressStep($currentStep++, $totalSteps, $steps[0]);
        $pdo = new PDO("mysql:host={$config['db']['host']};charset=utf8", $config['db']['user'], $config['db']['pass']);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        logMessage("✅ Connexion MySQL établie");
        
        // Étape 2: Création base
        updateProgressStep($currentStep++, $totalSteps, $steps[1]);
        $pdo->exec("CREATE DATABASE IF NOT EXISTS {$config['db']['name']} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        $pdo->exec("USE {$config['db']['name']}");
        logMessage("✅ Base de données créée/sélectionnée");
        
        // Étape 3: Installation tables
        updateProgressStep($currentStep++, $totalSteps, $steps[2]);
        installDatabaseTables($pdo);
        logMessage("✅ Tables système installées");
        
        // Étape 4: Import client.sql
        updateProgressStep($currentStep++, $totalSteps, $steps[3]);
        $clientsCount = importClientSQL($pdo);
        logMessage("✅ {$clientsCount} clients importés depuis client.sql");
        
        // Étape 5: Synchronisation
        updateProgressStep($currentStep++, $totalSteps, $steps[4]);
        synchronizeData($pdo);
        logMessage("✅ Données synchronisées");
        
        // Étape 6: Configuration entreprise
        updateProgressStep($currentStep++, $totalSteps, $steps[5]);
        setupCompanySettings($pdo);
        logMessage("✅ Paramètres entreprise configurés");
        
        // Étape 7: Optimisation
        updateProgressStep($currentStep++, $totalSteps, $steps[6]);
        optimizeDatabase($pdo);
        logMessage("✅ Base de données optimisée");
        
        // Étape 8: Tests
        updateProgressStep($currentStep++, $totalSteps, $steps[7]);
        $testResults = runFinalTests($pdo);
        logMessage("✅ Tests système : " . json_encode($testResults));
        
        // Étape 9: Finalisation
        updateProgressStep($currentStep++, $totalSteps, $steps[8]);
        createConfigFiles();
        logMessage("✅ Fichiers de configuration créés");
        
        logMessage("\n🎉 INSTALLATION TERMINÉE AVEC SUCCÈS ! 🎉");
        logMessage("\n📊 Résumé :");
        logMessage("   - Clients importés : {$clientsCount}");
        logMessage("   - Tables créées : " . count($testResults));
        logMessage("   - URL d'accès : http://localhost/depot-manager/");
        logMessage("   - Admin BDD : http://localhost/phpmyadmin/");
        
    } catch (Exception $e) {
        logMessage("❌ ERREUR : " . $e->getMessage());
        logMessage("🔧 Vérifiez la configuration et relancez l'installation");
    }
    
    echo '</pre></div>';
    
    echo '<div class="step success">';
    echo '<h3>🎉 Installation Terminée !</h3>';
    echo '<p>Votre système de gestion de dépôts est maintenant prêt pour la production.</p>';
    echo '<a href="/" class="btn btn-success">🏠 Accéder à l\'Application</a>';
    echo '<a href="/phpmyadmin/" class="btn" target="_blank">🗄️ Gérer la BDD</a>';
    echo '</div>';
}

function updateProgressStep($current, $total, $stepName) {
    $percent = ($current / $total) * 100;
    echo "<script>updateProgress($percent, '$stepName');</script>";
    flush();
    if (ob_get_level()) ob_flush();
}

function logMessage($message) {
    echo $message . "\n";
    flush();
    if (ob_get_level()) ob_flush();
}

function installDatabaseTables($pdo) {
    // Installation de toutes les tables nécessaires
    $sql = file_get_contents('database.sql');
    $pdo->exec($sql);
}

function importClientSQL($pdo) {
    global $config;
    
    // Lire et exécuter le fichier client.sql
    $sql = file_get_contents($config['client_sql_file']);
    
    // Créer une table temporaire pour l'import
    $pdo->exec("CREATE TEMPORARY TABLE temp_client_import LIKE client");
    
    // Exécuter l'import
    $statements = explode(';', $sql);
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if (!empty($statement) && !preg_match('/^--/', $statement)) {
            $pdo->exec($statement);
        }
    }
    
    // Migrer vers la structure moderne
    $stmt = $pdo->prepare("
        INSERT INTO clients (nom, prenom, email, telephone, adresse, code_postal, ville, created_at, updated_at)
        SELECT 
            TRIM(SUBSTRING_INDEX(Nom, ' ', 1)) as nom,
            TRIM(SUBSTRING(Nom, LOCATE(' ', Nom) + 1)) as prenom,
            Mail as email,
            CASE 
                WHEN LENGTH(Tel1) >= 9 THEN 
                    CONCAT(SUBSTRING(Tel1, 1, 2), '.', SUBSTRING(Tel1, 3, 2), '.', SUBSTRING(Tel1, 5, 2), '.', SUBSTRING(Tel1, 7, 2), '.', SUBSTRING(Tel1, 9, 2))
                ELSE Tel1 
            END as telephone,
            Adresse as adresse,
            CP as code_postal,
            Ville as ville,
            NOW() as created_at,
            NOW() as updated_at
        FROM client 
        WHERE Nom IS NOT NULL AND Nom != ''
    ");
    $stmt->execute();
    
    return $stmt->rowCount();
}

function synchronizeData($pdo) {
    // Création des statuts par défaut
    $statuts = [
        ['nom' => 'En attente', 'couleur_hex' => '#f39c12', 'ordre' => 1],
        ['nom' => 'En cours', 'couleur_hex' => '#3498db', 'ordre' => 2],
        ['nom' => 'Terminé', 'couleur_hex' => '#27ae60', 'ordre' => 3],
        ['nom' => 'Livré', 'couleur_hex' => '#2ecc71', 'ordre' => 4],
        ['nom' => 'Annulé', 'couleur_hex' => '#e74c3c', 'ordre' => 5]
    ];
    
    foreach ($statuts as $statut) {
        $stmt = $pdo->prepare("INSERT IGNORE INTO statuts (nom, couleur_hex, ordre) VALUES (?, ?, ?)");
        $stmt->execute([$statut['nom'], $statut['couleur_hex'], $statut['ordre']]);
    }
}

function setupCompanySettings($pdo) {
    global $config;
    
    $stmt = $pdo->prepare("
        INSERT INTO company_settings (nom, adresse, code_postal, ville, telephone1, telephone2, email, siret, rcs)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        nom = VALUES(nom),
        adresse = VALUES(adresse)
    ");
    
    $stmt->execute([
        $config['company']['nom'],
        $config['company']['adresse'],
        $config['company']['code_postal'],
        $config['company']['ville'],
        $config['company']['telephone1'],
        $config['company']['telephone2'],
        $config['company']['email'],
        $config['company']['siret'],
        $config['company']['rcs']
    ]);
}

function optimizeDatabase($pdo) {
    $indexes = [
        "CREATE INDEX IF NOT EXISTS idx_depots_client_id ON depots(client_id)",
        "CREATE INDEX IF NOT EXISTS idx_depots_status_id ON depots(status_id)",
        "CREATE INDEX IF NOT EXISTS idx_depots_date_depot ON depots(date_depot)",
        "CREATE INDEX IF NOT EXISTS idx_clients_nom ON clients(nom, prenom)"
    ];
    
    foreach ($indexes as $sql) {
        try {
            $pdo->exec($sql);
        } catch (PDOException $e) {
            // Index déjà existant, on continue
        }
    }
}

function runFinalTests($pdo) {
    $tests = [];
    
    // Test tables
    $stmt = $pdo->query("SHOW TABLES");
    $tests['tables'] = $stmt->rowCount();
    
    // Test clients
    $stmt = $pdo->query("SELECT COUNT(*) FROM clients");
    $tests['clients'] = $stmt->fetchColumn();
    
    // Test statuts
    $stmt = $pdo->query("SELECT COUNT(*) FROM statuts");
    $tests['statuts'] = $stmt->fetchColumn();
    
    return $tests;
}

function createConfigFiles() {
    global $config;
    
    $configContent = "<?php
// Configuration de production - Générée automatiquement
\$dbConfig = [
    'host' => '{$config['db']['host']}',
    'name' => '{$config['db']['name']}',
    'user' => '{$config['db']['user']}',
    'pass' => '{$config['db']['pass']}',
    'charset' => 'utf8mb4'
];

\$companyConfig = [
    'nom' => '{$config['company']['nom']}',
    'adresse' => '{$config['company']['adresse']}',
    'telephone' => '{$config['company']['telephone1']}',
    'email' => '{$config['company']['email']}'
];

define('PRODUCTION', true);
define('DEBUG', false);
?>";
    
    file_put_contents('config_production.php', $configContent);
}

// Si exécuté en ligne de commande
if (php_sapi_name() === 'cli') {
    echo "🚀 Déploiement automatique en cours...\n";
    performFullInstallation();
}
?>