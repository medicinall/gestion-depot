#!/bin/bash

echo "===================================="
echo "  GESTION DES DEPOTS - DEMARRAGE"
echo "===================================="
echo ""

# Fonction pour ouvrir le navigateur
open_browser() {
    sleep 2
    if command -v xdg-open > /dev/null; then
        xdg-open http://localhost:8080
    elif command -v open > /dev/null; then
        open http://localhost:8080
    else
        echo "Veuillez ouvrir manuellement: http://localhost:8080"
    fi
}

# Vérifier si Python est installé
if command -v python3 > /dev/null; then
    echo "Python3 détecté - Démarrage du serveur..."
    echo ""
    echo "Application accessible sur: http://localhost:8080"
    echo ""
    echo "CTRL+C pour arrêter le serveur"
    echo ""
    
    # Ouvrir le navigateur en arrière-plan
    open_browser &
    
    # Démarrer le serveur Python
    python3 -m http.server 8080
    
elif command -v python > /dev/null; then
    echo "Python détecté - Démarrage du serveur..."
    echo ""
    echo "Application accessible sur: http://localhost:8080"
    echo ""
    echo "CTRL+C pour arrêter le serveur"
    echo ""
    
    # Ouvrir le navigateur en arrière-plan
    open_browser &
    
    # Démarrer le serveur Python
    python -m http.server 8080

# Vérifier si Node.js est installé
elif command -v node > /dev/null; then
    echo "Node.js détecté - Vérification de http-server..."
    
    # Vérifier si http-server est installé
    if npm list -g http-server > /dev/null 2>&1; then
        echo "Démarrage du serveur Node.js..."
        echo ""
        echo "Application accessible sur: http://localhost:8080"
        echo ""
        echo "CTRL+C pour arrêter le serveur"
        echo ""
        
        # Ouvrir le navigateur en arrière-plan
        open_browser &
        
        # Démarrer http-server
        npx http-server -p 8080
    else
        echo "Installation de http-server..."
        npm install -g http-server
        echo "Démarrage du serveur..."
        echo ""
        echo "Application accessible sur: http://localhost:8080"
        echo ""
        
        # Ouvrir le navigateur en arrière-plan
        open_browser &
        
        npx http-server -p 8080
    fi

# Si aucun serveur n'est disponible
else
    echo "Aucun serveur web détecté."
    echo "Ouverture directe du fichier HTML..."
    echo ""
    echo "ATTENTION: Certaines fonctionnalités peuvent être limitées"
    echo "en mode fichier local."
    echo ""
    echo "Recommandation: Installez Python ou Node.js pour une"
    echo "expérience optimale."
    echo ""
    
    # Ouvrir le fichier HTML avec le navigateur par défaut
    if command -v xdg-open > /dev/null; then
        xdg-open index.html
    elif command -v open > /dev/null; then
        open index.html
    else
        echo "Impossible d'ouvrir automatiquement le fichier."
        echo "Veuillez ouvrir index.html manuellement dans votre navigateur."
    fi
    
    echo ""
    echo "Le fichier a été ouvert dans votre navigateur par défaut."
fi

echo ""
echo "Script terminé."