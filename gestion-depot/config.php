<?php
/**
 * Configuration de base de données - Gestion des Dépôts
 * Version MySQL pour XAMPP
 */

// ====== CONFIGURATION DE LA BASE DE DONNÉES ======
define('DB_HOST', 'localhost');
define('DB_NAME', 'gestion_depot'); // Nom de votre base de données
define('DB_USER', 'root');          // Utilisateur MySQL par défaut XAMPP
define('DB_PASS', '');              // Mot de passe vide par défaut XAMPP
define('DB_CHARSET', 'utf8mb4');

// ====== CONFIGURATION DE L'APPLICATION ======
define('APP_VERSION', '2.0.0');
define('APP_DEBUG', true); // Mettre à false en production

// ====== CONFIGURATION DES ERREURS ======
if (APP_DEBUG) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// ====== CLASSE DE BASE DE DONNÉES ======
class Database {
    private static $instance = null;
    private $pdo;
    
    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $this->pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET
            ]);
        } catch (PDOException $e) {
            die("Erreur de connexion à la base de données: " . $e->getMessage());
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function query($sql, $params = []) {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            Logger::error("Erreur SQL: " . $e->getMessage(), ['sql' => $sql, 'params' => $params]);
            throw new Exception("Erreur de base de données: " . $e->getMessage());
        }
    }
    
    public function fetchAll($sql, $params = []) {
        return $this->query($sql, $params)->fetchAll();
    }
    
    public function fetchOne($sql, $params = []) {
        return $this->query($sql, $params)->fetch();
    }
    
    public function fetchColumn($sql, $params = []) {
        return $this->query($sql, $params)->fetchColumn();
    }
    
    public function lastInsertId() {
        return $this->pdo->lastInsertId();
    }
    
    public function beginTransaction() {
        return $this->pdo->beginTransaction();
    }
    
    public function commit() {
        return $this->pdo->commit();
    }
    
    public function rollback() {
        return $this->pdo->rollback();
    }
}

// ====== CLASSE DE VALIDATION ======
class Validator {
    public static function required($value, $fieldName) {
        if (empty($value) || trim($value) === '') {
            throw new Exception("Le champ '$fieldName' est requis");
        }
        return trim($value);
    }
    
    public static function integer($value, $fieldName) {
        if (!is_numeric($value) || (int)$value != $value) {
            throw new Exception("Le champ '$fieldName' doit être un entier");
        }
        return (int)$value;
    }
    
    public static function email($value) {
        if (!empty($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
            throw new Exception("Format d'email invalide");
        }
        return $value;
    }
    
    public static function phone($value) {
        if (!empty($value)) {
            // Supprimer les espaces, points, tirets
            $cleaned = preg_replace('/[^0-9+]/', '', $value);
            if (strlen($cleaned) < 10) {
                throw new Exception("Numéro de téléphone invalide");
            }
        }
        return $value;
    }
    
    public static function date($value) {
        if (!empty($value)) {
            $date = DateTime::createFromFormat('Y-m-d', $value);
            if (!$date || $date->format('Y-m-d') !== $value) {
                throw new Exception("Format de date invalide (YYYY-MM-DD attendu)");
            }
        }
        return $value;
    }
}

// ====== CLASSE DE RÉPONSE API ======
class ApiResponse {
    public static function success($data = null, $message = null) {
        return [
            'success' => true,
            'data' => $data,
            'message' => $message
        ];
    }
    
    public static function error($message, $code = null) {
        return [
            'success' => false,
            'error' => $message,
            'code' => $code
        ];
    }
    
