@echo off
echo ====================================
echo   GESTION DES DEPOTS - DEMARRAGE
echo ====================================
echo.

:: Vérifier si Python est installé
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Python detecte - Demarrage du serveur...
    echo.
    echo Application accessible sur: http://localhost:8080
    echo.
    echo CTRL+C pour arreter le serveur
    echo.
    python -m http.server 8080
    goto :end
)

:: Vérifier si Node.js est installé
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo Node.js detecte - Verification de http-server...
    
    :: Vérifier si http-server est installé
    npx http-server --version >nul 2>&1
    if %errorlevel% == 0 (
        echo Demarrage du serveur Node.js...
        echo.
        echo Application accessible sur: http://localhost:8080
        echo.
        echo CTRL+C pour arreter le serveur
        echo.
        npx http-server -p 8080 -o
        goto :end
    ) else (
        echo Installation de http-server...
        npm install -g http-server
        echo Demarrage du serveur...
        echo.
        echo Application accessible sur: http://localhost:8080
        echo.
        npx http-server -p 8080 -o
        goto :end
    )
)

:: Si aucun serveur n'est disponible, ouvrir le fichier directement
echo Aucun serveur web detecte.
echo Ouverture directe du fichier HTML...
echo.
echo ATTENTION: Certaines fonctionnalites peuvent etre limitees
echo en mode fichier local.
echo.
echo Recommandation: Installez Python ou Node.js pour une
echo experience optimale.
echo.

:: Ouvrir le fichier HTML avec le navigateur par défaut
start index.html

echo.
echo Le fichier a ete ouvert dans votre navigateur par defaut.
echo.

:end
echo.
echo Appuyez sur une touche pour quitter...
pause >nul