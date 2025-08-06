<?php
require_once 'fpdf.php';

class DepotPDFGenerator extends FPDF
{
    private $depotData;
    private $clientData;
    private $statutData;
    private $companyInfo;
    
    public function __construct($depotData, $clientData, $statutData)
    {
        parent::__construct();
        $this->depotData = $depotData;
        $this->clientData = $clientData;
        $this->statutData = $statutData;
        
        // Informations de l'entreprise (à adapter selon vos besoins)
        $this->companyInfo = [
            'nom' => 'WEB INFORMATIQUE',
            'adresse' => '154 bis rue du général de Gaulle',
            'code_postal' => '76770',
            'ville' => 'LE HOULME',
            'telephone1' => '06.99.50.76.76',
            'telephone2' => '02.35.74.19.29',
            'email' => 'contact@webinformatique.eu',
            'siret' => '493 933 139 00010',
            'rcs' => 'RCS ROUEN'
        ];
    }
    
    public function generate()
    {
        $this->AddPage();
        $this->SetAutoPageBreak(false);
        
        // Logo en filigrane
        $this->drawWatermarkLogo();
        
        // En-tête du formulaire
        $this->drawHeader();
        
        // Section coordonnées
        $this->drawContactSection();
        
        // Section destinataire  
        $this->drawDestinataireSection();
        
        // Section désignation et observation
        $this->drawDesignationSection();
        
        // Section données et mot de passe
        $this->drawDataSection();
        
        // Section informations complémentaires
        $this->drawInfoSection();
        
        // Section signatures
        $this->drawSignatureSection();
        
        // Pied de page
        $this->drawFooter();
    }
    
    private function drawWatermarkLogo()
    {
        // Logo en filigrane (optionnel)
        $this->SetFont('Arial', 'B', 60);
        $this->SetTextColor(240, 240, 240);
        $this->SetXY(50, 80);
        $this->Cell(0, 0, 'WEB', 0, 0, 'C');
        $this->SetXY(50, 120);
        $this->Cell(0, 0, 'INFORMATIQUE', 0, 0, 'C');
        $this->SetTextColor(0, 0, 0); // Reset couleur
    }
    
    private function drawHeader()
    {
        // Bordure du tableau d'en-tête
        $this->SetLineWidth(0.5);
        $this->Rect(10, 10, 190, 20);
        
        // Lignes de séparation verticales
        $this->Line(50, 10, 50, 30);
        $this->Line(110, 10, 110, 30);
        $this->Line(150, 10, 150, 30);
        
        // En-têtes
        $this->SetFont('Arial', 'B', 10);
        $this->SetXY(10, 12);
        $this->Cell(40, 6, 'Case', 1, 0, 'C');
        $this->Cell(60, 6, 'No Depot', 1, 0, 'C');
        $this->Cell(40, 6, 'Date', 1, 0, 'C');
        $this->Cell(50, 6, 'Contact Client', 1, 1, 'C');
        
        // Valeurs
        $this->SetFont('Arial', '', 10);
        $this->SetXY(10, 18);
        
        // Case (première lettre du nom du client)
        $case = strtoupper(substr($this->clientData['nom'], 0, 1));
        $this->Cell(40, 12, $case, 1, 0, 'C');
        
        // Numéro de dépôt
        $numeroDepot = date('Y') . '/' . str_pad($this->depotData['id'], 3, '0', STR_PAD_LEFT) . '/' . date('m') . date('d');
        $this->Cell(60, 12, $numeroDepot, 1, 0, 'C');
        
        // Date
        $dateDepot = $this->depotData['date_depot'] ? date('d/m/Y', strtotime($this->depotData['date_depot'])) : date('d/m/Y');
        $this->Cell(40, 12, $dateDepot, 1, 0, 'C');
        
        // Contact client (nom + prénom)
        $contact = $this->clientData['prenom'] . ' ' . $this->clientData['nom'];
        $this->MultiCell(50, 4, $contact, 1, 'C');
    }
    
