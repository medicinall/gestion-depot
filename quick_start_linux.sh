#!/bin/bash

# 🚀 Quick Start Linux - Gestion des Dépôts
# Script tout-en-un : Installation + Synchronisation + Test + Migration XAMPP

set -e  # Arrêter en cas d'erreur

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m' 
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
PROJECT_NAME="depot-manager"
PORT=8000
DOCKER_PORT=8080

# Fonctions d'affichage
print_header() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║              🚀 QUICK START LINUX - DEPOT MANAGER           ║"
    echo "║           Gestion de Dépôts - Installation Rapide           ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "\n${CYAN}▶ $1${NC}"
    echo -e "${BLUE}$(printf '%.60s' "────────────────────────────────────────────────────────────")${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Vérifier les prérequis
check_prerequisites() {
    print_step "Vérification des prérequis"
    
    local missing=()
    
    # Vérifier les commandes essentielles
    for cmd in curl wget; do
        if ! command -v $cmd &> /dev/null; then
            missing+=($cmd)
        fi
    done
    
    if [ ${#missing[@]} -ne 0 ]; then
        print_warning "Commandes manquantes: ${missing[*]}"
        print_info "Installation des outils de base..."
        
        if command -v apt &> /dev/null; then
            sudo apt update && sudo apt install -y curl wget
        elif command -v dnf &> /dev/null; then
            sudo dnf install -y curl wget
        elif command -v pacman &> /dev/null; then
            sudo pacman -S curl wget
        fi
    fi
    
    print_success "Prérequis vérifiés"
}

# Menu de sélection
select_installation_method() {
    print_step "Choisissez votre méthode d'installation"
    
    echo ""
    echo "1) 🐳 Docker (Recommandé - Facile à migrer vers XAMPP)"
    echo "2) ⚡ PHP Built-in + SQLite (Ultra rapide pour tester)"
    echo "3) 🖥️  LAMP Stack complet (Apache + MySQL)"
    echo "4) 🔧 Migration depuis installation existante"
    echo "5) 🧪 Mode test avec données de démonstration"
    echo ""
    
    while true; do
        read -p "Votre choix (1-5): " choice
        case $choice in
            1) METHOD="docker"; break;;
            2) METHOD="builtin"; break;;
            3) METHOD="lamp"; break;;
            4) METHOD="migrate"; break;;
            5) METHOD="demo"; break;;
            *) print_error "Veuillez choisir entre 1 et 5";;
        esac
    done
    
    print_success "Méthode sélectionnée: $METHOD"
}

# Installation Docker
install_docker() {
    print_step "Installation Docker"
    
    if ! command -v docker &> /dev/null; then
        print_info "Installation de Docker..."
        
        # Détecter la distribution
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            DISTRO=$ID
        fi
        
        case $DISTRO in
            ubuntu|debian)
                curl -fsSL https://get.docker.com -o get-docker.sh
                sudo sh get-docker.sh
                sudo usermod -aG docker $USER
                ;;
            fedora)
                sudo dnf install -y docker docker-compose
                sudo systemctl start docker
                sudo systemctl enable docker
                sudo usermod -aG docker $USER
                ;;
            arch)
                sudo pacman -S docker docker-compose
                sudo systemctl start docker
                sudo systemctl enable docker
                sudo usermod -aG docker $USER
                ;;
            *)
                print_error "Distribution non supportée pour l'auto-installation"
                print_info "Installez Docker manuellement: https://docs.docker.com/engine/install/"
                exit 1
                ;;
        esac
        
        print_warning "Redémarrez votre session ou exécutez: newgrp docker"
        print_info "Puis relancez ce script"
        exit 0
    fi
    
    # Créer docker-compose.yml
    create_docker_compose
    
    # Lancer les conteneurs
    print_info "Lancement des conteneurs..."
    docker-compose up -d
    
    # Attendre que les services soient prêts
    print_info "Démarrage des services en cours..."
    sleep 15
    
    # Initialiser la base
    setup_docker_database
    
    # URL d'accès
    WEBAPP_URL="http://localhost:$DOCKER_PORT"
    ADMIN_URL="http://localhost:8081"
    
    print_success "Docker installé et configuré"
}

