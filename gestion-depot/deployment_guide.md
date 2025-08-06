# 🚀 Guide de Déploiement XAMPP - Production

## 📋 Vue d'ensemble

Ce guide vous accompagne dans la synchronisation de votre fichier `client.sql` et le déploiement complet du système de gestion de dépôts sur XAMPP pour votre entreprise de réparation de matériel informatique.

## 🔄 Étape 1: Synchronisation des Données Client

### Analyse de votre fichier client.sql

Votre fichier `client.sql` utilise une structure ancienne :
```sql
-- Structure existante
CREATE TABLE `client` (
  `Nom` varchar(32),      -- Nom complet (nom + prénom)
  `Adresse` varchar(35),  -- Adresse complète
  `CP` int(5),           -- Code postal
  `Ville` varchar(32),   -- Ville
  `Tel1` varchar(9),     -- Téléphone principal
  `Tel2` varchar(9),     -- Téléphone secondaire
  `Mail` varchar(47),    -- Email
  `No` int(11)           -- ID client
)
```

### Structure moderne du système
```sql
-- Structure moderne attendue
CREATE TABLE `clients` (
  `id` int(11) AUTO_INCREMENT PRIMARY KEY,
  `nom` varchar(100),
  `prenom` varchar(100),
  `email` varchar(150),
  `telephone` varchar(20), 
  `adresse` varchar(255),
  `code_postal` varchar(10),
  `ville` varchar(100),
  `created_at` timestamp,
  `updated_at` timestamp
)
```

## 🛠️ Étape 2: Procédure de Migration

### 2.1 Préparation de l'environnement

1. **Installer XAMPP** (si pas déjà fait)
   - Télécharger depuis https://www.apachefriends.org/
   - Installer avec PHP 7.4+ et MySQL

2. **Démarrer les services**
   ```bash
   # Dans le panel XAMPP
   ✅ Apache: Start
   ✅ MySQL: Start
   ```

3. **Créer la base de données**
   ```sql
   CREATE DATABASE gestion_depots CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

### 2.2 Installation du système

1. **Copier les fichiers** dans `C:\xampp\htdocs\depot-manager\`
   - Tous les fichiers PHP du projet
   - Les fichiers HTML, CSS, JS
   - Le dossier avec les PDFs et archives

2. **Exécuter l'installation**
   ```bash
   http://localhost/depot-manager/install.php
   ```

3. **Importer la structure de base**
   ```bash
   http://localhost/depot-manager/install_database.php
   ```

### 2.3 Migration des données client

1. **Utiliser le script de synchronisation** (voir l'artifact précédent)

2. **Méthode manuelle alternative** :
   ```sql
   -- Importer d'abord votre client.sql dans une table temporaire
   -- Puis exécuter cette migration
   
   INSERT INTO clients (nom, prenom, email, telephone, adresse, code_postal, ville, created_at, updated_at)
   SELECT 
       SUBSTRING_INDEX(Nom, ' ', 1) as nom,
       TRIM(SUBSTRING(Nom, LOCATE(' ', Nom) + 1)) as prenom,
       Mail as email,
       CONCAT(
           SUBSTRING(Tel1, 1, 2), '.',
           SUBSTRING(Tel1, 3, 2), '.',
           SUBSTRING(Tel1, 5, 2), '.',
           SUBSTRING(Tel1, 7, 2), '.',
           SUBSTRING(Tel1, 9, 2)
       ) as telephone,
       Adresse as adresse,
       CP as code_postal,
       Ville as ville,
       NOW() as created_at,
       NOW() as updated_at
   FROM client
   WHERE Nom IS NOT NULL;
   ```

## 🔧 Étape 3: Configuration Production

### 3.1 Configuration de la base de données

Modifier `config.php` :
```php
<?php
// Configuration production
$dbConfig = [
    'host' => 'localhost',
    'name' => 'gestion_depots',
    'user' => 'root',
    'pass' => '', // Changez en production !
    'charset' => 'utf8mb4'
];

// Paramètres de l'entreprise
$companyConfig = [
    'nom' => 'VOTRE ENTREPRISE DE RÉPARATION',
    'adresse' => 'Votre adresse complète',
    'telephone' => 'Votre téléphone',
    'email' => 'contact@votre-entreprise.com'
];
?>
```

### 3.2 Sécurisation

1. **Mot de passe MySQL**
   ```sql
   -- Dans phpMyAdmin, changez le mot de passe root
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'votre_mot_de_passe_fort';
   ```

2. **Fichier .htaccess** pour sécuriser les dossiers sensibles :
   ```apache
   # Dans /backups/
   Order Deny,Allow
   Deny from all
   
   # Dans /logs/
   Order Deny,Allow  
   Deny from all
   ```

### 3.3 Permissions des dossiers

```batch
# Windows
icacls "C:\xampp\htdocs\depot-manager\uploads" /grant Everyone:(OI)(CI)F
icacls "C:\xampp\htdocs\depot-manager\pdf_output" /grant Everyone:(OI)(CI)F
icacls "C:\xampp\htdocs\depot-manager\backups" /grant Everyone:(OI)(CI)F
```

## 📊 Étape 4: Tests et Vérification

### 4.1 Tests fonctionnels

1. **Interface d'accueil**
   ```
   http://localhost/depot-manager/
   ```

2. **Test des APIs**
   ```
   http://localhost/depot-manager/api.php/clients
   http://localhost/depot-manager/api.php/depots
   http://localhost/depot-manager/api.php/stats/dashboard
   ```

3. **Test génération PDF**
   ```
   http://localhost/depot-manager/generate_pdf.php?id=1
   ```

### 4.2 Vérification des données

```sql
-- Vérifier l'import des clients
SELECT COUNT(*) as total_clients FROM clients;

