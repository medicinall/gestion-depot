<?php
/**
 * Script d'installation et de mise à jour de la base de données
 * Gestion des Dépôts - Version PDF
 */

// Configuration de la base de données
$host = 'localhost';
$dbname = 'gestion_depots';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ Connexion à la base de données réussie\n";
} catch (PDOException $e) {
    die("❌ Erreur de connexion à la base de données : " . $e->getMessage() . "\n");
}

// Fonction pour vérifier si une colonne existe
function columnExists($pdo, $table, $column) {
    try {
        $stmt = $pdo->prepare("SHOW COLUMNS FROM `$table` LIKE :column");
        $stmt->execute([':column' => $column]);
        return $stmt->rowCount() > 0;
    } catch (PDOException $e) {
        return false;
    }
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

echo "🔧 Début de la mise à jour de la base de données...\n\n";

// 1. Mise à jour de la table depots
echo "📦 Mise à jour de la table 'depots'...\n";

$depotsUpdates = [
    'designation_references' => "ADD COLUMN designation_references TEXT DEFAULT NULL AFTER description",
    'observation_travaux' => "ADD COLUMN observation_travaux TEXT DEFAULT NULL AFTER designation_references",
    'donnees_sauvegarder' => "ADD COLUMN donnees_sauvegarder ENUM('Oui', 'Non') DEFAULT 'Non' AFTER observation_travaux",
    'outlook_sauvegarder' => "ADD COLUMN outlook_sauvegarder ENUM('Oui', 'Non') DEFAULT 'Non' AFTER donnees_sauvegarder",
    'mot_de_passe' => "ADD COLUMN mot_de_passe VARCHAR(255) DEFAULT NULL AFTER outlook_sauvegarder",
    'informations_complementaires' => "ADD COLUMN informations_complementaires TEXT DEFAULT NULL AFTER mot_de_passe"
];

foreach ($depotsUpdates as $column => $sql) {
    if (!columnExists($pdo, 'depots', $column)) {
        try {
            $pdo->exec("ALTER TABLE depots $sql");
            echo "  ✅ Colonne '$column' ajoutée\n";
        } catch (PDOException $e) {
            echo "  ❌ Erreur lors de l'ajout de la colonne '$column': " . $e->getMessage() . "\n";
        }
    } else {
        echo "  ⚠️ Colonne '$column' déjà présente\n";
    }
}

// 2. Mise à jour de la table clients
echo "\n👥 Mise à jour de la table 'clients'...\n";

$clientsUpdates = [
    'adresse' => "ADD COLUMN adresse VARCHAR(255) DEFAULT NULL AFTER email",
    'code_postal' => "ADD COLUMN code_postal VARCHAR(10) DEFAULT NULL AFTER adresse",
    'ville' => "ADD COLUMN ville VARCHAR(100) DEFAULT NULL AFTER code_postal"
];

foreach ($clientsUpdates as $column => $sql) {
    if (!columnExists($pdo, 'clients', $column)) {
        try {
            $pdo->exec("ALTER TABLE clients $sql");
            echo "  ✅ Colonne '$column' ajoutée\n";
        } catch (PDOException $e) {
            echo "  ❌ Erreur lors de l'ajout de la colonne '$column': " . $e->getMessage() . "\n";
        }
    } else {
        echo "  ⚠️ Colonne '$column' déjà présente\n";
    }
}

// 3. Création de la table company_settings
echo "\n🏢 Création de la table 'company_settings'...\n";

if (!tableExists($pdo, 'company_settings')) {
    try {
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $pdo->exec($sql);
        echo "  ✅ Table 'company_settings' créée\n";
        
        // Insérer les paramètres par défaut
        $insertSql = "
        INSERT INTO company_settings (nom, adresse, code_postal, ville, telephone1, telephone2, email, siret, rcs)
        VALUES ('WEB INFORMATIQUE', '154 bis rue du général de Gaulle', '76770', 'LE HOULME', 
                '06.99.50.76.76', '02.35.74.19.29', 'contact@webinformatique.eu', 
                '493 933 139 00010', 'RCS ROUEN')";
        
        $pdo->exec($insertSql);
        echo "  ✅ Paramètres par défaut insérés\n";
        
    } catch (PDOException $e) {
        echo "  ❌ Erreur lors de la création de la table 'company_settings': " . $e->getMessage() . "\n";
    }
} else {
    echo "  ⚠️ Table 'company_settings' déjà présente\n";
}

// 4. Vérification et ajout d'index pour améliorer les performances
echo "\n📊 Optimisation des index...\n";

$indexes = [
    "CREATE INDEX idx_depots_client_id ON depots(client_id)" => "depots(client_id)",
    "CREATE INDEX idx_depots_status_id ON depots(status_id)" => "depots(status_id)",
    "CREATE INDEX idx_depots_date_depot ON depots(date_depot)" => "depots(date_depot)",
    "CREATE INDEX idx_depots_archived ON depots(archived)" => "depots(archived)"
];

foreach ($indexes as $sql => $description) {
    try {
        $pdo->exec($sql);
        echo "  ✅ Index ajouté pour $description\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate key name') !== false) {
            echo "  ⚠️ Index pour $description déjà présent\n";
        } else {
            echo "  ❌ Erreur lors de l'ajout de l'index pour $description: " . $e->getMessage() . "\n";
        }
    }
}

// 5. Mise à jour des données existantes (si nécessaire)
echo "\n🔄 Mise à jour des données existantes...\n";

try {
    // Mettre à jour les dépôts sans designation_references
    $stmt = $pdo->prepare("UPDATE depots SET designation_references = description WHERE designation_references IS NULL OR designation_references = ''");
    $stmt->execute();
    $updatedRows = $stmt->rowCount();
    if ($updatedRows > 0) {
        echo "  ✅ $updatedRows dépôts mis à jour avec designation_references\n";
    }
    
    // Mettre à jour les dépôts sans observation_travaux
    $stmt = $pdo->prepare("UPDATE depots SET observation_travaux = notes WHERE observation_travaux IS NULL OR observation_travaux = ''");
    $stmt->execute();
    $updatedRows = $stmt->rowCount();
    if ($updatedRows > 0) {
        echo "  ✅ $updatedRows dépôts mis à jour avec observation_travaux\n";
    }
    
} catch (PDOException $e) {
    echo "  ❌ Erreur lors de la mise à jour des données: " . $e->getMessage() . "\n";
}

// 6. Vérification finale
echo "\n🧪 Vérification finale...\n";

try {
    // Compter les enregistrements
    $counts = [];
    $tables = ['clients', 'depots', 'statuts', 'company_settings'];
    
    foreach ($tables as $table) {
        $stmt = $pdo->query("SELECT COUNT(*) FROM $table");
        $counts[$table] = $stmt->fetchColumn();
    }
    
    echo "  📊 Statistiques de la base de données :\n";
    foreach ($counts as $table => $count) {
        echo "     - $table: $count enregistrement(s)\n";
    }
    
} catch (PDOException $e) {
    echo "  ❌ Erreur lors de la vérification: " . $e->getMessage() . "\n";
}

echo "\n✅ Mise à jour de la base de données terminée avec succès !\n";
echo "\n📋 Prochaines étapes :\n";
echo "   1. Assurez-vous que fpdf.php est présent dans votre dossier\n";
echo "   2. Copiez DepotPDFGenerator.php dans votre dossier\n";
echo "   3. Copiez generate_pdf.php dans votre dossier\n";
echo "   4. Testez la génération de PDF avec un dépôt existant\n";

echo "\n🎉 Votre système de gestion de dépôts est maintenant prêt pour la génération de PDF !\n";
?>