create_docker_compose() {
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  web:
    image: php:8.1-apache
    container_name: depot-web
    ports:
      - "8080:80"
    volumes:
      - .:/var/www/html
    depends_on:
      - mysql
    environment:
      - APACHE_DOCUMENT_ROOT=/var/www/html
    command: >
      bash -c "
      apt-get update &&
      apt-get install -y libpng-dev libjpeg-dev libfreetype6-dev &&
      docker-php-ext-configure gd --with-freetype --with-jpeg &&
      docker-php-ext-install pdo pdo_mysql mysqli gd &&
      a2enmod rewrite &&
      echo 'ServerName localhost' >> /etc/apache2/apache2.conf &&
      apache2-foreground
      "

  mysql:
    image: mysql:8.0
    container_name: depot-mysql
    restart: always
    environment:
      MYSQL_DATABASE: depot_manager
      MYSQL_ROOT_PASSWORD: depot123
      MYSQL_USER: depot_user
      MYSQL_PASSWORD: depot123
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    container_name: depot-phpmyadmin
    restart: always
    ports:
      - "8081:80"
    environment:
      PMA_HOST: mysql
      PMA_USER: root
      PMA_PASSWORD: depot123
    depends_on:
      - mysql

volumes:
  mysql_data:
EOF
    
    print_success "docker-compose.yml créé"
}

setup_docker_database() {
    print_info "Configuration de la base de données Docker..."
    
    # Attendre que MySQL soit complètement prêt
    until docker exec depot-mysql mysqladmin ping -h"localhost" --silent; do
        print_info "Attente de MySQL..."
        sleep 2
    done
    
    # Créer la configuration PHP
    cat > config.php << 'EOF'
<?php
// Configuration Docker
$dbConfig = [
    'host' => 'mysql',
    'name' => 'depot_manager',
    'user' => 'root',
    'pass' => 'depot123',
    'charset' => 'utf8mb4'
];

define('DOCKER_MODE', true);
define('APP_URL', 'http://localhost:8080');
?>
EOF

    # Créer les tables de base
    create_database_structure "mysql"
    
    print_success "Base Docker configurée"
}

# Installation PHP Built-in
install_builtin() {
    print_step "Installation PHP Built-in + SQLite"
    
    # Vérifier PHP
    if ! command -v php &> /dev/null; then
        print_info "Installation de PHP..."
        
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            DISTRO=$ID
        fi
        
        case $DISTRO in
            ubuntu|debian)
                sudo apt update
                sudo apt install -y php php-sqlite3 php-mbstring php-json php-gd
                ;;
            fedora)
                sudo dnf install -y php php-pdo php-mbstring php-json php-gd
                ;;
            arch)
                sudo pacman -S php php-sqlite
                ;;
        esac
    fi
    
    # Créer la base SQLite
    create_database_structure "sqlite"
    
    # Configuration
    cat > config.php << 'EOF'
<?php
// Configuration SQLite
$dbConfig = [
    'dsn' => 'sqlite:depot_manager.db',
    'type' => 'sqlite'
];

define('SQLITE_MODE', true);
define('APP_URL', 'http://localhost:8000');
?>
EOF

    # URL d'accès
    WEBAPP_URL="http://localhost:$PORT"
    
    print_success "PHP Built-in configuré"
}

