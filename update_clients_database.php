<?php
/**
 * Script de mise à jour de la base de données pour les clients
 * Ajoute les colonnes d'adresse si elles n'existent pas
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

echo "🔧 Mise à jour de la table 'clients' pour la gestion complète...\n\n";

// Colonnes à ajouter pour les clients
$clientsUpdates = [
    'adresse' => "ADD COLUMN adresse VARCHAR(255) DEFAULT NULL AFTER email",
    'code_postal' => "ADD COLUMN code_postal VARCHAR(10) DEFAULT NULL AFTER adresse",
    'ville' => "ADD COLUMN ville VARCHAR(100) DEFAULT NULL AFTER code_postal"
];

foreach ($clientsUpdates as $column => $sql) {
    if (!columnExists($pdo, 'clients', $column)) {
        try {
            $pdo->exec("ALTER TABLE clients $sql");
            echo "  ✅ Colonne '$column' ajoutée avec succès\n";
        } catch (PDOException $e) {
            echo "  ❌ Erreur lors de l'ajout de la colonne '$column': " . $e->getMessage() . "\n";
        }
    } else {
        echo "  ⚠️ Colonne '$column' déjà présente\n";
    }
}

// Vérifier la structure de la table clients
echo "\n📊 Structure actuelle de la table 'clients':\n";
try {
    $stmt = $pdo->query("SHOW COLUMNS FROM clients");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $column) {
        echo "  - {$column['Field']} ({$column['Type']}) {$column['Null']} {$column['Default']}\n";
    }
} catch (PDOException $e) {
    echo "  ❌ Erreur lors de la vérification de la structure: " . $e->getMessage() . "\n";
}

// Ajouter quelques clients de test si la table est vide
echo "\n👥 Vérification des données de test...\n";
try {
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM clients");
    $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    if ($count == 0) {
        echo "  📝 Ajout de clients de test...\n";
        
        $testClients = [
            [
                'prenom' => 'Jean',
                'nom' => 'Dupont',
                'email' => 'jean.dupont@email.com',
                'telephone' => '06.12.34.56.78',
                'adresse' => '123 rue de la Paix',
                'code_postal' => '76000',
                'ville' => 'Rouen'
            ],
            [
                'prenom' => 'Marie',
                'nom' => 'Martin',
                'email' => 'marie.martin@email.com',
                'telephone' => '06.98.76.54.32',
                'adresse' => '45 avenue des Fleurs',
                'code_postal' => '76100',
                'ville' => 'Rouen'
            ],
            [
                'prenom' => 'Pierre',
                'nom' => 'Durand',
                'email' => 'pierre.durand@email.com',
                'telephone' => '06.11.22.33.44',
                'adresse' => '67 boulevard Victor Hugo',
                'code_postal' => '76200',
                'ville' => 'Dieppe'
            ],
            [
                'prenom' => 'Sophie',
                'nom' => 'Leroy',
                'email' => 'sophie.leroy@email.com',
                'telephone' => '06.55.44.33.22',
                'adresse' => '89 place du Marché',
                'code_postal' => '76600',
                'ville' => 'Le Havre'
            ]
        ];
        
        $stmt = $pdo->prepare("
            INSERT INTO clients (prenom, nom, email, telephone, adresse, code_postal, ville, created_at, updated_at)
            VALUES (:prenom, :nom, :email, :telephone, :adresse, :code_postal, :ville, NOW(), NOW())
        ");
        
        foreach ($testClients as $client) {
            $stmt->execute($client);
            echo "    ✅ Client ajouté: {$client['prenom']} {$client['nom']}\n";
        }
        
        echo "  ✅ " . count($testClients) . " clients de test ajoutés\n";
        
    } else {
        echo "  ℹ️ La table contient déjà $count client(s)\n";
    }
} catch (PDOException $e) {
    echo "  ❌ Erreur lors de l'ajout des clients de test: " . $e->getMessage() . "\n";
}

// Statistiques finales
echo "\n📈 Statistiques finales:\n";
try {
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM clients");
    $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    echo "  📊 Total clients: $total\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) as with_address FROM clients WHERE adresse IS NOT NULL AND adresse != ''");
    $withAddress = $stmt->fetch(PDO::FETCH_ASSOC)['with_address'];
    echo "  🏠 Clients avec adresse: $withAddress\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) as with_email FROM clients WHERE email IS NOT NULL AND email != ''");
    $withEmail = $stmt->fetch(PDO::FETCH_ASSOC)['with_email'];
    echo "  📧 Clients avec email: $withEmail\n";
    
} catch (PDOException $e) {
    echo "  ❌ Erreur lors du calcul des statistiques: " . $e->getMessage() . "\n";
}

echo "\n✅ Mise à jour de la gestion des clients terminée avec succès !\n";
echo "\n📋 Prochaines étapes :\n";
echo "   1. Ajoutez le fichier client-functions.js à votre projet\n";
echo "   2. Ajoutez le fichier api_clients.php à votre projet\n";
echo "   3. Mettez à jour votre index.html avec les nouvelles modales\n";
echo "   4. Testez la création, modification et suppression de clients\n";

echo "\n🎉 Votre système de gestion de clients est maintenant opérationnel !\n";
?>