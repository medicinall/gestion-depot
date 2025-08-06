<?php
/**
 * Configuration de l'application pour utiliser votre base "client" existante
 * Au lieu de créer une nouvelle base "gestion_depots"
 */

echo "🔧 CONFIGURATION POUR VOTRE BASE EXISTANTE 'client'\n";
echo "==================================================\n\n";

// Configuration de votre base existante
$host = 'localhost';
$dbname = 'client';  // Votre base existante
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ Connexion à votre base 'client' réussie\n\n";
} catch (PDOException $e) {
    die("❌ Erreur de connexion : " . $e->getMessage() . "\n");
}

// Fonction pour vérifier si une table existe
function tableExists($pdo, $table) {
    try {
        $stmt = $pdo->prepare("SHOW TABLES LIKE :table");
        $stmt->execute([':table' => $table]);
        return $stmt->rowCount() > 0;
    } catch (PDOException $e) {
        return false;
    }
}

// 1. Vérifier la structure existante
echo "1️⃣ ANALYSE DE VOTRE BASE EXISTANTE\n";
echo "-----------------------------------\n";

// Lister les tables existantes
$stmt = $pdo->query("SHOW TABLES");
$existingTables = $stmt->fetchAll(PDO::FETCH_COLUMN);

echo "📋 Tables trouvées dans votre base :\n";
foreach ($existingTables as $table) {
    $stmt = $pdo->query("SELECT COUNT(*) FROM `$table`");
    $count = $stmt->fetchColumn();
    echo "  - $table ($count enregistrements)\n";
}

// Analyser la structure de la table client
echo "\n📊 Structure de votre table 'client' :\n";
$stmt = $pdo->query("SHOW COLUMNS FROM client");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($columns as $column) {
    echo "  - {$column['Field']} ({$column['Type']})\n";
}

echo "\n";

// 2. Créer les tables manquantes pour les dépôts
echo "2️⃣ CRÉATION DES TABLES COMPLÉMENTAIRES\n";
echo "--------------------------------------\n";

// Table des statuts
if (!tableExists($pdo, 'statuts')) {
    echo "📝 Création de la table 'statuts'...\n";
    $sql = "
    CREATE TABLE statuts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nom VARCHAR(50) NOT NULL,
        description TEXT,
        couleur_hex VARCHAR(7) DEFAULT '#007bff',
        ordre INT DEFAULT 1,
        actif TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    
    $pdo->exec($sql);
    
    // Insérer les statuts par défaut
    $statuts = [
        ['En attente', 'Dépôt reçu, en attente de diagnostic', '#ffc107', 1],
        ['En cours', 'Diagnostic en cours ou réparation en cours', '#17a2b8', 2],
        ['Prêt', 'Réparation terminée, prêt à récupérer', '#28a745', 3],
        ['Récupéré', 'Dépôt récupéré par le client', '#6c757d', 4],
        ['Abandonné', 'Dépôt abandonné par le client', '#dc3545', 5]
    ];
    
    $stmt = $pdo->prepare("INSERT INTO statuts (nom, description, couleur_hex, ordre) VALUES (?, ?, ?, ?)");
    foreach ($statuts as $statut) {
        $stmt->execute($statut);
    }
    echo "  ✅ Table 'statuts' créée avec statuts par défaut\n";
} else {
    echo "  ⚠️ Table 'statuts' déjà présente\n";
}