    private function drawContactSection()
    {
        $y_start = 40;
        
        // Section Règlement, renseignement, correspondance
        $this->SetXY(10, $y_start);
        $this->SetFont('Arial', 'B', 9);
        $this->Cell(80, 6, 'Règlement, renseignement,', 0, 1, 'L');
        $this->SetX(10);
        $this->Cell(80, 6, 'correspondance :', 0, 1, 'L');
        
        $this->SetFont('Arial', 'B', 11);
        $this->SetX(10);
        $this->Cell(80, 6, $this->companyInfo['nom'], 0, 1, 'L');
        
        $this->SetFont('Arial', '', 9);
        $this->SetX(10);
        $this->Cell(80, 4, $this->companyInfo['adresse'], 0, 1, 'L');
        $this->SetX(10);
        $this->Cell(80, 4, $this->companyInfo['code_postal'] . ' ' . $this->companyInfo['ville'], 0, 1, 'L');
        $this->SetX(10);
        $this->Cell(80, 4, 'Tél. ' . $this->companyInfo['telephone1'], 0, 1, 'L');
        $this->SetX(10);
        $this->Cell(80, 4, 'Tél. ' . $this->companyInfo['telephone2'], 0, 1, 'L');
        $this->SetX(10);
        $this->Cell(80, 4, $this->companyInfo['email'], 0, 1, 'L');
        
        // Bordure pour la section contact
        $this->Rect(10, $y_start, 85, 45);
    }
    
    private function drawDestinataireSection()
    {
        $y_start = 40;
        
        // Section Destinataire
        $this->SetXY(115, $y_start);
        $this->SetFont('Arial', 'B', 10);
        $this->Cell(85, 6, 'Destinataire', 0, 1, 'C');
        
        // Données client
        $this->SetFont('Arial', '', 9);
        $this->SetXY(115, $y_start + 10);
        $this->Cell(85, 4, $this->clientData['prenom'] . ' ' . $this->clientData['nom'], 0, 1, 'L');
        
        if (!empty($this->clientData['adresse'])) {
            $this->SetX(115);
            $this->Cell(85, 4, $this->clientData['adresse'], 0, 1, 'L');
        }
        
        if (!empty($this->clientData['code_postal']) && !empty($this->clientData['ville'])) {
            $this->SetX(115);
            $this->Cell(85, 4, $this->clientData['code_postal'] . ' ' . $this->clientData['ville'], 0, 1, 'L');
        }
        
        if (!empty($this->clientData['telephone'])) {
            $this->SetX(115);
            $this->Cell(85, 4, 'Tél: ' . $this->clientData['telephone'], 0, 1, 'L');
        }
        
        if (!empty($this->clientData['email'])) {
            $this->SetX(115);
            $this->Cell(85, 4, $this->clientData['email'], 0, 1, 'L');
        }
        
        // Bordure pour la section destinataire
        $this->Rect(115, $y_start, 85, 45);
    }
    
    private function drawDesignationSection()
    {
        $y_start = 95;
        
        // Bordures des sections
        $this->Rect(10, $y_start, 95, 60);
        $this->Rect(105, $y_start, 95, 60);
        
        // En-têtes
        $this->SetFont('Arial', 'B', 10);
        $this->SetXY(10, $y_start + 2);
        $this->Cell(95, 6, 'Désignation, Références', 0, 0, 'L');
        
        $this->SetXY(105, $y_start + 2);
        $this->Cell(95, 6, 'Observation,travaux à effectuer', 0, 0, 'L');
        
        // Contenu
        $this->SetFont('Arial', '', 9);
        
        // Désignation (description du dépôt)
        $this->SetXY(12, $y_start + 12);
        $designation = $this->depotData['designation_references'] ?? $this->depotData['description'] ?? '';
        $this->MultiCell(91, 4, $designation, 0, 'L');
        
        // Observation (travaux à effectuer)
        $this->SetXY(107, $y_start + 12);
        $observation = $this->depotData['observation_travaux'] ?? $this->depotData['notes'] ?? '';
        $this->MultiCell(91, 4, $observation, 0, 'L');
    }
    