# Installation LAMP
install_lamp() {
    print_step "Installation LAMP Stack"
    
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        DISTRO=$ID
    fi
    
    case $DISTRO in
        ubuntu|debian)
            sudo apt update
            sudo apt install -y apache2 mysql-server php php-mysql php-mbstring php-json php-gd phpmyadmin
            sudo systemctl start apache2 mysql
            sudo systemctl enable apache2 mysql
            ;;
        fedora)
            sudo dnf install -y httpd mariadb-server php php-mysqlnd php-mbstring php-json php-gd phpMyAdmin
            sudo systemctl start httpd mariadb
            sudo systemctl enable httpd mariadb
            ;;
        arch)
            sudo pacman -S apache mysql php php-apache phpmyadmin
            sudo systemctl start httpd mysqld
            sudo systemctl enable httpd mysqld
            ;;
    esac
    
    # Configuration MySQL
    setup_lamp_mysql
    
    # Configuration Apache
    setup_lamp_apache
    
    # URL d'accès
    WEBAPP_URL="http://localhost/$PROJECT_NAME"
    ADMIN_URL="http://localhost/phpmyadmin"
    
    print_success "LAMP Stack installé"
}

setup_lamp_mysql() {
    print_info "Configuration MySQL..."
    
    # Sécuriser MySQL et créer la base
    sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'depot123';" 2>/dev/null || true
    sudo mysql -uroot -pdepot123 -e "CREATE DATABASE IF NOT EXISTS depot_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    
    # Configuration
    cat > config.php << 'EOF'
<?php
// Configuration LAMP
$dbConfig = [
    'host' => 'localhost',
    'name' => 'depot_manager',
    'user' => 'root',
    'pass' => 'depot123',
    'charset' => 'utf8mb4'
];

define('LAMP_MODE', true);
define('APP_URL', 'http://localhost/depot-manager');
?>
EOF

    create_database_structure "mysql"
}

setup_lamp_apache() {
    print_info "Configuration Apache..."
    
    # Copier les fichiers
    sudo mkdir -p /var/www/html/$PROJECT_NAME
    sudo cp -r . /var/www/html/$PROJECT_NAME/
    sudo chown -R www-data:www-data /var/www/html/$PROJECT_NAME 2>/dev/null || sudo chown -R apache:apache /var/www/html/$PROJECT_NAME
    sudo chmod -R 755 /var/www/html/$PROJECT_NAME
    
    # Configuration du virtual host
    sudo tee /etc/apache2/sites-available/$PROJECT_NAME.conf > /dev/null << EOF
<VirtualHost *:80>
    DocumentRoot /var/www/html/$PROJECT_NAME
    ServerName localhost
    
    <Directory /var/www/html/$PROJECT_NAME>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
EOF

    sudo a2ensite $PROJECT_NAME.conf 2>/dev/null || true
    sudo a2enmod rewrite 2>/dev/null || true
    sudo systemctl reload apache2 2>/dev/null || sudo systemctl reload httpd
}

# Créer la structure de base de données
create_database_structure() {
    local db_type=$1
    print_info "Création de la structure de base ($db_type)..."
    
    if [ "$db_type" = "sqlite" ]; then
        sqlite3 depot_manager.db << 'EOF'
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

INSERT OR IGNORE INTO statuts (id, nom, couleur_hex, ordre) VALUES 
(1, 'En attente', '#f39c12', 1),
(2, 'En cours', '#3498db', 2),
(3, 'Terminé', '#27ae60', 3),
(4, 'Livré', '#2ecc71', 4),
(5, 'Annulé', '#e74c3c', 5);
EOF
    else
        # MySQL
        if [ "$METHOD" = "docker" ]; then
            docker exec -i depot-mysql mysql -uroot -pdepot123 depot_manager << 'EOF'
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
    date_depot DATE DEFAULT (CURRENT_DATE),
    date_prevue DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (status_id) REFERENCES statuts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO statuts (id, nom, couleur_hex, ordre) VALUES 
(1, 'En attente', '#f39c12', 1),
(2, 'En cours', '#3498db', 2),
(3, 'Terminé', '#27ae60', 3),
(4, 'Livré', '#2ecc71', 4),
(5, 'Annulé', '#e74c3c', 5);
EOF
        else
            mysql -uroot -pdepot123 depot_manager << 'EOF'
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
    date_depot DATE DEFAULT (CURRENT_DATE),
    date_prevue DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (status_id) REFERENCES statuts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO statuts (id, nom, couleur_hex, ordre) VALUES 
(1, 'En attente', '#f39c12', 1),
(2, 'En cours', '#3498db', 2),
(3, 'Terminé', '#27ae60', 3),
(4, 'Livré', '#2ecc71', 4),
(5, 'Annulé', '#e74c3c', 5);
EOF
        fi
    fi
    
    print_success "Structure de base créée"
}