// Table des dépôts
if (!tableExists($pdo, 'depots')) {
    echo "📝 Création de la table 'depots'...\n";
    $sql = "
    CREATE TABLE depots (
        id INT PRIMARY KEY AUTO_INCREMENT,
        client_id INT NOT NULL,
        description TEXT NOT NULL,
        notes TEXT,
        date_depot DATE NOT NULL,
        date_prevue DATE,
        status_id INT DEFAULT 1,
        archived TINYINT(1) DEFAULT 0,
        designation_references TEXT,
        observation_travaux TEXT,
        donnees_sauvegarder ENUM('Oui', 'Non') DEFAULT 'Non',
        outlook_sauvegarder ENUM('Oui', 'Non') DEFAULT 'Non',
        mot_de_passe VARCHAR(255),
        informations_complementaires TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES client(No) ON DELETE CASCADE,
        FOREIGN KEY (status_id) REFERENCES statuts(id),
        INDEX idx_client_id (client_id),
        INDEX idx_status_id (status_id),
        INDEX idx_date_depot (date_depot),
        INDEX idx_archived (archived)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    
    $pdo->exec($sql);
    echo "  ✅ Table 'depots' créée\n";
} else {
    echo "  ⚠️ Table 'depots' déjà présente\n";
}

// Table des paramètres de l'entreprise
if (!tableExists($pdo, 'company_settings')) {
    echo "📝 Création de la table 'company_settings'...\n";
    $sql = "
    CREATE TABLE company_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nom VARCHAR(100) NOT NULL DEFAULT 'WEB INFORMATIQUE',
        adresse VARCHAR(255) NOT NULL DEFAULT '154 bis rue du général de Gaulle',
        code_postal VARCHAR(10) NOT NULL DEFAULT '76770',
        ville VARCHAR(100) NOT NULL DEFAULT 'LE HOULME',
        telephone1 VARCHAR(20) NOT NULL DEFAULT '06.99.50.76.76',
        telephone2 VARCHAR(20) NOT NULL DEFAULT '02.35.74.19.29',
        email VARCHAR(100) NOT NULL DEFAULT 'contact@webinformatique.eu',
        siret VARCHAR(20) NOT NULL DEFAULT '493 933 139 00010',
        rcs VARCHAR(50) NOT NULL DEFAULT 'RCS ROUEN',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    
    $pdo->exec($sql);
    
    // Insérer les paramètres par défaut
    $insertSql = "
    INSERT INTO company_settings (nom, adresse, code_postal, ville, telephone1, telephone2, email, siret, rcs)
    VALUES ('WEB INFORMATIQUE', '154 bis rue du général de Gaulle', '76770', 'LE HOULME', 
            '06.99.50.76.76', '02.35.74.19.29', 'contact@webinformatique.eu', 
            '493 933 139 00010', 'RCS ROUEN')";
    
    $pdo->exec($insertSql);
    echo "  ✅ Table 'company_settings' créée avec paramètres par défaut\n";
} else {
    echo "  ⚠️ Table 'company_settings' déjà présente\n";
}

echo "\n";

// 3. Créer des dépôts de test si aucun n'existe
echo "3️⃣ DONNÉES DE TEST\n";
echo "------------------\n";

if (tableExists($pdo, 'depots')) {
    $stmt = $pdo->query("SELECT COUNT(*) FROM depots");
    $count = $stmt->fetchColumn();
    
    if ($count == 0) {
        echo "📝 Ajout de quelques dépôts de test...\n";
        
        // Récupérer quelques clients existants
        $stmt = $pdo->query("SELECT No FROM client LIMIT 3");
        $clientIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        if (count($clientIds) > 0) {
            $depotsTest = [
                [
                    'client_id' => $clientIds[0],
                    'description' => 'Ordinateur portable ne démarre plus',
                    'notes' => 'Écran noir au démarrage, ventilateur fonctionne',
                    'date_depot' => date('Y-m-d'),
                    'date_prevue' => date('Y-m-d', strtotime('+3 days')),
                    'status_id' => 1
                ],
                [
                    'client_id' => $clientIds[1] ?? $clientIds[0],
                    'description' => 'Smartphone écran cassé',
                    'notes' => 'Chute, écran fissuré mais tactile fonctionne',
                    'date_depot' => date('Y-m-d', strtotime('-1 day')),
                    'date_prevue' => date('Y-m-d', strtotime('+2 days')),
                    'status_id' => 2
                ],
                [
                    'client_id' => $clientIds[2] ?? $clientIds[0],
                    'description' => 'Imprimante ne fonctionne plus',
                    'notes' => 'Plus de connexion WiFi',
                    'date_depot' => date('Y-m-d', strtotime('-2 days')),
                    'date_prevue' => date('Y-m-d', strtotime('+1 day')),
                    'status_id' => 3
                ]
            ];
            
            $stmt = $pdo->prepare("
                INSERT INTO depots (client_id, description, notes, date_depot, date_prevue, status_id)
                VALUES (:client_id, :description, :notes, :date_depot, :date_prevue, :status_id)
            ");
            
            foreach ($depotsTest as $depot) {
                $stmt->execute($depot);
                echo "  ✅ Dépôt de test ajouté\n";
            }
        }
    } else {
        echo "  ℹ️ $count dépôts déjà présents\n";
    }
}

echo "\n";

// 4. Statistiques finales
echo "4️⃣ RÉSUMÉ FINAL\n";
echo "---------------\n";

$stats = [];
foreach (['client', 'depots', 'statuts', 'company_settings'] as $table) {
    if (tableExists($pdo, $table)) {
        $stmt = $pdo->query("SELECT COUNT(*) FROM `$table`");
        $stats[$table] = $stmt->fetchColumn();
    }
}

echo "📊 Votre base 'client' contient maintenant :\n";
foreach ($stats as $table => $count) {
    $icon = $table == 'client' ? '👥' : ($table == 'depots' ? '📦' : '⚙️');
    echo "  $icon $table: $count enregistrement(s)\n";
}

echo "\n✅ CONFIGURATION TERMINÉE AVEC SUCCÈS !\n\n";

echo "📋 PROCHAINES ÉTAPES :\n";
echo "1. Ouvrez tous vos fichiers PHP (api_clients.php, api_mysql.js, etc.)\n";
echo "2. Remplacez 'gestion_depots' par 'client' dans les configurations\n";
echo "3. Votre application utilisera maintenant votre base existante !\n";

// 5. Générer le fichier de configuration
echo "\n🔧 Génération du fichier de configuration...\n";

$configContent = "<?php
/**
 * Configuration de la base de données
 * Généré automatiquement pour utiliser votre base 'client' existante
 */

define('DB_HOST', 'localhost');
define('DB_NAME', 'client');  // Votre base existante
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8');

/**
 * Fonction de connexion à la base de données
 */
function getDbConnection() {
    try {
        \$pdo = new PDO(
            'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET,
            DB_USER,
            DB_PASS
        );
        \$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return \$pdo;
    } catch (PDOException \$e) {
        throw new Exception('Erreur de connexion à la base de données: ' . \$e->getMessage());
    }
}

/**
 * Mapping des colonnes entre votre table 'client' et l'interface
 */
define('CLIENT_COLUMNS_MAPPING', [
    'id' => 'No',
    'nom' => 'Nom',
    'prenom' => null,  // À extraire du champ Nom si nécessaire
    'email' => 'Mail',
    'telephone' => 'Tel1',
    'adresse' => 'Adresse',
    'code_postal' => 'CP',
    'ville' => 'Ville'
]);
?>";

file_put_contents('config_db.php', $configContent);
echo "  ✅ Fichier 'config_db.php' créé\n";

echo "\n🎉 VOTRE APPLICATION EST MAINTENANT CONFIGURÉE POUR VOTRE BASE 'client' !\n";
?>