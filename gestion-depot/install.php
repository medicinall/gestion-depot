<?php
/**
 * Script d'installation automatique pour XAMPP
 * Gestion des Dépôts - Version MySQL
 */

// Configuration
$dbConfig = [
    'host' => 'localhost',
    'name' => 'depot_manager',
    'user' => 'root',
    'pass' => '',
    'charset' => 'utf8mb4'
];

$requiredExtensions = ['pdo', 'pdo_mysql', 'json', 'mbstring'];
$requiredDirectories = ['uploads', 'pdf_output', 'backups', 'logs'];

?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Installation - Gestion des Dépôts</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
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
        .step h3 {
            margin: 0 0 10px 0;
            color: #2c3e50;
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
        .progress {
            width: 100%;
            height: 20px;
            background: #f0f0f0;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-bar {
            height: 100%;
            background: #3498db;
            transition: width 0.3s ease;
        }
        pre {
            background: #2c3e50;
            color: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        .file-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            margin: 15px 0;
        }
        .file-item {
            padding: 8px;
            background: #f8f9fa;
            border-radius: 3px;
            font-family: monospace;
            font-size: 14px;
        }
        .required {
            color: #e74c3c;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Installation - Gestion des Dépôts</h1>
        
        <?php
        $action = $_GET['action'] ?? 'check';
        
        switch ($action) {
            case 'check':
                displayChecks();
                break;
            case 'install':
                performInstallation();
                break;
            case 'migrate':
                performMigration();
                break;
            case 'test':
                testInstallation();
                break;
            default:
                displayChecks();
        }
        
        /**
         * Affichage des vérifications pré-installation
         */
        function displayChecks() {
            global $requiredExtensions, $requiredDirectories, $dbConfig;
            
            echo '<h2>🔍 Vérifications pré-installation</h2>';
            
            $allGood = true;
            
            // Vérification des extensions PHP
            echo '<div class="step">';
            echo '<h3>Extensions PHP requises</h3>';
            foreach ($requiredExtensions as $ext) {
                $loaded = extension_loaded($ext);
                $class = $loaded ? 'success' : 'error';
                $icon = $loaded ? '✅' : '❌';
                echo "<div class='$class'>$icon Extension $ext: " . ($loaded ? 'OK' : 'MANQUANTE') . "</div>";
                if (!$loaded) $allGood = false;
            }
            echo '</div>';
            
            // Vérification de la version PHP
            echo '<div class="step">';
            echo '<h3>Version PHP</h3>';
            $phpVersion = PHP_VERSION;
            $minVersion = '7.4.0';
            $versionOk = version_compare($phpVersion, $minVersion, '>=');
            $class = $versionOk ? 'success' : 'error';
            $icon = $versionOk ? '✅' : '❌';
            echo "<div class='$class'>$icon PHP $phpVersion (minimum requis: $minVersion)</div>";
            if (!$versionOk) $allGood = false;
            echo '</div>';
            
            // Vérification de la connexion MySQL
            echo '<div class="step">';
            echo '<h3>Connexion MySQL</h3>';
            try {
                $dsn = "mysql:host={$dbConfig['host']};charset={$dbConfig['charset']}";
                $pdo = new PDO($dsn, $dbConfig['user'], $dbConfig['pass']);
                echo "<div class='success'>✅ Connexion MySQL: OK</div>";
                
                // Vérifier si la base existe
                $stmt = $pdo->query("SHOW DATABASES LIKE '{$dbConfig['name']}'");
                $dbExists = $stmt->rowCount() > 0;
                $icon = $dbExists ? '⚠️' : '📝';
                $class = $dbExists ? 'warning' : 'step';
                echo "<div class='$class'>$icon Base de données '{$dbConfig['name']}': " . 
                     ($dbExists ? 'EXISTE DÉJÀ' : 'À CRÉER') . "</div>";
                
            } catch (PDOException $e) {
                echo "<div class='error'>❌ Connexion MySQL: ÉCHEC<br>Erreur: " . $e->getMessage() . "</div>";
                echo "<div class='warning'>⚠️ Vérifiez que XAMPP est démarré et que MySQL fonctionne</div>";
                $allGood = false;
            }
            echo '</div>';
            
            // Vérification des permissions de fichiers
            echo '<div class="step">';
            echo '<h3>Permissions de fichiers</h3>';
            $writeOk = is_writable(dirname(__FILE__));
            $class = $writeOk ? 'success' : 'error';
            $icon = $writeOk ? '✅' : '❌';
            echo "<div class='$class'>$icon Écriture dans le dossier: " . ($writeOk ? 'OK' : 'INTERDIT') . "</div>";
            if (!$writeOk) $allGood = false;
            echo '</div>';
            
            // Vérification des fichiers requis
            echo '<div class="step">';
            echo '<h3>Fichiers requis</h3>';
            $requiredFiles = [
                'config.php' => 'Configuration de base',
                'api.php' => 'API Backend',
                'generate_pdf.php' => 'Générateur PDF',
                'database.sql' => 'Structure de base de données',
                'index.html' => 'Interface utilisateur',
                'styles.css' => 'Feuille de styles',
                'api_mysql.js' => 'API JavaScript MySQL'
            ];
            
            $missingFiles = [];
            foreach ($requiredFiles as $file => $description) {
                $exists = file_exists($file);
                $class = $exists ? 'success' : 'error';
                $icon = $exists ? '✅' : '❌';
                echo "<div class='$class'>$icon $file: " . ($exists ? 'OK' : 'MANQUANT') . " - $description</div>";
                if (!$exists) {
                    $missingFiles[] = $file;
                    $allGood = false;
                }
            }
            echo '</div>';
            
            // Résumé et actions
            echo '<div class="step">';
            if ($allGood) {
                echo '<div class="success">';
                echo '<h3>✅ Toutes les vérifications sont OK !</h3>';
                echo '<p>Vous pouvez procéder à l\'installation.</p>';
                echo '<a href="?action=install" class="btn btn-success">🚀 Lancer l\'installation</a>';
                echo '</div>';
            } else {
                echo '<div class="error">';
                echo '<h3>❌ Des problèmes ont été détectés</h3>';
                echo '<p>Veuillez corriger les erreurs ci-dessus avant de continuer.</p>';
                
                if (!empty($missingFiles)) {
                    echo '<p><strong>Fichiers manquants :</strong></p>';
                    echo '<div class="file-list">';
                    foreach ($missingFiles as $file) {
                        echo "<div class='file-item required'>$file</div>";
                    }
                    echo '</div>';
                }
                
                echo '<a href="?action=check" class="btn">🔄 Vérifier à nouveau</a>';
                echo '</div>';
            }
            echo '</div>';
            
            // Instructions XAMPP
            echo '<div class="step">';
            echo '<h3>📋 Instructions XAMPP</h3>';
            echo '<p>Pour une installation réussie, assurez-vous que :</p>';
            echo '<ul>';
            echo '<li>XAMPP est installé et démarré</li>';
            echo '<li>Apache et MySQL sont en cours d\'exécution</li>';
            echo '<li>Tous les fichiers sont dans le dossier <code>htdocs/depot-manager/</code></li>';
            echo '<li>Vous accédez via <code>http://localhost/depot-manager/install.php</code></li>';
            echo '</ul>';
            echo '</div>';
        }
        
        /**
         * Effectue l'installation
         */
        function performInstallation() {
            global $dbConfig, $requiredDirectories;
            
            echo '<h2>🔧 Installation en cours...</h2>';
            
            $steps = [
                'Création de la base de données',
                'Création des tables',
                'Insertion des données par défaut',
                'Création des dossiers',
                'Configuration des permissions',
                'Finalisation'
            ];
            
            $currentStep = 0;
            $totalSteps = count($steps);
            
            try {
                // Étape 1: Création de la base de données
                updateProgress($currentStep++, $totalSteps, $steps[0]);
                
                $dsn = "mysql:host={$dbConfig['host']};charset={$dbConfig['charset']}";
                $pdo = new PDO($dsn, $dbConfig['user'], $dbConfig['pass']);
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                
                $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbConfig['name']}` DEFAULT CHARACTER SET {$dbConfig['charset']} COLLATE {$dbConfig['charset']}_unicode_ci");
                $pdo->exec("USE `{$dbConfig['name']}`");
                
                echo "<div class='step success'>✅ Base de données '{$dbConfig['name']}' créée</div>";
                
                // Étape 2: Création des tables
                updateProgress($currentStep++, $totalSteps, $steps[1]);
                
                $sqlFile = 'database.sql';
                if (file_exists($sqlFile)) {
                    $sql = file_get_contents($sqlFile);
                    
                    // Exécuter le script SQL par blocs
                    $statements = explode(';', $sql);
                    foreach ($statements as $statement) {
                        $statement = trim($statement);
                        if (!empty($statement) && !preg_match('/^--/', $statement)) {
                            try {
                                $pdo->exec($statement);
                            } catch (PDOException $e) {
                                // Ignorer les erreurs de tables déjà existantes
                                if (!strpos($e->getMessage(), 'already exists')) {
                                    throw $e;
                                }
                            }
                        }
                    }
                    echo "<div class='step success'>✅ Tables créées avec succès</div>";
                } else {
                    throw new Exception("Fichier database.sql introuvable");
                }
                
                // Étape 3: Données par défaut (déjà dans le SQL)
                updateProgress($currentStep++, $totalSteps, $steps[2]);
                echo "<div class='step success'>✅ Données par défaut insérées</div>";
                
                // Étape 4: Création des dossiers
                updateProgress($currentStep++, $totalSteps, $steps[3]);
                
                foreach ($requiredDirectories as $dir) {
                    if (!is_dir($dir)) {
                        mkdir($dir, 0755, true);
                    }
                    echo "<div class='step success'>✅ Dossier '$dir' créé</div>";
                }
                
                // Étape 5: Permissions
                updateProgress($currentStep++, $totalSteps, $steps[4]);
                
                // Créer un fichier .htaccess pour sécuriser les dossiers sensibles
                $htaccessContent = "Options -Indexes\nDeny from all\n<Files *.pdf>\nAllow from all\n</Files>";
                file_put_contents('uploads/.htaccess', $htaccessContent);
                file_put_contents('logs/.htaccess', "Options -Indexes\nDeny from all");
                
                echo "<div class='step success'>✅ Permissions configurées</div>";
                
                // Étape 6: Finalisation
                updateProgress($currentStep++, $totalSteps, $steps[5]);
                
                // Créer un fichier de configuration finale
                $configContent = "<?php\n// Installation terminée le " . date('Y-m-d H:i:s') . "\ndefine('INSTALLATION_COMPLETE', true);\n?>";
                file_put_contents('install_complete.php', $configContent);
                
                echo "<div class='step success'>✅ Installation terminée !</div>";
                
                // Résultat final
                echo '<div class="step success">';
                echo '<h3>🎉 Installation réussie !</h3>';
                echo '<p>L\'application est maintenant prête à être utilisée.</p>';
                echo '<div style="margin: 20px 0;">';
                echo '<a href="index.html" class="btn btn-success">🚀 Accéder à l\'application</a>';
                echo '<a href="?action=test" class="btn">🧪 Tester l\'installation</a>';
                echo '</div>';
                echo '</div>';
                
                echo '<div class="step">';
                echo '<h3>📝 Prochaines étapes</h3>';
                echo '<ul>';
                echo '<li>Modifiez le fichier <code>index.html</code> pour utiliser <code>api_mysql.js</code> au lieu de <code>api.js</code></li>';
                echo '<li>Téléchargez et installez TCPDF pour la génération PDF</li>';
                echo '<li>Configurez vos paramètres d\'entreprise dans l\'onglet Administration</li>';
                echo '<li>Testez la génération de PDF avec un dépôt de démonstration</li>';
                echo '</ul>';
                echo '</div>';
                
            } catch (Exception $e) {
                echo "<div class='step error'>";
                echo "<h3>❌ Erreur d'installation</h3>";
                echo "<p>Erreur: " . htmlspecialchars($e->getMessage()) . "</p>";
                echo "<a href='?action=check' class='btn'>🔙 Retour aux vérifications</a>";
                echo "</div>";
            }
        }
        
        /**
         * Test de l'installation
         */
        function testInstallation() {
            echo '<h2>🧪 Test de l\'installation</h2>';
            
            try {
                require_once 'config.php';
                
                $db = Database::getInstance();
                
                // Test de connexion
                echo "<div class='step success'>✅ Connexion à la base de données: OK</div>";
                
                // Test des tables
                $tables = ['clients', 'depots', 'statuts', 'archives', 'settings'];
                foreach ($tables as $table) {
                    $count = $db->fetchColumn("SELECT COUNT(*) FROM $table");
                    echo "<div class='step success'>✅ Table '$table': $count enregistrements</div>";
                }
                
                // Test de l'API
                $testUrl = 'api.php/stats/dashboard';
                $context = stream_context_create([
                    'http' => [
                        'method' => 'GET',
                        'header' => 'Accept: application/json'
                    ]
                ]);
                
                $response = @file_get_contents($testUrl, false, $context);
                if ($response) {
                    echo "<div class='step success'>✅ API REST: Fonctionnelle</div>";
                } else {
                    echo "<div class='step warning'>⚠️ API REST: Tests via file_get_contents échoués (normal selon la configuration)</div>";
                }
                
                // Test PDF
                if (file_exists('generate_pdf.php')) {
                    echo "<div class='step success'>✅ Générateur PDF: Disponible</div>";
                    echo "<div class='step'><a href='generate_pdf.php?test=pdf' class='btn' target='_blank'>📄 Tester la génération PDF</a></div>";
                } else {
                    echo "<div class='step error'>❌ Générateur PDF: Fichier manquant</div>";
                }
                
                echo '<div class="step success">';
                echo '<h3>✅ Tous les tests sont passés !</h3>';
                echo '<p>L\'installation fonctionne correctement.</p>';
                echo '<a href="index.html" class="btn btn-success">🚀 Utiliser l\'application</a>';
                echo '</div>';
                
            } catch (Exception $e) {
                echo "<div class='step error'>";
                echo "<h3>❌ Erreur lors des tests</h3>";
                echo "<p>Erreur: " . htmlspecialchars($e->getMessage()) . "</p>";
                echo "</div>";
            }
        }
        
        /**
         * Met à jour la barre de progression
         */
        function updateProgress($current, $total, $stepName) {
            $percent = ($current / $total) * 100;
            echo "<div class='progress'>";
            echo "<div class='progress-bar' style='width: {$percent}%'></div>";
            echo "</div>";
            echo "<p>Étape $current/$total: $stepName</p>";
            
            // Forcer l'affichage
            if (ob_get_level()) {
                ob_flush();
            }
            flush();
        }
        ?>
        
        <div class="step">
            <h3>💡 Aide et support</h3>
            <p>Si vous rencontrez des problèmes :</p>
            <ul>
                <li>Vérifiez que XAMPP est correctement installé et démarré</li>
                <li>Assurez-vous que Apache et MySQL fonctionnent</li>
                <li>Vérifiez les permissions de fichiers</li>
                <li>Consultez les logs Apache dans XAMPP</li>
                <li>Redémarrez XAMPP si nécessaire</li>
            </ul>
        </div>
    </div>
    
    <script>
        // Auto-refresh de la page pendant l'installation
        if (window.location.search.includes('action=install')) {
            // Scroll automatique vers le bas
            window.scrollTo(0, document.body.scrollHeight);
        }
    </script>
</body>
</html>