    public static function json($response, $httpCode = 200) {
        http_response_code($httpCode);
        header('Content-Type: application/json');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// ====== CLASSE DE LOG ======
class Logger {
    private static $logFile = 'logs/app.log';
    
    public static function info($message, $context = []) {
        self::log('INFO', $message, $context);
    }
    
    public static function error($message, $context = []) {
        self::log('ERROR', $message, $context);
    }
    
    public static function warning($message, $context = []) {
        self::log('WARNING', $message, $context);
    }
    
    private static function log($level, $message, $context = []) {
        if (!APP_DEBUG && $level === 'INFO') {
            return; // Ne pas logger les infos en production
        }
        
        $timestamp = date('Y-m-d H:i:s');
        $contextStr = !empty($context) ? ' - ' . json_encode($context) : '';
        $logEntry = "[$timestamp] [$level] $message$contextStr" . PHP_EOL;
        
        // Créer le dossier logs si nécessaire
        $logDir = dirname(self::$logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        file_put_contents(self::$logFile, $logEntry, FILE_APPEND | LOCK_EX);
    }
}

// ====== FONCTIONS UTILITAIRES ======

/**
 * Vérifier si les tables existent dans la base de données
 */
function checkDatabaseTables() {
    $db = Database::getInstance();
    $requiredTables = ['clients', 'statuts', 'depots', 'archives', 'settings'];
    $existingTables = [];
    
    try {
        $tables = $db->fetchAll("SHOW TABLES");
        foreach ($tables as $table) {
            $existingTables[] = array_values($table)[0];
        }
        
        $missingTables = array_diff($requiredTables, $existingTables);
        
        if (!empty($missingTables)) {
            throw new Exception("Tables manquantes: " . implode(', ', $missingTables));
        }
        
        return true;
    } catch (Exception $e) {
        Logger::error("Erreur de vérification des tables: " . $e->getMessage());
        throw $e;
    }
}

/**
 * Initialiser les données par défaut si nécessaire
 */
function initializeDefaultData() {
    $db = Database::getInstance();
    
    try {
        // Vérifier s'il y a déjà des données
        $clientCount = $db->fetchColumn("SELECT COUNT(*) FROM clients");
        if ($clientCount > 0) {
            return; // Données déjà présentes
        }
        
        Logger::info("Initialisation des données par défaut");
        
        $db->beginTransaction();
        
        // Insérer les statuts par défaut
        $defaultStatuts = [
            ['En attente', '#e74c3c', 'Traitement initial', 'Dépôt reçu, en attente de traitement', 1],
            ['En cours', '#f39c12', 'Traitement en cours', 'Réparation ou service en cours', 2],
            ['Prêt', '#3498db', 'Contacter le client', 'Travail terminé, prêt à récupérer', 3],
            ['Terminé', '#27ae60', 'Dépôt récupéré', 'Dépôt récupéré par le client', 4]
        ];
        
        foreach ($defaultStatuts as $statut) {
            $db->query(
                "INSERT INTO statuts (nom, couleur_hex, action, description, ordre) VALUES (?, ?, ?, ?, ?)",
                $statut
            );
        }
        
        // Insérer les clients par défaut
        $defaultClients = [
            ['Martin', 'Dupont', 'martin.dupont@email.com', '06 12 34 56 78', '123 Rue de la Paix, Paris', 'Client régulier'],
            ['Sophie', 'Bernard', 'sophie.bernard@email.com', '06 87 65 43 21', '456 Avenue des Champs, Lyon', ''],
            ['Pierre', 'Martin', 'pierre.martin@email.com', '06 11 22 33 44', '789 Boulevard Saint-Michel, Marseille', 'Professionnel'],
            ['Julie', 'Moreau', 'julie.moreau@email.com', '06 55 44 33 22', '321 Rue du Commerce, Bordeaux', ''],
            ['Thomas', 'Lefebvre', 'thomas.lefebvre@email.com', '06 99 88 77 66', '654 Impasse des Lilas, Lille', 'Client VIP']
        ];
        
        foreach ($defaultClients as $client) {
            $db->query(
                "INSERT INTO clients (prenom, nom, email, telephone, adresse, notes) VALUES (?, ?, ?, ?, ?, ?)",
                $client
            );
        }
        
        // Insérer les paramètres par défaut
        $defaultSettings = [
            ['max_depots_display', '25'],
            ['auto_archive_days', '30'],
            ['auto_backup', 'true'],
            ['theme', 'light'],
            ['language', 'fr'],
            ['date_format', 'DD/MM/YYYY'],
            ['currency', 'EUR']
        ];
        
        foreach ($defaultSettings as $setting) {
            $db->query(
                "INSERT INTO settings (cle, valeur) VALUES (?, ?)",
                $setting
            );
        }
        
        $db->commit();
        Logger::info("Données par défaut initialisées avec succès");
        
    } catch (Exception $e) {
        $db->rollback();
        Logger::error("Erreur lors de l'initialisation des données par défaut: " . $e->getMessage());
        throw $e;
    }
}

// ====== INITIALISATION AUTOMATIQUE ======
try {
    checkDatabaseTables();
    initializeDefaultData();
} catch (Exception $e) {
    if (APP_DEBUG) {
        die("Erreur d'initialisation: " . $e->getMessage());
    } else {
        Logger::error("Erreur d'initialisation: " . $e->getMessage());
        die("Erreur de configuration. Consultez les logs.");
    }
}

Logger::info("Configuration chargée avec succès");
?>