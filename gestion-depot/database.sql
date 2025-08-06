-- Mise à jour de la table depots pour inclure tous les champs nécessaires au PDF
ALTER TABLE depots 
ADD COLUMN designation_references TEXT DEFAULT NULL AFTER description,
ADD COLUMN observation_travaux TEXT DEFAULT NULL AFTER designation_references,
ADD COLUMN donnees_sauvegarder ENUM('Oui', 'Non') DEFAULT 'Non' AFTER observation_travaux,
ADD COLUMN outlook_sauvegarder ENUM('Oui', 'Non') DEFAULT 'Non' AFTER donnees_sauvegarder,
ADD COLUMN mot_de_passe VARCHAR(255) DEFAULT NULL AFTER outlook_sauvegarder,
ADD COLUMN informations_complementaires TEXT DEFAULT NULL AFTER mot_de_passe;

-- Mise à jour de la table clients pour inclure l'adresse complète
ALTER TABLE clients 
ADD COLUMN adresse VARCHAR(255) DEFAULT NULL AFTER email,
ADD COLUMN code_postal VARCHAR(10) DEFAULT NULL AFTER adresse,
ADD COLUMN ville VARCHAR(100) DEFAULT NULL AFTER code_postal;

-- Ajout d'une table pour les paramètres de l'entreprise (optionnel)
CREATE TABLE IF NOT EXISTS company_settings (
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
);

-- Insérer les paramètres par défaut de l'entreprise
INSERT INTO company_settings (nom, adresse, code_postal, ville, telephone1, telephone2, email, siret, rcs)
VALUES ('WEB INFORMATIQUE', '154 bis rue du général de Gaulle', '76770', 'LE HOULME', 
        '06.99.50.76.76', '02.35.74.19.29', 'contact@webinformatique.eu', 
        '493 933 139 00010', 'RCS ROUEN')
ON DUPLICATE KEY UPDATE id = id;