-- Vérifier la structure
SHOW TABLES;

-- Tester les relations
SELECT c.nom, c.prenom, COUNT(d.id) as nb_depots 
FROM clients c 
LEFT JOIN depots d ON c.id = d.client_id 
GROUP BY c.id;
```

## 🔄 Étape 5: Synchronisation Continue

### 5.1 Script de sauvegarde automatique

```php
<?php
// backup_auto.php - À exécuter régulièrement
$backup_dir = 'C:\xampp\htdocs\depot-manager\backups';
$filename = 'backup_' . date('Y-m-d_H-i-s') . '.sql';

$command = "C:\xampp\mysql\bin\mysqldump -u root -p gestion_depots > $backup_dir\\$filename";
exec($command);

echo "Sauvegarde créée: $filename\n";
?>
```

### 5.2 Synchronisation des archives PDF

Créer un script pour lier vos PDFs existants :
```php
<?php
// sync_pdfs.php
$pdf_dir = 'C:\path\to\your\existing\pdfs';
$target_dir = 'C:\xampp\htdocs\depot-manager\pdf_output';

// Copier et organiser les PDFs par client/dépôt
// Code de synchronisation ici...
?>
```

## 🚀 Étape 6: Mise en Production

### 6.1 Configuration finale

1. **Optimisations MySQL** dans `my.ini` :
   ```ini
   [mysqld]
   max_connections = 100
   query_cache_size = 32M
   key_buffer_size = 128M
   ```

2. **Configuration PHP** dans `php.ini` :
   ```ini
   upload_max_filesize = 50M
   post_max_size = 50M
   memory_limit = 256M
   max_execution_time = 300
   ```

### 6.2 Accès réseau (si besoin)

Pour accéder depuis d'autres postes du réseau :
```apache
# Dans httpd.conf
Listen 80
<Directory "C:/xampp/htdocs">
    Require all granted
</Directory>
```

### 6.3 URLs de production

```
- Interface principale: http://[IP-SERVEUR]/depot-manager/
- Administration: http://[IP-SERVEUR]/phpmyadmin/
- API: http://[IP-SERVEUR]/depot-manager/api.php/
```

## ✅ Checklist de Déploiement

### Phase 1: Préparation
- [ ] XAMPP installé et démarré
- [ ] Base de données créée
- [ ] Fichiers copiés dans htdocs
- [ ] Permissions configurées

### Phase 2: Installation
- [ ] install.php exécuté avec succès
- [ ] install_database.php exécuté
- [ ] Données client migrées
- [ ] Tables créées et indexées

### Phase 3: Configuration
- [ ] Configuration de production activée
- [ ] Mots de passe sécurisés
- [ ] Paramètres entreprise configurés
- [ ] Dossiers de sauvegarde créés

### Phase 4: Tests
- [ ] Interface accessible
- [ ] APIs fonctionnelles
- [ ] Génération PDF OK
- [ ] Données client affichées
- [ ] Création/modification dépôts OK

### Phase 5: Production
- [ ] Accès réseau configuré (si nécessaire)
- [ ] Sauvegardes automatiques
- [ ] Monitoring activé
- [ ] Formation utilisateurs

## 🆘 Dépannage

### Problèmes courants

1. **Erreur de connexion MySQL**
   ```
   - Vérifier que MySQL est démarré
   - Vérifier les identifiants dans config.php
   - Tester la connexion dans phpMyAdmin
   ```

2. **Erreur de permissions**
   ```
   - Vérifier les droits sur les dossiers uploads/ et pdf_output/
   - Redémarrer Apache après changement
   ```

3. **PDFs non générés**
   ```
   - Vérifier que fpdf.php est présent
   - Vérifier les permissions d'écriture
   - Contrôler les logs PHP
   ```

## 🎯 Résultat Final

Après ce déploiement, vous aurez :

✅ **Un système complet** de gestion de dépôts  
✅ **Tous vos clients** synchronisés et importés  
✅ **Les archives PDF** organisées et accessibles  
✅ **Une interface moderne** pour la gestion quotidienne  
✅ **Des sauvegardes automatiques** pour la sécurité  
✅ **Un déploiement XAMPP** prêt pour la production  

Le système sera accessible par toute votre équipe via le réseau local et permettra une gestion efficace des réparations de matériel informatique.