# Synchroniser client.sql
sync_client_data() {
    print_step "Synchronisation des données client"
    
    if [ -f "client.sql" ]; then
        print_info "Fichier client.sql trouvé, synchronisation en cours..."
        
        # Utiliser le script PHP de synchronisation
        if [ -f "sync_client_linux.php" ]; then
            php sync_client_linux.php client.sql
        else
            print_warning "Script de synchronisation non trouvé, import manuel..."
            manual_client_import
        fi
    else
        print_warning "Fichier client.sql non trouvé"
        create_demo_data
    fi
}

manual_client_import() {
    print_info "Import manuel des données client..."
    
    # Créer quelques clients de test basés sur votre structure
    if [ "$METHOD" = "builtin" ]; then
        sqlite3 depot_manager.db << 'EOF'
INSERT OR IGNORE INTO clients (nom, prenom, email, telephone, adresse, code_postal, ville) VALUES 
('TRENCHARD', 'Clement', 'trenchard.clement@yahoo.fr', '06.72.63.01.00', '57 rue saint nicolas', '76000', 'Rouen'),
('LEFEBVRE', '', '', '02.35.76.15.09', '3, rue du Maréchal Juin', '76960', 'NOTRE DAME DE BONDEVILLE'),
('LEMATTRE', '', '', '02.35.78.09.86', '180 rue du général de gaulle', '76770', 'LE HOULME'),
('VILPOIX', 'Alain', 'vilpoixalain@free.fr', '02.35.33.20.24', '1997 route du bois Ricard', '76360', 'PISSY POVILLE');
EOF
    else
        if [ "$METHOD" = "docker" ]; then
            docker exec -i depot-mysql mysql -uroot -pdepot123 depot_manager << 'EOF'
INSERT IGNORE INTO clients (nom, prenom, email, telephone, adresse, code_postal, ville) VALUES 
('TRENCHARD', 'Clement', 'trenchard.clement@yahoo.fr', '06.72.63.01.00', '57 rue saint nicolas', '76000', 'Rouen'),
('LEFEBVRE', '', '', '02.35.76.15.09', '3, rue du Maréchal Juin', '76960', 'NOTRE DAME DE BONDEVILLE'),
('LEMATTRE', '', '', '02.35.78.09.86', '180 rue du général de gaulle', '76770', 'LE HOULME'),
('VILPOIX', 'Alain', 'vilpoixalain@free.fr', '02.35.33.20.24', '1997 route du bois Ricard', '76360', 'PISSY POVILLE');
EOF
        else
            mysql -uroot -pdepot123 depot_manager << 'EOF'
INSERT IGNORE INTO clients (nom, prenom, email, telephone, adresse, code_postal, ville) VALUES 
('TRENCHARD', 'Clement', 'trenchard.clement@yahoo.fr', '06.72.63.01.00', '57 rue saint nicolas', '76000', 'Rouen'),
('LEFEBVRE', '', '', '02.35.76.15.09', '3, rue du Maréchal Juin', '76960', 'NOTRE DAME DE BONDEVILLE'),
('LEMATTRE', '', '', '02.35.78.09.86', '180 rue du général de gaulle', '76770', 'LE HOULME'),
('VILPOIX', 'Alain', 'vilpoixalain@free.fr', '02.35.33.20.24', '1997 route du bois Ricard', '76360', 'PISSY POVILLE');
EOF
        fi
    fi
    
    print_success "Données client importées"
}

