<?php
/**
 * Script de synchronisation client.sql - Linux
 * Compatible avec Docker, LAMP natif, SQLite et migration XAMPP
 */

class ClientSynchronizer {
    private $config;
    private $pdo;
    private $mode;
    
    public function __construct() {
        // Détecter le mode d'installation
        $this->detectMode();
        $this->setupDatabase();
    }
    
    private function detectMode() {
        if (file_exists('config_docker.php')) {
            $this->mode = 'docker';
            require_once 'config_docker.php';
        } elseif (file_exists('config_sqlite.php')) {
            $this->mode = 'sqlite';
            require_once 'config_sqlite.php';
        } elseif (file_exists('config_native.php')) {
            $this->mode = 'native';
            require_once 'config_native.php';
        } else {
            $this->mode = 'auto';
            $this->autoDetectConfig();
        }
        
        global $dbConfig;
        $this->config = $dbConfig;
        
        echo "🔍 Mode détecté: " . $this->mode . "\n";
    }
    
    private function autoDetectConfig() {
        // Configuration automatique
        global $dbConfig;
        
        if (getenv('DOCKER_MODE')) {
            $dbConfig = [
                'host' => 'mysql',
                'name' => 'depot_manager',
                'user' => 'root',
                'pass' => 'depot123',
                'charset' => 'utf8mb4'
            ];
        } elseif (is_file('depot_manager.db')) {
            $dbConfig = [
                'dsn' => 'sqlite:depot_manager.db',
                'type' => 'sqlite'
            ];
        } else {
            $dbConfig = [
                'host' => 'localhost',
                'name' => 'depot_manager',
                'user' => 'root',
                'pass' => '',
                'charset' => 'utf8mb4'
            ];
        }
    }
    
    private function setupDatabase() {
        try {
            if (isset($this->config['type']) && $this->config['type'] === 'sqlite') {
                $this->pdo = new PDO($this->config['dsn']);
            } else {
                $dsn = "mysql:host={$this->config['host']};dbname={$this->config['name']};charset={$this->config['charset']}";
                $this->pdo = new PDO($dsn, $this->config['user'], $this->config['pass']);
            }
            
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            echo "✅ Connexion base de données réussie\n";
            
        } catch (PDOException $e) {
            die("❌ Erreur de connexion: " . $e->getMessage() . "\n");
        }
    }
    
    public function syncClientSQL($clientSQLFile) {
        echo "\n🔄 Synchronisation de $clientSQLFile\n";
        echo "=====================================\n";
        
        if (!file_exists($clientSQLFile)) {
            die("❌ Fichier $clientSQLFile non trouvé\n");
        }
        
        // Étape 1: Analyser le fichier client.sql
        $this->analyzeClientSQL($clientSQLFile);
        
        // Étape 2: Créer les tables si nécessaire
        $this->createTablesIfNotExists();
        
        // Étape 3: Importer et convertir les données
        $importedCount = $this->importAndConvertData($clientSQLFile);
        
        // Étape 4: Vérifications
        $this->verifyImport();
        
        echo "\n✅ Synchronisation terminée !\n";
        echo "📊 $importedCount clients importés\n";
        
        return $importedCount;
    }
    
    private function analyzeClientSQL($file) {
        echo "🔍 Analyse du fichier client.sql...\n";
        
        $content = file_get_contents($file);
        
        // Compter les INSERT
        $insertCount = substr_count($content, 'INSERT INTO');
        echo "  📊 Nombre d'INSERT détectés: $insertCount\n";
        
        // Détecter la structure
        if (strpos($content, 'CREATE TABLE') !== false) {
            echo "  ✅ Structure de table détectée\n";
        }
        
        // Détecter l'encodage
        $encoding = mb_detect_encoding($content, ['UTF-8', 'ISO-8859-1', 'Windows-1252']);
        echo "  📝 Encodage détecté: $encoding\n";
        
        if ($encoding !== 'UTF-8') {
            echo "  🔄 Conversion en UTF-8...\n";
            $content = mb_convert_encoding($content, 'UTF-8', $encoding);
            file_put_contents($file . '.utf8', $content);
        }
    }
    
    private function createTablesIfNotExists() {
        echo "🏗️  Création des tables...\n";
        
        if (isset($this->config['type']) && $this->config['type'] === 'sqlite') {
            $this->createSQLiteTables();
        } else {
            $this->createMySQLTables();
        }
    }
    