    private function drawDataSection()
    {
        $y_start = 165;
        
        // Section données à sauvegarder
        $this->SetFont('Arial', '', 9);
        $this->SetXY(10, $y_start);
        $this->Cell(60, 6, 'Données à sauvegarder :', 0, 0, 'L');
        
        // Cases à cocher pour données
        $donneesSauvegarder = $this->depotData['donnees_sauvegarder'] ?? 'Non';
        $this->SetXY(85, $y_start);
        $this->Cell(15, 6, 'Non', 0, 0, 'L');
        $this->Rect(100, $y_start + 1, 4, 4);
        if ($donneesSauvegarder === 'Non') {
            $this->SetXY(101, $y_start + 2);
            $this->Cell(2, 2, 'X', 0, 0, 'C');
        }
        
        // Section Outlook
        $this->SetXY(130, $y_start);
        $this->Cell(30, 6, 'Outlook :', 0, 0, 'L');
        
        // Cases à cocher pour Outlook
        $outlookSauvegarder = $this->depotData['outlook_sauvegarder'] ?? 'Non';
        $this->SetXY(170, $y_start);
        $this->Cell(15, 6, 'Non', 0, 0, 'L');
        $this->Rect(185, $y_start + 1, 4, 4);
        if ($outlookSauvegarder === 'Non') {
            $this->SetXY(186, $y_start + 2);
            $this->Cell(2, 2, 'X', 0, 0, 'C');
        }
        
        // Cases "Oui"
        $this->SetXY(110, $y_start);
        $this->Cell(15, 6, 'Oui', 0, 0, 'L');
        $this->Rect(125, $y_start + 1, 4, 4);
        if ($donneesSauvegarder === 'Oui') {
            $this->SetXY(126, $y_start + 2);
            $this->Cell(2, 2, 'X', 0, 0, 'C');
        }
        
        $this->SetXY(195, $y_start);
        $this->Cell(15, 6, 'Oui', 0, 0, 'L');
        $this->Rect(210, $y_start + 1, 4, 4);
        if ($outlookSauvegarder === 'Oui') {
            $this->SetXY(211, $y_start + 2);
            $this->Cell(2, 2, 'X', 0, 0, 'C');
        }
        
        // Mot de passe
        $y_start += 15;
        $this->SetXY(10, $y_start);
        $this->Cell(30, 6, 'Mot de passe :', 0, 0, 'L');
        
        $motDePasse = $this->depotData['mot_de_passe'] ?? '';
        $this->SetXY(50, $y_start);
        $this->Cell(100, 6, $motDePasse, 'B', 0, 'L');
    }
    
    private function drawInfoSection()
    {
        $y_start = 190;
        
        // Bordure de la section
        $this->Rect(10, $y_start, 190, 25);
        
        // Titre
        $this->SetFont('Arial', 'B', 9);
        $this->SetXY(10, $y_start + 2);
        $this->Cell(190, 5, 'Informations complémentaires :', 0, 1, 'L');
        
        // Contenu personnalisé ou message par défaut
        $this->SetFont('Arial', 'B', 8);
        $this->SetXY(10, $y_start + 8);
        $infoComp = $this->depotData['informations_complementaires'] ?? 
                   'ATTENTION : LES RÈGLEMENTS PAR CHÈQUES NE SONT PAS ACCEPTÉS.';
        $this->MultiCell(190, 4, $infoComp, 0, 'C');
        
        // Message légal en bas
        $this->SetFont('Arial', '', 7);
        $this->SetXY(10, $y_start + 18);
        $messageLegal = "Cette fiche de dépôt atteste que votre bien est actuellement dans nos locaux.\n" .
                       "Web Informatique ne saurait être tenu responsable de perte de données.\n" .
                       "Tout matériel déposé devant être retiré dans un délai de 30 jours à compter de la\n" .
                       "présente date sous mention écrite.";
        $this->MultiCell(190, 3, $messageLegal, 0, 'C');
    }
    
    private function drawSignatureSection()
    {
        $y_start = 225;
        
        // Bordures des sections de signature
        $this->Rect(10, $y_start, 95, 35);
        $this->Rect(105, $y_start, 95, 35);
        
        // Titres
        $this->SetFont('Arial', 'B', 10);
        $this->SetXY(10, $y_start + 5);
        $this->Cell(95, 6, 'Signature client', 0, 0, 'C');
        
        $this->SetXY(105, $y_start + 5);
        $this->Cell(95, 6, 'Signature ' . $this->companyInfo['nom'], 0, 0, 'C');
    }
    
    private function drawFooter()
    {
        $y_start = 270;
        
        // Pied de page avec informations légales
        $this->SetFont('Arial', '', 8);
        $this->SetXY(10, $y_start);
        $footer = $this->companyInfo['nom'] . ' SARL au capital de 8 000€ SIRET: ' . 
                 $this->companyInfo['siret'] . ' - N° TVA ' . $this->companyInfo['rcs'];
        $this->Cell(190, 4, $footer, 0, 0, 'C');
    }
    
    public function output($filename = null)
    {
        if ($filename === null) {
            $filename = 'depot_' . $this->depotData['id'] . '_' . date('Y-m-d') . '.pdf';
        }
        
        return $this->Output('D', $filename);
    }
    
    public function outputString()
    {
        return $this->Output('S');
    }
}
?>