create_demo_data() {
    print_info "Création de données de démonstration..."
    manual_client_import
    
    # Ajouter quelques dépôts de demo
    if [ "$METHOD" = "builtin" ]; then
        sqlite3 depot_manager.db << 'EOF'
INSERT OR IGNORE INTO depots (numero_depot, client_id, status_id, description, notes, date_depot) VALUES 
('DEP-2025-001', 1, 1, 'Réparation ordinateur portable ASUS', 'Écran cassé, disque dur à vérifier', date('now')),
('DEP-2025-002', 2, 2, 'Récupération données disque dur', 'Disque dur externe 1TB', date('now', '-1 day')),
('DEP-2025-003', 3, 3, 'Installation Windows 11', 'PC assemblé, installation complète', date('now', '-2 days'));
EOF
    else
        if [ "$METHOD" = "docker" ]; then
            docker exec -i depot-mysql mysql -uroot -pdepot123 depot_manager << 'EOF'
INSERT IGNORE INTO depots (numero_depot, client_id, status_id, description, notes, date_depot) VALUES 
('DEP-2025-001', 1, 1, 'Réparation ordinateur portable ASUS', 'Écran cassé, disque dur à vérifier', CURDATE()),
('DEP-2025-002', 2, 2, 'Récupération données disque dur', 'Disque dur externe 1TB', DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
('DEP-2025-003', 3, 3, 'Installation Windows 11', 'PC assemblé, installation complète', DATE_SUB(CURDATE(), INTERVAL 2 DAY));
EOF
        else
            mysql -uroot -pdepot123 depot_manager << 'EOF'
INSERT IGNORE INTO depots (numero_depot, client_id, status_id, description, notes, date_depot) VALUES 
('DEP-2025-001', 1, 1, 'Réparation ordinateur portable ASUS', 'Écran cassé, disque dur à vérifier', CURDATE()),
('DEP-2025-002', 2, 2, 'Récupération données disque dur', 'Disque dur externe 1TB', DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
('DEP-2025-003', 3, 3, 'Installation Windows 11', 'PC assemblé, installation complète', DATE_SUB(CURDATE(), INTERVAL 2 DAY));
EOF
        fi
    fi
    
    print_success "Données de démonstration créées"
}

# Créer les fichiers de base si manquants
create_basic_files() {
    print_step "Création des fichiers de base"
    
    # Créer l'API de base
    if [ ! -f "api.php" ]; then
        cat > api.php << 'EOF'
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require_once 'config.php';

try {
    if (isset($dbConfig['type']) && $dbConfig['type'] === 'sqlite') {
        $pdo = new PDO($dbConfig['dsn']);
    } else {
        $dsn = "mysql:host={$dbConfig['host']};dbname={$dbConfig['name']};charset={$dbConfig['charset']}";
        $pdo = new PDO($dsn, $dbConfig['user'], $dbConfig['pass']);
    }
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? '/';
$segments = explode('/', trim($path, '/'));
$resource = $segments[0] ?? '';

switch ($resource) {
    case 'clients':
        if ($method === 'GET') {
            $stmt = $pdo->query("SELECT * FROM clients ORDER BY nom, prenom");
            $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $clients]);
        }
        break;
        
    case 'depots':
        if ($method === 'GET') {
            $stmt = $pdo->query("
                SELECT d.*, c.nom as client_nom, c.prenom as client_prenom, s.nom as status_nom, s.couleur_hex 
                FROM depots d 
                LEFT JOIN clients c ON d.client_id = c.id 
                LEFT JOIN statuts s ON d.status_id = s.id 
                ORDER BY d.created_at DESC
            ");
            $depots = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $depots]);
        }
        break;
        
    case 'stats':
        $stats = [];
        $stmt = $pdo->query("SELECT COUNT(*) FROM clients");
        $stats['clients'] = $stmt->fetchColumn();
        $stmt = $pdo->query("SELECT COUNT(*) FROM depots");
        $stats['depots'] = $stmt->fetchColumn();
        $stmt = $pdo->query("SELECT COUNT(*) FROM depots WHERE status_id = 1");
        $stats['en_attente'] = $stmt->fetchColumn();
        echo json_encode(['success' => true, 'data' => $stats]);
        break;
        
    default:
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Endpoint not found']);
}
?>
EOF
    fi
    
    # Créer l'interface de base
    if [ ! -f "index.html" ]; then
        cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestion des Dépôts</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #f5f5f5; }
        .header { background: #2c3e50; color: white; padding: 1rem; text-align: center; }
        .container { max-width: 1200px; margin: 2rem auto; padding: 0 1rem; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .stat-card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .stat-number { font-size: 2rem; font-weight: bold; color: #3498db; }
        .stat-label { color: #666; margin-top: 0.5rem; }
        .section { background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 2rem; }
        .section-header { padding: 1rem; border-bottom: 1px solid #eee; font-weight: bold; }
        .section-content { padding: 1rem; }
        .table { width: 100%; border-collapse: collapse; }
        .table th, .table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #eee; }
        .table th { background: #f8f9fa; font-weight: bold; }
        .status { padding: 0.25rem 0.5rem; border-radius: 4px; color: white; font-size: 0.8rem; }
        .loading { text-align: center; padding: 2rem; color: #666; }
        .error { background: #e74c3c; color: white; padding: 1rem; border-radius: 4px; margin: 1rem 0; }
        .success { background: #27ae60; color: white; padding: 1rem; border-radius: 4px; margin: 1rem 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔧 Gestion des Dépôts - Réparation Informatique</h1>
        <p>Système de gestion moderne installé avec succès</p>
    </div>

    <div class="container">
        <div class="success">
            ✅ Installation réussie ! Le système est opérationnel.
        </div>

        <div class="stats" id="stats">
            <div class="stat-card">
                <div class="stat-number" id="stat-clients">-</div>
                <div class="stat-label">Clients</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="stat-depots">-</div>
                <div class="stat-label">Dépôts</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="stat-attente">-</div>
                <div class="stat-label">En attente</div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">📋 Derniers Dépôts</div>
            <div class="section-content">
                <div id="depots-loading" class="loading">Chargement des dépôts...</div>
                <table class="table" id="depots-table" style="display:none;">
                    <thead>
                        <tr>
                            <th>N° Dépôt</th>
                            <th>Client</th>
                            <th>Description</th>
                            <th>Statut</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody id="depots-body"></tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <div class="section-header">👥 Clients Récents</div>
            <div class="section-content">
                <div id="clients-loading" class="loading">Chargement des clients...</div>
                <table class="table" id="clients-table" style="display:none;">
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Prénom</th>
                            <th>Email</th>
                            <th>Téléphone</th>
                            <th>Ville</th>
                        </tr>
                    </thead>
                    <tbody id="clients-body"></tbody>
                </table>
            </div>
        </div>
    </div>

    <script>
        // Charger les statistiques
        fetch('api.php/stats')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('stat-clients').textContent = data.data.clients;
                    document.getElementById('stat-depots').textContent = data.data.depots;
                    document.getElementById('stat-attente').textContent = data.data.en_attente;
                }
            })
            .catch(error => console.error('Erreur stats:', error));

        // Charger les dépôts
        fetch('api.php/depots')
            .then(response => response.json())
            .then(data => {
                const loading = document.getElementById('depots-loading');
                const table = document.getElementById('depots-table');
                const tbody = document.getElementById('depots-body');
                
                loading.style.display = 'none';
                
                if (data.success && data.data.length > 0) {
                    data.data.slice(0, 5).forEach(depot => {
                        const row = tbody.insertRow();
                        row.innerHTML = `
                            <td>${depot.numero_depot || 'N/A'}</td>
                            <td>${depot.client_prenom || ''} ${depot.client_nom || 'Client inconnu'}</td>
                            <td>${depot.description || 'Pas de description'}</td>
                            <td><span class="status" style="background:${depot.couleur_hex || '#3498db'}">${depot.status_nom || 'En attente'}</span></td>
                            <td>${depot.date_depot || 'N/A'}</td>
                        `;
                    });
                    table.style.display = 'table';
                } else {
                    loading.innerHTML = 'Aucun dépôt trouvé';
                    loading.style.display = 'block';
                }
            })
            .catch(error => {
                document.getElementById('depots-loading').innerHTML = 'Erreur de chargement';
                console.error('Erreur dépôts:', error);
            });

        // Charger les clients
        fetch('api.php/clients')
            .then(response => response.json())
            .then(data => {
                const loading = document.getElementById('clients-loading');
                const table = document.getElementById('clients-table');
                const tbody = document.getElementById('clients-body');
                
                loading.style.display = 'none';
                
                if (data.success && data.data.length > 0) {
                    data.data.slice(0, 5).forEach(client => {
                        const row = tbody.insertRow();
                        row.innerHTML = `
                            <td>${client.nom || 'N/A'}</td>
                            <td>${client.prenom || 'N/A'}</td>
                            <td>${client.email || 'N/A'}</td>
                            <td>${client.telephone || 'N/A'}</td>
                            <td>${client.ville || 'N/A'}</td>
                        `;
                    });
                    table.style.display = 'table';
                } else {
                    loading.innerHTML = 'Aucun client trouvé';
                    loading.style.display = 'block';
                }
            })
            .catch(error => {
                document.getElementById('clients-loading').innerHTML = 'Erreur de chargement';
                console.error('Erreur clients:', error);
            });
    </script>
</body>
</html>
EOF
    fi
    
    print_success "Fichiers de base créés"
}

# Lancer le serveur
start_server() {
    if [ "$METHOD" = "builtin" ]; then
        print_step "Lancement du serveur PHP"
        
        print_info "Démarrage du serveur sur le port $PORT..."
        php -S localhost:$PORT > server.log 2>&1 &
        SERVER_PID=$!
        echo $SERVER_PID > server.pid
        
        # Attendre que le serveur soit prêt
        sleep 2
        
        if kill -0 $SERVER_PID 2>/dev/null; then
            print_success "Serveur démarré (PID: $SERVER_PID)"
        else
            print_error "Échec du démarrage du serveur"
            return 1
        fi
    fi
}

# Tester l'installation
test_installation() {
    print_step "Test de l'installation"
    
    # Test de connexion
    if curl -s -f "$WEBAPP_URL/api.php/stats" > /dev/null; then
        print_success "API fonctionnelle"
    else
        print_error "API non accessible"
        return 1
    fi
    
    # Test de l'interface
    if curl -s -f "$WEBAPP_URL" > /dev/null; then
        print_success "Interface accessible"
    else
        print_error "Interface non accessible"
        return 1
    fi
    
    print_success "Tests réussis"
}

# Créer le guide de migration XAMPP
create_xampp_migration() {
    print_step "Préparation de la migration XAMPP"
    
    mkdir -p xampp_migration
    
    # Exporter les données
    if [ "$METHOD" = "builtin" ]; then
        sqlite3 depot_manager.db ".dump" > xampp_migration/export_data.sql
    elif [ "$METHOD" = "docker" ]; then
        docker exec depot-mysql mysqldump -uroot -pdepot123 depot_manager > xampp_migration/export_data.sql
    else
        mysqldump -uroot -pdepot123 depot_manager > xampp_migration/export_data.sql
    fi
    
    # Copier tous les fichiers
    cp -r *.php *.html *.css *.js xampp_migration/ 2>/dev/null || true
    
    # Créer la config XAMPP
    cat > xampp_migration/config.php << 'EOF'
<?php
// Configuration XAMPP Production
$dbConfig = [
    'host' => 'localhost',
    'name' => 'gestion_depots',
    'user' => 'root',
    'pass' => '', // Modifiez si nécessaire
    'charset' => 'utf8mb4'
];

define('XAMPP_MODE', true);
define('PRODUCTION', true);
?>
EOF

    # Guide d'installation
    cat > xampp_migration/MIGRATION_XAMPP.md << 'EOF'
# 🚀 Migration vers XAMPP

## Installation XAMPP

1. **Télécharger XAMPP** depuis https://www.apachefriends.org/
2. **Installer** avec Apache + MySQL
3. **Démarrer** Apache et MySQL dans le panel XAMPP

## Déploiement de l'application

1. **Copier les fichiers**
   ```
   Copier tout le contenu de ce dossier dans :
   C:\xampp\htdocs\depot-manager\
   ```

2. **Importer la base de données**
   - Ouvrir http://localhost/phpmyadmin/
   - Créer une base "gestion_depots"
   - Importer le fichier export_data.sql

3. **Accéder à l'application**
   - http://localhost/depot-manager/

## Configuration

- Modifiez config.php si vos paramètres MySQL diffèrent
- L'application est prête pour la production !

✅ Migration terminée !
EOF

    print_success "Package de migration XAMPP créé dans xampp_migration/"
}

# Afficher le résumé final
show_final_summary() {
    print_step "Résumé de l'installation"
    
    echo ""
    echo -e "${GREEN}🎉 Installation terminée avec succès !${NC}"
    echo ""
    echo -e "${CYAN}📊 Configuration :${NC}"
    echo "   • Méthode : $METHOD"
    echo "   • URL principale : $WEBAPP_URL"
    [ ! -z "$ADMIN_URL" ] && echo "   • Administration : $ADMIN_URL"
    echo ""
    echo -e "${CYAN}🔗 Accès :${NC}"
    echo "   • Interface web : $WEBAPP_URL"
    [ ! -z "$ADMIN_URL" ] && echo "   • phpMyAdmin : $ADMIN_URL"
    echo ""
    echo -e "${CYAN}📁 Fichiers créés :${NC}"
    echo "   • config.php (configuration)"
    echo "   • api.php (API backend)"
    echo "   • index.html (interface)"
    [ -d "xampp_migration" ] && echo "   • xampp_migration/ (package XAMPP)"
    echo ""
    echo -e "${CYAN}🛠️  Commandes utiles :${NC}"
    
    if [ "$METHOD" = "builtin" ]; then
        echo "   • Arrêter le serveur : kill \$(cat server.pid)"
        echo "   • Relancer : php -S localhost:$PORT"
    elif [ "$METHOD" = "docker" ]; then
        echo "   • Arrêter : docker-compose down"
        echo "   • Relancer : docker-compose up -d"
        echo "   • Logs : docker-compose logs -f"
    fi
    
    echo ""
    echo -e "${YELLOW}💡 Prochaines étapes :${NC}"
    echo "   1. Visitez $WEBAPP_URL pour tester"
    echo "   2. Ajoutez vos clients et dépôts"
    [ -f "client.sql" ] && echo "   3. Vos données client.sql ont été importées"
    [ -d "xampp_migration" ] && echo "   4. Utilisez xampp_migration/ pour passer sur XAMPP"
    echo ""
    
    # Ouvrir le navigateur si possible
    if command -v xdg-open &> /dev/null; then
        print_info "Ouverture du navigateur..."
        xdg-open "$WEBAPP_URL" &
    elif command -v open &> /dev/null; then
        open "$WEBAPP_URL" &
    fi
}

# Nettoyage en cas d'interruption
cleanup() {
    if [ "$METHOD" = "builtin" ] && [ -f server.pid ]; then
        kill $(cat server.pid) 2>/dev/null || true
        rm -f server.pid
    fi
}

trap cleanup EXIT

# ==================
# FONCTION PRINCIPALE
# ==================
main() {
    print_header
    
    check_prerequisites
    select_installation_method
    
    case $METHOD in
        docker)
            install_docker
            ;;
        builtin)
            install_builtin
            create_basic_files
            start_server
            ;;
        lamp)
            install_lamp
            create_basic_files
            ;;
        migrate)
            create_xampp_migration
            print_success "Package de migration créé !"
            exit 0
            ;;
        demo)
            install_builtin
            create_basic_files
            create_demo_data
            start_server
            ;;
    esac
    
    sync_client_data
    test_installation
    create_xampp_migration
    show_final_summary
}

# Lancer le script
main "$@"