    private function createSQLiteTables() {
        $sql = "
        CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom VARCHAR(100) NOT NULL,
            prenom VARCHAR(100),
            email VARCHAR(150),
            telephone VARCHAR(20),
            adresse VARCHAR(255),
            code_postal VARCHAR(10),
            ville VARCHAR(100),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS statuts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom VARCHAR(50) NOT NULL UNIQUE,
            couleur_hex VARCHAR(7) DEFAULT '#3498db',
            ordre INTEGER DEFAULT 1
        );
        
        CREATE TABLE IF NOT EXISTS depots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            numero_depot VARCHAR(20) UNIQUE,
            client_id INTEGER,
            status_id INTEGER DEFAULT 1,
            description TEXT,
            notes TEXT,
            date_depot DATE DEFAULT CURRENT_DATE,
            date_prevue DATE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES clients(id),
            FOREIGN KEY (status_id) REFERENCES statuts(id)
        );
        ";
        
        $this->pdo->exec($sql);
        echo "  ✅ Tables SQLite créées\n";
    }
    
    private function createMySQLTables() {
        $sql = "
        CREATE TABLE IF NOT EXISTS clients (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nom VARCHAR(100) NOT NULL,
            prenom VARCHAR(100),
            email VARCHAR(150),
            telephone VARCHAR(20),
            adresse VARCHAR(255),
            code_postal VARCHAR(10),
            ville VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        
        CREATE TABLE IF NOT EXISTS statuts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nom VARCHAR(50) NOT NULL UNIQUE,
            couleur_hex VARCHAR(7) DEFAULT '#3498db',
            ordre INT DEFAULT 1
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        
        CREATE TABLE IF NOT EXISTS depots (
            id INT AUTO_INCREMENT PRIMARY KEY,
            numero_depot VARCHAR(20) UNIQUE,
            client_id INT,
            status_id INT DEFAULT 1,
            description TEXT,
            notes TEXT,
            date_depot DATE DEFAULT CURRENT_DATE,
            date_prevue DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES clients(id),
            FOREIGN KEY (status_id) REFERENCES statuts(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ";
        
        $this->pdo->exec($sql);
        echo "  ✅ Tables MySQL créées\n";
    }
    
    private function importAndConvertData($file) {
        echo "📥 Import et conversion des données...\n";
        
        // Créer une table temporaire pour l'import
        $this->createTempTable();
        
        // Importer le fichier client.sql dans la table temporaire
        $this->importToTempTable($file);
        
        // Convertir vers la structure moderne
        return $this->convertToModernStructure();
    }
    
    private function createTempTable() {
        if (isset($this->config['type']) && $this->config['type'] === 'sqlite') {
            $sql = "
            CREATE TEMPORARY TABLE temp_client_import (
                Nom TEXT,
                Adresse TEXT,
                CP INTEGER,
                Ville TEXT,
                Tel1 TEXT,
                Tel2 TEXT,
                Mail TEXT,
                No INTEGER PRIMARY KEY
            )";
        } else {
            $sql = "
            CREATE TEMPORARY TABLE temp_client_import (
                Nom VARCHAR(32),
                Adresse VARCHAR(35),
                CP INT(5),
                Ville VARCHAR(32),
                Tel1 VARCHAR(9),
                Tel2 VARCHAR(9),
                Mail VARCHAR(47),
                No INT(11) PRIMARY KEY
            ) ENGINE=MEMORY DEFAULT CHARSET=utf8mb4";
        }
        
        $this->pdo->exec($sql);
        echo "  ✅ Table temporaire créée\n";
    }
    
    private function importToTempTable($file) {
        $content = file_get_contents($file);
        
        // Nettoyer et adapter le SQL
        $content = str_replace('`client`', 'temp_client_import', $content);
        $content = preg_replace('/ENGINE=MyISAM[^;]*/i', '', $content);
        
        // Séparer les statements
        $statements = $this->splitSQLStatements($content);
        
        foreach ($statements as $statement) {
            $statement = trim($statement);
            if (empty($statement) || strpos($statement, '--') === 0) {
                continue;
            }
            
            // Ignorer les CREATE TABLE (on a déjà créé la table temporaire)
            if (stripos($statement, 'CREATE TABLE') === 0) {
                continue;
            }
            
            try {
                $this->pdo->exec($statement);
            } catch (PDOException $e) {
                echo "  ⚠️  Warning: " . $e->getMessage() . "\n";
            }
        }
        
        echo "  ✅ Données importées dans la table temporaire\n";
    }
    
    private function splitSQLStatements($sql) {
        // Séparer les statements SQL de manière plus intelligente
        $statements = [];
        $current = '';
        $inString = false;
        $stringChar = '';
        
        for ($i = 0; $i < strlen($sql); $i++) {
            $char = $sql[$i];
            
            if (!$inString && ($char === '"' || $char === "'")) {
                $inString = true;
                $stringChar = $char;
            } elseif ($inString && $char === $stringChar) {
                $inString = false;
            } elseif (!$inString && $char === ';') {
                $statements[] = $current;
                $current = '';
                continue;
            }
            
            $current .= $char;
        }
        
        if (!empty(trim($current))) {
            $statements[] = $current;
        }
        
        return $statements;
    }
    
    private function convertToModernStructure() {
        echo "🔄 Conversion vers la structure moderne...\n";
        
        // Insérer les statuts par défaut
        $this->insertDefaultStatuses();
        
        // Convertir les clients
        $sql = "
        INSERT OR IGNORE INTO clients (nom, prenom, email, telephone, adresse, code_postal, ville, created_at, updated_at)
        SELECT 
            TRIM(CASE 
                WHEN INSTR(Nom, ' ') > 0 THEN SUBSTR(Nom, 1, INSTR(Nom, ' ') - 1)
                ELSE Nom 
            END) as nom,
            TRIM(CASE 
                WHEN INSTR(Nom, ' ') > 0 THEN SUBSTR(Nom, INSTR(Nom, ' ') + 1)
                ELSE ''
            END) as prenom,
            Mail as email,
            CASE 
                WHEN LENGTH(Tel1) >= 9 THEN 
                    SUBSTR(Tel1, 1, 2) || '.' ||
                    SUBSTR(Tel1, 3, 2) || '.' ||
                    SUBSTR(Tel1, 5, 2) || '.' ||
                    SUBSTR(Tel1, 7, 2) || '.' ||
                    SUBSTR(Tel1, 9, 2)
                ELSE Tel1 
            END as telephone,
            Adresse as adresse,
            CAST(CP as TEXT) as code_postal,
            Ville as ville,
            CURRENT_TIMESTAMP as created_at,
            CURRENT_TIMESTAMP as updated_at
        FROM temp_client_import 
        WHERE Nom IS NOT NULL AND Nom != ''
        ";
        
        // Adapter pour MySQL si nécessaire
        if (!isset($this->config['type']) || $this->config['type'] !== 'sqlite') {
            $sql = str_replace('OR IGNORE', '', $sql);
            $sql = str_replace('INSTR(', 'LOCATE(\' \', ', $sql);
            $sql = str_replace('SUBSTR(', 'SUBSTRING(', $sql);
            $sql = str_replace('||', ',', $sql);
            $sql = str_replace('CAST(CP as TEXT)', 'CP', $sql);
            $sql = str_replace('CURRENT_TIMESTAMP', 'NOW()', $sql);
            
            $sql = "
            INSERT IGNORE INTO clients (nom, prenom, email, telephone, adresse, code_postal, ville, created_at, updated_at)
            SELECT 
                TRIM(CASE 
                    WHEN LOCATE(' ', Nom) > 0 THEN SUBSTRING(Nom, 1, LOCATE(' ', Nom) - 1)
                    ELSE Nom 
                END) as nom,
                TRIM(CASE 
                    WHEN LOCATE(' ', Nom) > 0 THEN SUBSTRING(Nom, LOCATE(' ', Nom) + 1)
                    ELSE ''
                END) as prenom,
                Mail as email,
                CASE 
                    WHEN LENGTH(Tel1) >= 9 THEN 
                        CONCAT(
                            SUBSTRING(Tel1, 1, 2), '.',
                            SUBSTRING(Tel1, 3, 2), '.',
                            SUBSTRING(Tel1, 5, 2), '.',
                            SUBSTRING(Tel1, 7, 2), '.',
                            SUBSTRING(Tel1, 9, 2)
                        )
                    ELSE Tel1 
                END as telephone,
                Adresse as adresse,
                CP as code_postal,
                Ville as ville,
                NOW() as created_at,
                NOW() as updated_at
            FROM temp_client_import 
            WHERE Nom IS NOT NULL AND Nom != ''
            ";
        }
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        $importedCount = $stmt->rowCount();
        
        echo "  ✅ $importedCount clients convertis\n";
        
        return $importedCount;
    }
    
    private function insertDefaultStatuses() {
        $statuses = [
            ['nom' => 'En attente', 'couleur_hex' => '#f39c12', 'ordre' => 1],
            ['nom' => 'En cours', 'couleur_hex' => '#3498db', 'ordre' => 2],
            ['nom' => 'Terminé', 'couleur_hex' => '#27ae60', 'ordre' => 3],
            ['nom' => 'Livré', 'couleur_hex' => '#2ecc71', 'ordre' => 4],
            ['nom' => 'Annulé', 'couleur_hex' => '#e74c3c', 'ordre' => 5]
        ];
        
        $insertSQL = isset($this->config['type']) && $this->config['type'] === 'sqlite' 
            ? "INSERT OR IGNORE INTO statuts (nom, couleur_hex, ordre) VALUES (?, ?, ?)"
            : "INSERT IGNORE INTO statuts (nom, couleur_hex, ordre) VALUES (?, ?, ?)";
        
        $stmt = $this->pdo->prepare($insertSQL);
        
        foreach ($statuses as $status) {
            try {
                $stmt->execute([$status['nom'], $status['couleur_hex'], $status['ordre']]);
            } catch (PDOException $e) {
                // Ignorer les doublons
            }
        }
        
        echo "  ✅ Statuts par défaut créés\n";
    }
    
    private function verifyImport() {
        echo "🔍 Vérification de l'import...\n";
        
        // Compter les clients
        $stmt = $this->pdo->query("SELECT COUNT(*) FROM clients");
        $clientCount = $stmt->fetchColumn();
        echo "  📊 Total clients: $clientCount\n";
        
        // Compter les statuts
        $stmt = $this->pdo->query("SELECT COUNT(*) FROM statuts");
        $statusCount = $stmt->fetchColumn();
        echo "  📊 Total statuts: $statusCount\n";
        
        // Vérifier les doublons
        $sql = "SELECT nom, prenom, COUNT(*) as nb FROM clients GROUP BY nom, prenom HAVING COUNT(*) > 1";
        $stmt = $this->pdo->query($sql);
        $duplicates = $stmt->fetchAll();
        
        if (count($duplicates) > 0) {
            echo "  ⚠️  Doublons détectés:\n";
            foreach ($duplicates as $dup) {
                echo "    - {$dup['prenom']} {$dup['nom']} ({$dup['nb']} fois)\n";
            }
        } else {
            echo "  ✅ Aucun doublon détecté\n";
        }
        
        // Afficher quelques exemples
        echo "  📋 Échantillon de clients importés:\n";
        $stmt = $this->pdo->query("SELECT nom, prenom, ville FROM clients LIMIT 5");
        $samples = $stmt->fetchAll();
        
        foreach ($samples as $sample) {
            echo "    - {$sample['prenom']} {$sample['nom']} ({$sample['ville']})\n";
        }
    }
    
    public function exportForXAMPP() {
        echo "\n📤 Export pour XAMPP...\n";
        
        $exportFile = 'export_for_xampp.sql';
        
        if (isset($this->config['type']) && $this->config['type'] === 'sqlite') {
            // Export depuis SQLite
            $this->exportSQLiteToMySQL($exportFile);
        } else {
            // Export depuis MySQL
            $this->exportMySQL($exportFile);
        }
        
        echo "✅ Export créé: $exportFile\n";
        echo "📋 Ce fichier peut être importé directement dans XAMPP\n";
    }
    
    private function exportSQLiteToMySQL($file) {
        $output = "-- Export SQLite vers MySQL pour XAMPP\n";
        $output .= "-- Généré le " . date('Y-m-d H:i:s') . "\n\n";
        
        $output .= "SET SQL_MODE = \"NO_AUTO_VALUE_ON_ZERO\";\n";
        $output .= "SET time_zone = \"+00:00\";\n\n";
        
        // Export des clients
        $stmt = $this->pdo->query("SELECT * FROM clients");
        $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $output .= "-- Structure table clients\n";
        $output .= "CREATE TABLE clients (\n";
        $output .= "  id int(11) NOT NULL AUTO_INCREMENT,\n";
        $output .= "  nom varchar(100) NOT NULL,\n";
        $output .= "  prenom varchar(100) DEFAULT NULL,\n";
        $output .= "  email varchar(150) DEFAULT NULL,\n";
        $output .= "  telephone varchar(20) DEFAULT NULL,\n";
        $output .= "  adresse varchar(255) DEFAULT NULL,\n";
        $output .= "  code_postal varchar(10) DEFAULT NULL,\n";
        $output .= "  ville varchar(100) DEFAULT NULL,\n";
        $output .= "  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,\n";
        $output .= "  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n";
        $output .= "  PRIMARY KEY (id)\n";
        $output .= ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n";
        
        $output .= "-- Données clients\n";
        foreach ($clients as $client) {
            $values = array_map(function($v) { return $v === null ? 'NULL' : "'" . addslashes($v) . "'"; }, $client);
            $output .= "INSERT INTO clients VALUES (" . implode(', ', $values) . ");\n";
        }
        
        file_put_contents($file, $output);
    }
    
    private function exportMySQL($file) {
        $cmd = "mysqldump -h{$this->config['host']} -u{$this->config['user']}";
        if (!empty($this->config['pass'])) {
            $cmd .= " -p{$this->config['pass']}";
        }
        $cmd .= " {$this->config['name']} > $file";
        
        exec($cmd, $output, $return_var);
        
        if ($return_var !== 0) {
            echo "⚠️  Erreur mysqldump, export manuel...\n";
            $this->manualMySQLExport($file);
        }
    }
    
    private function manualMySQLExport($file) {
        // Export manuel si mysqldump n'est pas disponible
        $output = "-- Export MySQL manuel\n";
        $output .= "-- Généré le " . date('Y-m-d H:i:s') . "\n\n";
        
        // Exporter la structure et les données de chaque table
        $tables = ['clients', 'statuts', 'depots'];
        
        foreach ($tables as $table) {
            $stmt = $this->pdo->query("SELECT * FROM $table");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (count($rows) > 0) {
                $output .= "-- Données pour la table $table\n";
                foreach ($rows as $row) {
                    $values = array_map(function($v) { 
                        return $v === null ? 'NULL' : "'" . addslashes($v) . "'"; 
                    }, $row);
                    $output .= "INSERT INTO $table VALUES (" . implode(', ', $values) . ");\n";
                }
                $output .= "\n";
            }
        }
        
        file_put_contents($file, $output);
    }
}

// ===========================
// UTILISATION DU SCRIPT
// ===========================

echo "🔄 Synchroniseur client.sql pour Linux\n";
echo "======================================\n";

// Vérifier les arguments
$clientFile = $argv[1] ?? 'client.sql';

if (!file_exists($clientFile)) {
    echo "❌ Fichier $clientFile non trouvé\n";
    echo "\nUtilisation:\n";
    echo "  php sync_client_linux.php [fichier_client.sql]\n";
    echo "\nExemple:\n";
    echo "  php sync_client_linux.php client.sql\n";
    exit(1);
}

try {
    // Créer le synchronizer
    $sync = new ClientSynchronizer();
    
    // Synchroniser les données
    $importedCount = $sync->syncClientSQL($clientFile);
    
    // Proposer l'export XAMPP
    echo "\n🤔 Voulez-vous créer un export pour XAMPP ? (o/n): ";
    $handle = fopen("php://stdin", "r");
    $choice = trim(fgets($handle));
    fclose($handle);
    
    if (strtolower($choice) === 'o' || strtolower($choice) === 'oui') {
        $sync->exportForXAMPP();
    }
    
    echo "\n🎉 Synchronisation terminée avec succès !\n";
    echo "📊 $importedCount clients synchronisés\n";
    echo "\n💡 Conseils:\n";
    echo "  - Testez votre application sur http://localhost:8000 ou http://localhost:8080\n";
    echo "  - Utilisez le fichier export_for_xampp.sql pour migrer vers XAMPP\n";
    echo "  - Consultez les logs pour plus de détails\n";
    
} catch (Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
    exit(1);
}
?>