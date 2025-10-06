/**
 * ═══════════════════════════════════════════════════════════════════════
 * SYSTÈME D'ORGANISATION DE GROUPES D'ÉTUDE (Apps Script)
 * ═══════════════════════════════════════════════════════════════════════
 * Objectif: formulaire hebdo, regroupement quotidien (12h), Agenda et emails.
 * Auteur: Anthony F. — https://github.com/Anthony-Faria-dos-santos — v3.1.0
 * Installation: 1) CONFIG.EMAIL_ADMIN  2) CONFIG_INITIALE()  3) DEMARRER_SYSTEME()
 * Notes: ES5 (var/function), 25 colonnes standard dans "Réponses".
 */

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🔧 CONFIGURATION GLOBALE - PARAMÈTRES À MODIFIER SELON VOS BESOINS
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Cette section contient tous les paramètres du système.
 * Modifiez ces valeurs selon votre établissement et vos besoins.
 */
var CONFIG = {
  // 📧 EMAIL DE L'ADMINISTRATEUR (OBLIGATOIRE À MODIFIER)
  // Remplacez par votre adresse email pour recevoir les notifications
  EMAIL_ADMIN: "anthony.devfsjs@gmail.com", // ⚠️ MODIFIER ICI - Votre email admin

  // 📅 PARAMÈTRES TEMPORELS
  FUSEAU_HORAIRE: "Europe/Paris", // Fuseau horaire (Europe/Paris, America/New_York, etc.)
  HEURE_CREATION_FORM: 9, // Heure de création du formulaire (9 = 9h00)
  JOUR_CREATION_FORM: 0, // Jour de création (0 = dimanche, 1 = lundi, etc.)

  // 📝 NOMS DES ÉLÉMENTS CRÉÉS
  NOM_SPREADSHEET: "📊 Gestion Groupes d'Étude - BACHELORS 3", // Nom du fichier Google Sheets
  NOM_CALENDAR: "📅 Sessions Groupe d'Étude", // Nom du calendrier Google
  TITRE_FORMULAIRE_PREFIX: "📝 Inscription Semaine", // Préfixe du titre des formulaires
  // 📧 Politique d'envoi
  ENVOI_CONFIRMATION_ETUDIANT: true, // true: email de confirmation envoyé à la soumission

  // 🎨 COULEURS DES ÉVÉNEMENTS CALENDRIER (1-11)
  // Chaque couleur correspond à un type d'événement
  COULEUR_JEUDI: "9", // Couleur pour les sessions campus (jeudi)
  COULEUR_DISCORD: "11", // Couleur pour les sessions Discord

  // 🔗 LIEN DISCORD
  DISCORD_LINK: "https://discord.com/channels/1414939127643901975/1417186619215315127",

  // 🗄️ NOMS DES ONGLETS DANS LE SPREADSHEET
  // Ces noms sont utilisés pour créer et accéder aux feuilles
  ONGLETS: {
    REPONSES: "Réponses", // Feuille contenant les réponses des étudiants
    CRENEAUX: "CRENEAUX", // Feuille contenant les créneaux disponibles
    AUDIT: "AUDIT", // Feuille de suivi des actions (journal)
    CONFIG: "CONFIG", // Feuille de configuration
    ARCHIVE: "ARCHIVE", // Feuille d'archivage des anciennes réponses
    GROUPES: "GROUPES", // Feuille de persistance des groupes formés
  },

  // 🔑 CLÉS POUR STOCKER LES INFORMATIONS
  // Ces clés permettent de sauvegarder les IDs des éléments créés
  PROPS: {
    ID_SPREADSHEET: "ID_SPREADSHEET", // ID du fichier Google Sheets
    ID_CALENDAR: "ID_CALENDAR", // ID du calendrier Google
    ID_FORM: "ID_FORM_ACTUEL", // ID du formulaire actuel
    SEMAINE_FORM: "SEMAINE_FORM_ACTUEL", // Numéro de semaine du formulaire actuel
    VERSION: "VERSION_SYSTEME", // Version du système
  },

  // 📚 MATIÈRES DISPONIBLES DANS LE FORMULAIRE
  // Modifiez cette liste selon les matières de votre établissement
  MATIERES: [
    "Mathématiques",
    "Anglais professionnel - Préparation TOEIC",
    "Cyberstructure de l'internet - réseaux et sécurité",
    "Systèmes d'exploitation",
    "Systèmes d'information et bases de données",
    "Paradigmes de programmation",
    "DevOps",
    "Management de projet IT / Entrepreneuriat TD",
    "Géopolitique et Cyberdéfense",
    "Projets",
    "Numérique responsable",
    "LIBRE (Discuter, jouer, refaire le monde)",
  ],

  // 📊 TYPES D'ACTIVITÉ POUR CHAQUE MATIÈRE
  // Les étudiants peuvent choisir le type d'activité pour chaque matière
  TYPES_ACTIVITE: ["📝 Révisions", "✍️ Devoirs"],

  // ✅ NIVEAUX D'ACCOMPAGNEMENT
  // Niveau d'aide souhaité par l'étudiant pour chaque matière
  NIVEAUX_ACCOMPAGNEMENT: [
    "🎓 Je viens aider", // L'étudiant peut aider les autres
    "✅ Je consolide mes acquis", // L'étudiant veut confirmer ses connaissances
    "🤔 J'ai besoin d'aide", // L'étudiant a besoin d'aide
    "🆘 Je suis coulé", // L'étudiant a vraiment besoin d'aide
  ],

  // 🎓 NIVEAUX D'ÉTUDE DISPONIBLES
  // Niveau académique de l'étudiant
  NIVEAUX: ["[B3] Bachelor 3", "[B3+L] Bachelor 3 + Licence"],

  // 👥 GROUPES DE CLASSE DISPONIBLES
  // Groupe de classe de l'étudiant
  GROUPES: ["[L3A] Groupe A", "[L3B] Groupe B", "[L3C] Groupe C"],

  // 📊 STRUCTURE DES COLONNES DANS LE SPREADSHEET (25 colonnes au total)
  // Cette structure définit l'ordre des colonnes dans la feuille "Réponses"
  // Chaque numéro correspond à la position de la colonne (1 = A, 2 = B, etc.)
COLONNES_REPONSES: {
    // Informations de base
    TIMESTAMP: 1, // Date et heure de la réponse
    EMAIL: 2, // Adresse email de l'étudiant
    PRENOM: 3, // Prénom de l'étudiant
    NOM: 4, // Nom de l'étudiant
    NIVEAU: 5, // Niveau d'étude (B3, B3+L)
    GROUPE: 6, // Groupe de classe (L3A, L3B, L3C)

    // Matière 1 (obligatoire)
    MATIERE1: 7, // Première matière choisie
    TYPE1: 8, // Type d'activité pour la matière 1
    ACCOMPAGNEMENT1: 9, // Niveau d'accompagnement pour la matière 1

    // Matière 2 (obligatoire)
    MATIERE2: 10, // Deuxième matière choisie
    TYPE2: 11, // Type d'activité pour la matière 2
    ACCOMPAGNEMENT2: 12, // Niveau d'accompagnement pour la matière 2

    // Matière 3 (optionnelle)
    MATIERE3: 13, // Troisième matière choisie
    TYPE3: 14, // Type d'activité pour la matière 3
    ACCOMPAGNEMENT3: 15, // Niveau d'accompagnement pour la matière 3

    // Matière 4 (optionnelle)
    MATIERE4: 16, // Quatrième matière choisie
    TYPE4: 17, // Type d'activité pour la matière 4
    ACCOMPAGNEMENT4: 18, // Niveau d'accompagnement pour la matière 4

    // Créneaux de disponibilité
    JEUDI_CAMPUS: 19, // Disponible jeudi après-midi au campus
    LUNDI_DISCORD: 20, // Disponible lundi soir sur Discord
    MARDI_DISCORD: 21, // Disponible mardi soir sur Discord
    MERCREDI_DISCORD: 22, // Disponible mercredi soir sur Discord
    JEUDI_DISCORD: 23, // Disponible jeudi soir sur Discord
    VENDREDI_DISCORD: 24, // Disponible vendredi soir sur Discord

    // Commentaire optionnel
    COMMENTAIRE: 25, // Commentaire libre de l'étudiant
  },

  // 📋 En-têtes exacts pour les 25 colonnes Réponses
  HEADERS_REPONSES: [
    "Horodateur",
    "Adresse e-mail",
    "Prénom",
    "Nom",
    "Niveau",
    "Groupe",
    "Matière 1",
    "Type 1",
    "Accompagnement 1",
    "Matière 2",
    "Type 2",
    "Accompagnement 2",
    "Matière 3",
    "Type 3",
    "Accompagnement 3",
    "Matière 4",
    "Type 4",
    "Accompagnement 4",
    "Jeudi Campus",
    "Lundi Discord",
    "Mardi Discord", 
    "Mercredi Discord",
    "Jeudi Discord",
    "Vendredi Discord",
    "Commentaire (optionnel)",
  ],
  
  // ⏰ Créneaux disponibles
  CRENEAUX: {
    JEUDI_CAMPUS: {
      nom: "Jeudi après-midi (Campus)",
      debut: 13,
      fin: 17,
      jour: 4,
      lieu: "Campus",
    },
    LUNDI_DISCORD: {
      nom: "Lundi soir (Discord)",
      debut: 16.75,
      fin: 19,
      jour: 1,
      lieu: "Discord",
    },
    MARDI_DISCORD: {
      nom: "Mardi soir (Discord)",
      debut: 16.75,
      fin: 19,
      jour: 2,
      lieu: "Discord",
    },
    MERCREDI_DISCORD: {
      nom: "Mercredi soir (Discord)",
      debut: 16.75,
      fin: 19,
      jour: 3,
      lieu: "Discord",
    },
    JEUDI_DISCORD: {
      nom: "Jeudi soir (Discord)",
      debut: 16.75,
      fin: 19,
      jour: 4,
      lieu: "Discord",
    },
    VENDREDI_DISCORD: {
      nom: "Vendredi soir (Discord)",
      debut: 16.75,
      fin: 19,
      jour: 5,
      lieu: "Discord",
    },
  },

  VERSION: "3.1.0",
};

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🛠️ FONCTIONS UTILITAIRES - OUTILS DE BASE POUR LE SCRIPT
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Ces fonctions sont utilisées par les autres parties du script.
 * Elles fournissent des outils de base pour la gestion des emails,
 * des dates, et d'autres opérations courantes.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🎨 TEMPLATES EMAIL HTML
 * ═══════════════════════════════════════════════════════════════════════
 */

/**
 * Génère l'en-tête HTML pour les emails
 * Cette fonction crée le début d'un email HTML avec un titre et un emoji
 * @param {string} titre - Le titre de l'email (ex: "Inscription confirmée")
 * @param {string} emoji - L'emoji à afficher (ex: "✅")
 * @return {string} - Le code HTML complet de l'en-tête
 */
function GENERER_EMAIL_HEADER_(titre, emoji) {
  return (
    "<!DOCTYPE html>" +
    "<html>" +
    "<head>" +
    '<meta charset="utf-8">' +
    "<style>" +
    "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }" +
    ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }" +
    ".header h1 { margin: 0; font-size: 28px; }" +
    ".content { background: #f9f9f9; padding: 30px; }" +
    ".card { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }" +
    ".card h2 { color: #667eea; margin-top: 0; font-size: 20px; border-bottom: 2px solid #667eea; padding-bottom: 10px; }" +
    ".info-line { padding: 8px 0; border-bottom: 1px solid #eee; }" +
    ".info-line:last-child { border-bottom: none; }" +
    ".info-label { font-weight: bold; color: #555; display: inline-block; width: 140px; }" +
    ".info-value { color: #333; }" +
    ".creneau-item { background: #e8f4f8; padding: 12px; margin: 8px 0; border-left: 4px solid #3498db; border-radius: 4px; }" +
    ".matiere-item { background: #fef5e7; padding: 12px; margin: 8px 0; border-left: 4px solid #f39c12; border-radius: 4px; }" +
    ".footer { background: #34495e; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; }" +
    ".button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }" +
    ".success { color: #27ae60; font-weight: bold; }" +
    ".warning { color: #e67e22; font-weight: bold; }" +
    ".error { color: #e74c3c; font-weight: bold; }" +
    "</style>" +
    "</head>" +
    "<body>" +
    '<div class="header">' +
    "<h1>" +
    emoji +
    " " +
    titre +
    "</h1>" +
    "</div>" +
    '<div class="content">'
  );
}

/**
 * Génère le pied de page HTML pour les emails
 * Cette fonction crée la fin d'un email HTML avec les informations de contact
 * @return {string} - Le code HTML complet du pied de page
 */
function GENERER_EMAIL_FOOTER_() {
  return (
    "</div>" +
    '<div class="footer">' +
    "<p>📚 Système de Gestion des Groupes d'Étude</p>" +
    "<p>🤖 Email généré automatiquement - Ne pas répondre</p>" +
    '<p style="margin-top: 15px; font-size: 10px; opacity: 0.7;">Version ' +
    CONFIG.VERSION +
    "</p>" +
    "</div>" +
    "</body>" +
    "</html>"
  );
}

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🚀 FONCTIONS PRINCIPALES - ORCHESTRATION DU SYSTÈME
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Ces fonctions constituent le cœur du système. Elles orchestrent
 * la création des formulaires, la gestion des réponses, et la
 * formation des groupes.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🔧 CONFIGURATION INITIALE
 * ═══════════════════════════════════════════════════════════════════════
 */

/**
 * Configuration initiale du système
 * Cette fonction doit être exécutée une seule fois au début
 * Elle crée le spreadsheet, le calendrier, et configure les permissions
 *
 * ⚠️ IMPORTANT :
 * 1. Modifiez d'abord CONFIG.EMAIL_ADMIN avec votre email
 * 2. Exécutez la fonction CONFIG_INITIALE() en premier (une seule et unique fois)
 * 3. Autorisez toutes les permissions demandées          
 * 4. Exécutez la fonction DEMARRER_SYSTEME() en deuxième
 * 5. Exécutez la fonction TEST_COMPLET() en troisième, si tout est au  c'est bon.
 * 6. Si besoin de Clean, exécutez NETTOYER_SYSTEME() et répéter les étapes 2 à 5.

 * 4. Vérifiez que tout s'est bien passé dans les logs
 */
function CONFIG_INITIALE() {
  Logger.log("═══════════════════════════════════════════════════════");
  Logger.log("🚀 CONFIGURATION INITIALE DU SYSTÈME");
  Logger.log("═══════════════════════════════════════════════════════");
  
  try {
    var props = PropertiesService.getScriptProperties();
    
    // Vérifier si déjà configuré
    var ssId = props.getProperty(CONFIG.PROPS.ID_SPREADSHEET);
    if (ssId) {
      Logger.log("⚠️ Système déjà configuré !");
      Logger.log("📊 Spreadsheet ID : " + ssId);
      Logger.log("");
      Logger.log("💡 Pour reconfigurer, exécutez d'abord : NETTOYER_SYSTEME()");
      
      var htmlBody = GENERER_EMAIL_HEADER_(
        "Configuration déjà existante",
        "⚠️"
      );
      htmlBody +=
        '<div class="card">' +
        "<h2>⚠️ Système déjà configuré</h2>" +
        '<div class="info-line">' +
        '<span class="info-label">Spreadsheet ID :</span>' +
        '<span class="info-value">' +
        ssId +
        "</span>" +
        "</div>" +
        '<p style="margin-top: 20px;">Pour reconfigurer le système :</p>' +
        "<ol>" +
        "<li>Exécutez <code>NETTOYER_SYSTEME()</code></li>" +
        "<li>Puis relancez <code>CONFIG_INITIALE()</code></li>" +
        "</ol>" +
        "</div>";
      htmlBody += GENERER_EMAIL_FOOTER_();
      
      MailApp.sendEmail({
        to: CONFIG.EMAIL_ADMIN,
        subject: "⚠️ Configuration déjà existante",
        htmlBody: htmlBody,
      });
      
      return;
    }
    
    Logger.log("");
    Logger.log("📊 Étape 1/3 : Création du Spreadsheet maître...");
    var ssId = CREER_SPREADSHEET_();
    props.setProperty(CONFIG.PROPS.ID_SPREADSHEET, ssId);
    var ss = SpreadsheetApp.openById(ssId);
    Logger.log("✅ Spreadsheet créé : " + ss.getUrl());
    
    Logger.log("");
    Logger.log("📅 Étape 2/3 : Création de l'agenda partagé...");
    var calId = CREER_CALENDAR_();
    props.setProperty(CONFIG.PROPS.ID_CALENDAR, calId);
    var cal = CalendarApp.getCalendarById(calId);
    Logger.log("✅ Calendar créé : " + cal.getName());
    
    Logger.log("");
    Logger.log("🔑 Étape 3/3 : Enregistrement de la version...");
    props.setProperty(CONFIG.PROPS.VERSION, CONFIG.VERSION);
    Logger.log("✅ Version enregistrée : " + CONFIG.VERSION);
    
    // Audit
    ECRIRE_AUDIT_("INSTALLATION", {
      spreadsheet: ssId,
      calendar: calId,
      version: CONFIG.VERSION,
    });
    
    Logger.log("");
    Logger.log("═══════════════════════════════════════════════════════");
    Logger.log("✅ CONFIGURATION TERMINÉE AVEC SUCCÈS");
    Logger.log("═══════════════════════════════════════════════════════");
    Logger.log("");
    Logger.log("📧 Envoi de l'email de confirmation...");
    
    // Email HTML soigné
    var htmlBody = GENERER_EMAIL_HEADER_("Configuration réussie", "✅");
    
    htmlBody +=
      '<div class="card">' +
      "<h2>🎉 Système configuré avec succès !</h2>" +
      "<p>Tous les composants ont été créés et sont opérationnels.</p>" +
      "</div>";

    htmlBody +=
      '<div class="card">' +
      "<h2>📊 Spreadsheet créé</h2>" +
      '<div class="info-line">' +
      '<span class="info-label">URL :</span>' +
      '<span class="info-value"><a href="' +
      ss.getUrl() +
      '">Ouvrir le Spreadsheet</a></span>' +
      "</div>" +
      '<div class="info-line">' +
      '<span class="info-label">ID :</span>' +
      '<span class="info-value"><code>' +
      ssId +
      "</code></span>" +
      "</div>" +
      '<div class="info-line">' +
      '<span class="info-label">Onglets créés :</span>' +
      '<span class="info-value">Réponses, CRENEAUX, AUDIT, CONFIG, ARCHIVE</span>' +
      "</div>" +
      "</div>";
    
    htmlBody +=
      '<div class="card">' +
      "<h2>📅 Calendar créé</h2>" +
      '<div class="info-line">' +
      '<span class="info-label">Nom :</span>' +
      '<span class="info-value">' +
      cal.getName() +
      "</span>" +
      "</div>" +
      '<div class="info-line">' +
      '<span class="info-label">ID :</span>' +
      '<span class="info-value"><code>' +
      calId +
      "</code></span>" +
      "</div>" +
      "</div>";

    htmlBody +=
      '<div class="card">' +
      "<h2>🚀 Prochaine étape</h2>" +
      "<p>Pour activer le système et créer le premier formulaire :</p>" +
      "<ol>" +
      "<li>Ouvrez Apps Script</li>" +
      "<li>Exécutez la fonction : <code>DEMARRER_SYSTEME()</code></li>" +
      "<li>Autorisez les permissions</li>" +
      "</ol>" +
      '<p style="margin-top: 20px;">Cette fonction va :</p>' +
      "<ul>" +
      "<li>✅ Créer le formulaire de la semaine en cours</li>" +
      "<li>✅ Installer les déclencheurs automatiques</li>" +
      "<li>✅ Rendre le système pleinement opérationnel</li>" +
      "</ul>" +
      "</div>";
    
    htmlBody += GENERER_EMAIL_FOOTER_();
    
    MailApp.sendEmail({
      to: CONFIG.EMAIL_ADMIN,
      subject: "✅ Configuration initiale terminée",
      htmlBody: htmlBody,
    });
    
    Logger.log("✅ Email de confirmation envoyé");
  } catch (e) {
    Logger.log("❌ ERREUR : " + e.toString());
    Logger.log("Stack : " + e.stack);
    
    var htmlBody = GENERER_EMAIL_HEADER_("Erreur de configuration", "❌");
    htmlBody +=
      '<div class="card">' +
      '<h2 class="error">❌ Une erreur est survenue</h2>' +
      '<div class="info-line">' +
      '<span class="info-label">Erreur :</span>' +
      '<span class="info-value error">' +
      e.toString() +
      "</span>" +
      "</div>" +
      '<div class="info-line">' +
      '<span class="info-label">Stack :</span>' +
      '<span class="info-value"><pre>' +
      e.stack +
      "</pre></span>" +
      "</div>" +
      '<p style="margin-top: 20px;">Vérifiez les logs dans Apps Script pour plus de détails.</p>' +
      "</div>";
    htmlBody += GENERER_EMAIL_FOOTER_();
    
    MailApp.sendEmail({
      to: CONFIG.EMAIL_ADMIN,
      subject: "❌ Erreur lors de la configuration",
      htmlBody: htmlBody,
    });
    
    throw new Error("Échec de la configuration initiale : " + e.toString());
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 📊 CRÉATION DU SPREADSHEET
 * ═══════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 📊 GESTION DES SPREADSHEETS ET DONNÉES
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Ces fonctions gèrent la création et la configuration des fichiers
 * Google Sheets utilisés pour stocker les données du système.
 */

/**
 * Crée le fichier Google Sheets principal avec tous les onglets nécessaires
 * Cette fonction crée un nouveau spreadsheet avec la structure complète :
 * - Onglet "Réponses" : Stockage des réponses des étudiants (25 colonnes)
 * - Onglet "CRENEAUX" : Créneaux disponibles pour les sessions
 * - Onglet "AUDIT" : Journal des actions et modifications
 * - Onglet "CONFIG" : Configuration du système
 * - Onglet "ARCHIVE" : Archivage des anciennes réponses
 * - Onglet "GROUPES" : Persistance des groupes formés
 *
 * ⚠️ IMPORTANT :
 * Cette fonction est appelée automatiquement par CONFIG_INITIALE()
 * Ne l'exécutez pas manuellement sauf en cas de problème
 *
 * @return {string} - L'ID du spreadsheet créé
 */
function CREER_SPREADSHEET_() {
  Logger.log("📊 Création du Spreadsheet...");
  
  try {
    var ss = SpreadsheetApp.create(CONFIG.NOM_SPREADSHEET);
    var ssId = ss.getId();
    
    Logger.log("✅ Spreadsheet créé : " + ssId);
    
    // === ONGLET RÉPONSES ===
    var sheetReponses = ss.getSheets()[0];
    sheetReponses.setName(CONFIG.ONGLETS.REPONSES);
    
    // Utiliser les en-têtes standardisés (25 colonnes)
    sheetReponses
      .getRange(1, 1, 1, CONFIG.HEADERS_REPONSES.length)
      .setValues([CONFIG.HEADERS_REPONSES])
      .setFontWeight("bold")
      .setBackground("#4285f4")
      .setFontColor("#ffffff");
    
    sheetReponses.setFrozenRows(1);
    sheetReponses.autoResizeColumns(1, CONFIG.HEADERS_REPONSES.length);
    
    // === ONGLET CRÉNEAUX ===
    var sheetCreneaux = ss.insertSheet(CONFIG.ONGLETS.CRENEAUX);
    
    var headersCreneaux = [
      "Créneau",
      "Jour",
      "Début",
      "Fin",
      "Lieu",
      "Description",
    ];
    
    sheetCreneaux
      .getRange(1, 1, 1, headersCreneaux.length)
      .setValues([headersCreneaux])
      .setFontWeight("bold")
      .setBackground("#34a853")
      .setFontColor("#ffffff");
    
    var dataCreneaux = [
      [
        "Jeudi Campus",
        "Jeudi",
        "13:00",
        "17:00",
        "Campus",
        "Session présentiel",
      ],
      [
        "Lundi Discord",
        "Lundi",
        "16:45",
        "19:00",
        "Discord",
        "Session en ligne",
      ],
      [
        "Mardi Discord",
        "Mardi",
        "16:45",
        "19:00",
        "Discord",
        "Session en ligne",
      ],
      [
        "Mercredi Discord",
        "Mercredi",
        "16:45",
        "19:00",
        "Discord",
        "Session en ligne",
      ],
      [
        "Jeudi Discord",
        "Jeudi",
        "16:45",
        "19:00",
        "Discord",
        "Session en ligne",
      ],
      [
        "Vendredi Discord",
        "Vendredi",
        "16:45",
        "19:00",
        "Discord",
        "Session en ligne",
      ],
    ];

    sheetCreneaux
      .getRange(2, 1, dataCreneaux.length, dataCreneaux[0].length)
      .setValues(dataCreneaux);
    
    sheetCreneaux.setFrozenRows(1);
    sheetCreneaux.autoResizeColumns(1, headersCreneaux.length);
    
    // === ONGLET AUDIT ===
    var sheetAudit = ss.insertSheet(CONFIG.ONGLETS.AUDIT);
    
    var headersAudit = ["Timestamp", "Action", "Détails", "Utilisateur"];

    sheetAudit
      .getRange(1, 1, 1, headersAudit.length)
      .setValues([headersAudit])
      .setFontWeight("bold")
      .setBackground("#fbbc04")
      .setFontColor("#000000");
    
    sheetAudit.setFrozenRows(1);
    sheetAudit.autoResizeColumns(1, headersAudit.length);
    
    // === ONGLET CONFIG ===
    var sheetConfig = ss.insertSheet(CONFIG.ONGLETS.CONFIG);
    
    var headersConfig = ["Paramètre", "Valeur", "Description"];

    sheetConfig
      .getRange(1, 1, 1, headersConfig.length)
      .setValues([headersConfig])
      .setFontWeight("bold")
      .setBackground("#ea4335")
      .setFontColor("#ffffff");
    
    var dataConfig = [
      ["Version", CONFIG.VERSION, "Version du système"],
      ["Email Admin", CONFIG.EMAIL_ADMIN, "Email de l'administrateur"],
      ["Fuseau Horaire", CONFIG.FUSEAU_HORAIRE, "Fuseau horaire utilisé"],
      ["Jour Création", "Dimanche", "Jour de création du formulaire"],
      ["Heure Création", "9h", "Heure de création du formulaire"],
      [
        "Nb Matières",
        CONFIG.MATIERES.length.toString(),
        "Nombre de matières disponibles",
      ],
      [
        "Date Installation",
        new Date().toString(),
        "Date d'installation du système",
      ],
    ];

    sheetConfig
      .getRange(2, 1, dataConfig.length, dataConfig[0].length)
      .setValues(dataConfig);
    
    sheetConfig.setFrozenRows(1);
    sheetConfig.autoResizeColumns(1, headersConfig.length);
    
    // === ONGLET ARCHIVE ===
    var sheetArchive = ss.insertSheet(CONFIG.ONGLETS.ARCHIVE);
    
    // Utiliser les mêmes en-têtes que Réponses (25 colonnes)
    sheetArchive
      .getRange(1, 1, 1, CONFIG.HEADERS_REPONSES.length)
      .setValues([CONFIG.HEADERS_REPONSES])
      .setFontWeight("bold")
      .setBackground("#9e9e9e")
      .setFontColor("#ffffff");
    
    sheetArchive.setFrozenRows(1);
    sheetArchive.autoResizeColumns(1, CONFIG.HEADERS_REPONSES.length);

    // === ONGLET GROUPES (persistence des regroupements) ===
    var sheetGroupes = ss.insertSheet("GROUPES");
    var headersGroupes = [
      "DateISO", // yyyy-mm-dd
      "SlotKey", // ex : JEUDI_CAMPUS
      "Subject", // Matière pivot ou combinaison
      "GroupIndex", // 1,2,3...
      "EventId",
      "ParticipantEmails", // séparés par ;
      "ParticipantNoms", // même ordre que emails
      "CreatedAt",
      "UpdatedAt",
      "LastRunISO",
    ];

    sheetGroupes
      .getRange(1, 1, 1, headersGroupes.length)
      .setValues([headersGroupes])
      .setFontWeight("bold")
      .setBackground("#607d8b")
      .setFontColor("#ffffff");

    sheetGroupes.setFrozenRows(1);
    sheetGroupes.autoResizeColumns(1, headersGroupes.length);

  // === ONGLET ADMIN (contrôles manuels) ===
  var sheetAdmin = ss.insertSheet("ADMIN");
  sheetAdmin.getRange(1, 1).setValue("Action").setFontWeight("bold");
  sheetAdmin.getRange(1, 2).setValue("Paramètre").setFontWeight("bold");
  sheetAdmin.getRange(2, 1).setValue("Relancer batch aujourd'hui");
  sheetAdmin.getRange(3, 1).setValue("Relancer batch pour date (yyyy-mm-dd)");
  sheetAdmin.getRange(3, 2).setValue(Utilities.formatDate(new Date(), CONFIG.FUSEAU_HORAIRE, "yyyy-MM-dd"));
  // Cases à cocher en A2 et A3
  sheetAdmin.getRange(2, 1).insertCheckboxes();
  sheetAdmin.getRange(3, 1).insertCheckboxes();
  sheetAdmin.setFrozenRows(1);
  sheetAdmin.autoResizeColumns(1, 2);
    
    // === PERMISSIONS ===
    var file = DriveApp.getFileById(ssId);
    file.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);
    
    Logger.log("✅ Spreadsheet configuré");
    
    return ssId;
  } catch (e) {
    Logger.log("❌ ERREUR : " + e.toString());
    throw e;
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 📅 GESTION DU CALENDRIER GOOGLE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Ces fonctions gèrent la création et la configuration du calendrier
 * Google utilisé pour les événements de groupe.
 */

/**
 * Crée le calendrier Google pour les événements de groupe
 * Cette fonction crée un nouveau calendrier avec les paramètres appropriés :
 * - Nom personnalisé selon CONFIG.NOM_CALENDAR
 * - Couleurs différenciées pour les types d'événements
 * - Permissions configurées pour l'administrateur
 *
 * ⚠️ IMPORTANT :
 * Cette fonction est appelée automatiquement par CONFIG_INITIALE()
 * Le calendrier sera visible dans votre Google Calendar
 *
 * @return {string} - L'ID du calendrier créé
 */
function CREER_CALENDAR_() {
  Logger.log("📅 Création du Calendar...");
  
  try {
    var cal = CalendarApp.createCalendar(CONFIG.NOM_CALENDAR, {
      summary: "Agenda des sessions de groupes d'étude",
      timeZone: CONFIG.FUSEAU_HORAIRE,
      color: CalendarApp.Color.BLUE,
    });
    
    var calId = cal.getId();
    Logger.log("✅ Calendar créé : " + calId);
    
    return calId;
  } catch (e) {
    Logger.log("❌ ERREUR : " + e.toString());
    throw e;
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 📋 FONCTION D'AUDIT
 * ═══════════════════════════════════════════════════════════════════════
 */

/**
 * Écrit une entrée dans l'audit trail
 */
function ECRIRE_AUDIT_(action, details) {
  try {
    var props = PropertiesService.getScriptProperties();
    var ssId = props.getProperty(CONFIG.PROPS.ID_SPREADSHEET);
    
    if (!ssId) return;
    
    var ss = SpreadsheetApp.openById(ssId);
    var sheetAudit = ss.getSheetByName(CONFIG.ONGLETS.AUDIT);
    
    if (!sheetAudit) return;
    
    var timestamp = new Date();
    var utilisateur = Session.getActiveUser().getEmail();
    var detailsStr = JSON.stringify(details);
    
    sheetAudit.appendRow([timestamp, action, detailsStr, utilisateur]);
  } catch (e) {
    Logger.log("⚠️ Impossible d'écrire dans l'audit : " + e.toString());
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🛠️ FONCTIONS UTILITAIRES DE BASE
 * ═══════════════════════════════════════════════════════════════════════
 */

/**
 * Retourne le lundi de la semaine contenant la date donnée
 */
function OBTENIR_LUNDI_SEMAINE_(date) {
  var jour = date.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
  var diff = jour === 0 ? -6 : 1 - jour; // Si dimanche, reculer de 6 jours
  var lundi = new Date(date);
  lundi.setDate(date.getDate() + diff);
  lundi.setHours(0, 0, 0, 0);
  return lundi;
}

/**
 * Ajoute des jours à une date
 */
function AJOUTER_JOURS_(date, jours) {
  var resultat = new Date(date.getTime());
  resultat.setDate(resultat.getDate() + jours);
  return resultat;
}

/**
 * Calcule la semaine ISO 8601 d'une date
 */
function CALCULER_SEMAINE_ISO_(date) {
  var d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  
  var premierJanvier = new Date(d.getFullYear(), 0, 1);
  var numeroSemaine = Math.ceil(((d - premierJanvier) / 86400000 + 1) / 7);
  
  return {
    annee: d.getFullYear(),
    semaine: numeroSemaine,
  };
}

/**
 * Formate un nombre avec un zéro devant si < 10
 */
function ZERO_PAD_(num) {
  return num < 10 ? "0" + num : "" + num;
}

/**
 * Parse un horodatage venant de la feuille (Date ou String locale)
 * Retourne un objet Date; tente plusieurs formats fr/us.
 */
function PARSE_TIMESTAMP_(value, tz) {
  if (Object.prototype.toString.call(value) === "[object Date]") {
    return value;
  }
  var s = String(value || "").trim();
  if (!s) return null;
  // Essaye ISO direct
  var d = new Date(s);
  if (!isNaN(d.getTime())) return d;
  // Essaye MM/dd/yyyy[ HH:mm[:ss]] (format US) ou dd/MM/yyyy ou dd-MM-yyyy
  var m = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (m) {
    var a = parseInt(m[1], 10);
    var b = parseInt(m[2], 10);
    var year = parseInt(m[3], 10);
    var hh = m[4] ? parseInt(m[4], 10) : 0;
    var mm = m[5] ? parseInt(m[5], 10) : 0;
    var ss = m[6] ? parseInt(m[6], 10) : 0;
    
    // Heuristique pour MM/dd/yyyy (US) vs dd/MM/yyyy (FR)
    var day, month;
    if (a > 12 && b <= 12) {
      // a=jour, b=mois (format FR dd/MM/yyyy)
      day = a; month = b - 1;
    } else if (b > 12 && a <= 12) {
      // b=jour, a=mois (format FR dd/MM/yyyy)  
      day = b; month = a - 1;
    } else if (a <= 12 && b <= 12) {
      // Ambiguïté: on assume MM/dd/yyyy (US) par défaut
      month = a - 1; day = b;
    } else {
      // Fallback
      day = a; month = b - 1;
    }
    var out = new Date(year, month, day, hh, mm, ss, 0);
    return isNaN(out.getTime()) ? null : out;
  }
  return null;
}

/**
 * Vérifie rapidement qu'un email est plausible.
 */
function VALID_EMAIL_(email) {
  var s = String(email || "").trim();
  return !!s && /.+@.+\..+/.test(s);
}

/**
 * Écrit une entrée dans l'audit
 */
function ECRIRE_AUDIT_(action, details) {
  try {
    var props = PropertiesService.getScriptProperties();
    var ssId = props.getProperty(CONFIG.PROPS.ID_SPREADSHEET);
    
    if (!ssId) {
      Logger.log("⚠️ Audit impossible : pas de Spreadsheet configuré");
      return;
    }
    
    var ss = SpreadsheetApp.openById(ssId);
    var sheetAudit = ss.getSheetByName(CONFIG.ONGLETS.AUDIT);
    
    if (!sheetAudit) {
      Logger.log("⚠️ Onglet AUDIT introuvable");
      return;
    }
    
    var timestamp = new Date();
    var utilisateur = Session.getActiveUser().getEmail() || "Système";
    var detailsStr =
      typeof details === "object" ? JSON.stringify(details) : String(details);

    sheetAudit.appendRow([timestamp, action, utilisateur, detailsStr, "✅"]);
  } catch (e) {
    Logger.log("⚠️ Erreur écriture audit : " + e.toString());
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🚀 ORCHESTRATION PRINCIPALE DU SYSTÈME
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Cette fonction est le cœur du système. Elle orchestre toutes les
 * opérations principales : création de formulaires, gestion des triggers,
 * et configuration complète du système.
 */

/**
 * Démarre le système complet et configure tous les éléments
 * Cette fonction principale :
 * 1. Vérifie que la configuration initiale a été faite
 * 2. Crée le formulaire pour la semaine courante
 * 3. Configure tous les triggers automatiques
 * 4. Programme la planification quotidienne des groupes
 *
 * ⚠️ IMPORTANT :
 * Exécutez cette fonction APRÈS CONFIG_INITIALE()
 * Cette fonction configure le système pour fonctionner automatiquement
 *
 * @return {boolean} - true si le démarrage s'est bien passé
 */
function DEMARRER_SYSTEME() {
  Logger.log("═══════════════════════════════════════════════════════");
  Logger.log("🚀 DÉMARRAGE DU SYSTÈME");
  Logger.log("═══════════════════════════════════════════════════════");
  Logger.log("");
  
  // ✅ DÉCLARER LES VARIABLES ICI (avant le try)
  var formId = null;
  var lundiSemaine = null;
  var form = null;
  var infoSemaine = null;
  
  try {
    var props = PropertiesService.getScriptProperties();
    
    // Vérifier configuration
    var ssId = props.getProperty(CONFIG.PROPS.ID_SPREADSHEET);
    if (!ssId) {
      throw new Error(
        "Système non configuré. Exécutez CONFIG_INITIALE() d'abord"
      );
    }
    
    // Déterminer la semaine cible
    // Règle: entre dimanche 09:00 et dimanche suivant 08:59, on ouvre pour la semaine suivante.
    // Sinon, on ouvre pour la semaine en cours.
    var maintenant = new Date();
    var tz = CONFIG.FUSEAU_HORAIRE;
    var jourISO = Utilities.formatDate(maintenant, tz, "u"); // 1=lundi ... 7=dimanche
    var heure24 = parseInt(Utilities.formatDate(maintenant, tz, "H"), 10);

    if (jourISO === "7" && heure24 >= CONFIG.HEURE_CREATION_FORM) {
      // Dimanche après l'heure de création → préparer la semaine suivante
      lundiSemaine = OBTENIR_LUNDI_SEMAINE_(AJOUTER_JOURS_(maintenant, 1));
    } else {
      // Tous les autres cas → semaine en cours
      lundiSemaine = OBTENIR_LUNDI_SEMAINE_(maintenant);
    }
    
    Logger.log(
      "📅 Semaine cible : " +
        Utilities.formatDate(lundiSemaine, CONFIG.FUSEAU_HORAIRE, "dd/MM/yyyy")
    );
    
    // Étape 1: Créer le formulaire
    Logger.log("");
    Logger.log("📝 Étape 1/3 : Création du formulaire de la semaine...");
    form = CREER_FORMULAIRE_SEMAINE_(lundiSemaine); // ✅ Assignation
    formId = form.getId(); // ✅ Assignation
    
    Logger.log("✅ Formulaire créé : " + formId);
    
    // Étape 2: Installer le trigger de soumission
    Logger.log("");
    Logger.log("⚙️ Étape 2/3 : Installation du trigger de soumission...");
    
    // Supprimer les anciens triggers de soumission
    var triggersForm = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggersForm.length; i++) {
      if (
        triggersForm[i].getHandlerFunction() === "TRAITER_REPONSE_FORMULAIRE_"
      ) {
        ScriptApp.deleteTrigger(triggersForm[i]);
        Logger.log("  🗑️ Ancien trigger supprimé");
      }
    }
    
    // Créer le nouveau trigger de soumission
    ScriptApp.newTrigger("TRAITER_REPONSE_FORMULAIRE_")
      .forForm(formId)
      .onFormSubmit()
      .create();
    
    Logger.log("✅ Trigger de soumission installé");
    
    // Étape 3: Installer le trigger hebdomadaire
    Logger.log("");
    Logger.log("⚙️ Étape 3/3 : Installation du trigger hebdomadaire...");
    
    // Supprimer les anciens triggers hebdomadaires
    var triggersHebdo = ScriptApp.getProjectTriggers();
    for (var j = 0; j < triggersHebdo.length; j++) {
      if (
        triggersHebdo[j].getHandlerFunction() ===
        "CREER_FORMULAIRE_HEBDO_"
      ) {
        ScriptApp.deleteTrigger(triggersHebdo[j]);
        Logger.log("  🗑️ Ancien trigger hebdo supprimé");
      }
    }
    
    // Créer le nouveau trigger hebdomadaire (dimanche 9h)
    ScriptApp.newTrigger("CREER_FORMULAIRE_HEBDO_")
      .timeBased()
      .onWeekDay(ScriptApp.WeekDay.SUNDAY)
      .atHour(CONFIG.HEURE_CREATION_FORM)
      .create();
    
    Logger.log(
      "✅ Trigger hebdomadaire installé (Dimanche " +
        CONFIG.HEURE_CREATION_FORM +
        "h)"
    );

    // Trigger quotidien planification groupes à midi
    PROGRAMMER_PLANIFICATION_QUOTIDIENNE_MIDI_();

    // Poller ADMIN toutes les 5 minutes pour cases à cocher
    try {
      var triggersAdmin = ScriptApp.getProjectTriggers();
      for (var k = 0; k < triggersAdmin.length; k++) {
        if (triggersAdmin[k].getHandlerFunction() === "POLLER_BATCH_ADMIN_") {
          ScriptApp.deleteTrigger(triggersAdmin[k]);
        }
      }
      ScriptApp.newTrigger("POLLER_BATCH_ADMIN_")
        .timeBased()
        .everyMinutes(5)
        .create();
      Logger.log("✅ Poller ADMIN installé (toutes les 5 minutes)");
    } catch (e) {
      Logger.log("⚠️ Installation poller ADMIN: " + e.toString());
    }
    
    Logger.log("");
    Logger.log("═══════════════════════════════════════════════════════");
    Logger.log("✅ SYSTÈME DÉMARRÉ AVEC SUCCÈS");
    Logger.log("═══════════════════════════════════════════════════════");
    
    // Calculer les infos de semaine pour l'email
    infoSemaine = CALCULER_SEMAINE_ISO_(lundiSemaine); // ✅ Assignation
    
    // Email HTML de succès
    var htmlBody = GENERER_EMAIL_HEADER_("Système démarré", "🚀");
    
    htmlBody +=
      '<div class="card">' +
      '<h2 class="success">🎉 Le système est maintenant opérationnel !</h2>' +
      "<p>Tous les composants sont actifs et fonctionnels.</p>" +
      "</div>";
    
    htmlBody +=
      '<div class="card">' +
      "<h2>📝 Formulaire créé</h2>" +
      '<div class="info-line">' +
      '<span class="info-label">Titre :</span>' +
      '<span class="info-value">' +
      form.getTitle() +
      "</span>" +
      "</div>" +
      '<div class="info-line">' +
      '<span class="info-label">Semaine :</span>' +
      '<span class="info-value">Semaine ' +
      infoSemaine.semaine +
      " de " +
      infoSemaine.annee +
      "</span>" +
      "</div>" +
      '<div class="info-line">' +
      '<span class="info-label">URL :</span>' +
      '<span class="info-value"><a href="' +
      form.getPublishedUrl() +
      '" class="button">📝 Ouvrir le formulaire</a></span>' +
      "</div>" +
      "</div>";

    htmlBody +=
      '<div class="card">' +
      "<h2>⏰ Triggers installés</h2>" +
      '<div class="creneau-item">🔄 <strong>Dimanche 9h</strong> : Création automatique du formulaire hebdomadaire</div>' +
      '<div class="creneau-item">📥 <strong>À chaque réponse</strong> : Traitement automatique algorithmique et création des événements Calendar quotidiens à 12h</div>' +
      '<div class="creneau-item">🕒 <strong>12h :</strong> Planification des groupes</div>' +
      '<p style="margin-top: 15px; font-size: 14px; color: #666;">Le système fonctionnera désormais automatiquement chaque semaine.</p>' +
      "</div>";

    htmlBody +=
      '<div class="card">' +
      "<h2>✅ Prochaines étapes</h2>" +
      "<ol>" +
      "<li>Partagez le lien du formulaire aux étudiants</li>" +
      "<li>Les inscriptions seront traitées automatiquement</li>" +
      "<li>Les événements Calendar seront créés instantanément</li>" +
      "<li>Vous recevrez des notifications par email</li>" +
      "</ol>" +
      '<p style="margin-top: 20px;">Pour tester le système : <code>TEST_COMPLET()</code></p>' +
      "</div>";
    
    htmlBody += GENERER_EMAIL_FOOTER_();
    
    MailApp.sendEmail({
      to: CONFIG.EMAIL_ADMIN,
      subject: "🚀 Système démarré avec succès",
      htmlBody: htmlBody,
    });
    
    Logger.log("✅ Email de confirmation envoyé");
  } catch (e) {
    Logger.log("❌ ERREUR : " + e.toString());
    Logger.log("Stack : " + e.stack);
    
    // ✅ Email d'erreur (les variables sont maintenant accessibles)
    var htmlBodyError = GENERER_EMAIL_HEADER_("Erreur de démarrage", "❌");
    
    htmlBodyError +=
      '<div class="card">' +
      '<h2 class="error">❌ Erreur lors du démarrage</h2>' +
      '<div class="info-line">' +
      '<span class="info-label">Erreur :</span>' +
      '<span class="info-value error">' +
      e.toString() +
      "</span>" +
      "</div>" +
      '<div class="info-line">' +
      '<span class="info-label">Stack :</span>' +
      '<span class="info-value"><pre style="white-space: pre-wrap; word-wrap: break-word;">' + 
      e.stack +
      "</pre></span>" +
      "</div>";
    
    // Ajouter contexte si disponible
    if (formId) {
      htmlBodyError +=
        '<div class="info-line">' +
        '<span class="info-label">Formulaire ID :</span>' +
        '<span class="info-value">' +
        formId +
        "</span>" +
        "</div>";
    }
    
    if (lundiSemaine) {
      htmlBodyError +=
        '<div class="info-line">' +
        '<span class="info-label">Semaine cible :</span>' +
        '<span class="info-value">' + 
        Utilities.formatDate(
          lundiSemaine,
          CONFIG.FUSEAU_HORAIRE,
          "dd/MM/yyyy"
        ) +
        "</span>" +
        "</div>";
    }

    htmlBodyError += "</div>";

    htmlBodyError +=
      '<div class="card">' +
      "<h2>🔧 Actions recommandées</h2>" +
      "<ol>" +
      "<li>Vérifiez que CONFIG_INITIALE() a bien été exécuté</li>" +
      "<li>Vérifiez les logs pour plus de détails</li>" +
      "<li>Si le problème persiste, exécutez NETTOYER_SYSTEME() puis recommencez</li>" +
      "</ol>" +
      "</div>";
    
    htmlBodyError += GENERER_EMAIL_FOOTER_();
    
    MailApp.sendEmail({
      to: CONFIG.EMAIL_ADMIN,
      subject: "❌ Erreur lors du démarrage du système",
      htmlBody: htmlBodyError,
    });
    
    throw e;
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════
 * ⏰ GESTION DES TRIGGERS
 * ═══════════════════════════════════════════════════════════════════════
 */

/**
 * Installe tous les triggers nécessaires
 */
function INSTALLER_TRIGGERS_() {
  Logger.log("⏰ Installation des triggers...");
  
  try {
    // Supprimer les anciens triggers
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
      ScriptApp.deleteTrigger(triggers[i]);
    }
    Logger.log("✅ Anciens triggers supprimés");
    
    // Trigger hebdomadaire : Dimanche 9h
    ScriptApp.newTrigger("CREER_FORMULAIRE_HEBDO_")
      .timeBased()
      .onWeekDay(ScriptApp.WeekDay.SUNDAY)
      .atHour(CONFIG.HEURE_CREATION_FORM)
      .create();
    Logger.log("✅ Trigger hebdomadaire installé (Dimanche 9h)");
    
    // Trigger formulaire
    INSTALLER_TRIGGER_FORMULAIRE_();
  } catch (e) {
    Logger.log("❌ ERREUR : " + e.toString());
    throw e;
  }
}

/**
 * Installe le trigger sur le formulaire actuel
 */
function INSTALLER_TRIGGER_FORMULAIRE_() {
  try {
    var props = PropertiesService.getScriptProperties();
    var formId = props.getProperty(CONFIG.PROPS.ID_FORM);
    
    if (!formId) {
      Logger.log("⚠️ Aucun formulaire actif");
      return;
    }
    
    var form = FormApp.openById(formId);
    
    ScriptApp.newTrigger("TRAITER_REPONSE_FORMULAIRE_")
      .forForm(form)
      .onFormSubmit()
      .create();
    
    Logger.log("✅ Trigger formulaire installé");
  } catch (e) {
    Logger.log("❌ ERREUR trigger formulaire : " + e.toString());
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 📝 GESTION DES FORMULAIRES GOOGLE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Ces fonctions gèrent la création et la configuration des formulaires
 * Google utilisés pour collecter les inscriptions des étudiants.
 */

/**
 * Crée automatiquement le formulaire pour la semaine suivante
 * Cette fonction est déclenchée chaque dimanche à 9h00 et :
 * 1. Calcule la semaine suivante (lundi au vendredi)
 * 2. Crée un nouveau formulaire Google avec tous les champs
 * 3. Configure les questions pour les matières et créneaux
 * 4. Programme le trigger de traitement des réponses
 * 5. Envoie le lien du formulaire à l'administrateur
 *
 * ⚠️ IMPORTANT :
 * Cette fonction est appelée automatiquement par un trigger
 * Elle crée un formulaire complet avec toutes les questions nécessaires
 *
 * @return {string} - L'ID du formulaire créé
 */
function CREER_FORMULAIRE_HEBDO_() {
  Logger.log("═══════════════════════════════════════════════════════");
  Logger.log("📝 CRÉATION AUTOMATIQUE DU FORMULAIRE HEBDOMADAIRE");
  Logger.log("═══════════════════════════════════════════════════════");
  
  try {
    var maintenant = new Date();
    // Générer le formulaire pour la semaine suivante (dimanche 9h)
    var lundiProchain = OBTENIR_LUNDI_SEMAINE_(AJOUTER_JOURS_(maintenant, 1));
    var formId = CREER_FORMULAIRE_SEMAINE_(lundiProchain);
    
    Logger.log("✅ Formulaire hebdomadaire créé : " + formId);
    
    // Notification admin avec lien du formulaire
    var form = FormApp.openById(formId);
    var infoSemaine = CALCULER_SEMAINE_ISO_(lundiProchain);
    var htmlBody = GENERER_EMAIL_HEADER_("Formulaire hebdo créé", "📝");
    htmlBody +=
      '<div class="card">' +
      '<div class="info-line"><span class="info-label">Semaine :</span><span class="info-value">' + infoSemaine.annee + 'W' + ZERO_PAD_(infoSemaine.semaine) + '</span></div>' +
      '<div class="info-line"><span class="info-label">Titre :</span><span class="info-value">' + form.getTitle() + '</span></div>' +
      '<div class="info-line"><span class="info-label">URL :</span><span class="info-value"><a href="' + form.getPublishedUrl() + '">Ouvrir le formulaire</a></span></div>' +
      '</div>';
    htmlBody += GENERER_EMAIL_FOOTER_();
    MailApp.sendEmail({
      to: CONFIG.EMAIL_ADMIN,
      subject: "📝 Formulaire hebdomadaire disponible",
      htmlBody: htmlBody,
    });
  } catch (e) {
    Logger.log("❌ ERREUR : " + e.toString());
    
    var htmlBody = GENERER_EMAIL_HEADER_("Erreur création formulaire", "❌");
    htmlBody +=
      '<div class="card">' +
      '<h2 class="error">❌ Échec de la création automatique</h2>' +
      "<p>Le formulaire hebdomadaire n'a pas pu être créé automatiquement.</p>" +
      '<div class="info-line">' +
      '<span class="info-label">Erreur :</span>' +
      '<span class="info-value error">' +
      e.toString() +
      "</span>" +
      "</div>" +
      "</div>";
    htmlBody += GENERER_EMAIL_FOOTER_();
    
    MailApp.sendEmail({
      to: CONFIG.EMAIL_ADMIN,
      subject: "❌ Échec création formulaire automatique",
      htmlBody: htmlBody,
    });
  }
}

/**
 * Crée le formulaire pour une semaine donnée
 */
function CREER_FORMULAIRE_SEMAINE_(lundiSemaine) {
  Logger.log(
    "📝 Création du formulaire pour la semaine du " +
      Utilities.formatDate(lundiSemaine, CONFIG.FUSEAU_HORAIRE, "dd/MM/yyyy")
  );
  
  try {
    var props = PropertiesService.getScriptProperties();
    var ssId = props.getProperty(CONFIG.PROPS.ID_SPREADSHEET);
    var ss = SpreadsheetApp.openById(ssId);
    
    // Calculer la semaine ISO
    var infoSemaine = CALCULER_SEMAINE_ISO_(lundiSemaine);
    var numSemaine = infoSemaine.annee + "W" + ZERO_PAD_(infoSemaine.semaine);
    
    var dimancheSemaine = AJOUTER_JOURS_(lundiSemaine, 6);
    var dateDebut = Utilities.formatDate(
      lundiSemaine,
      CONFIG.FUSEAU_HORAIRE,
      "dd/MM"
    );
    var dateFin = Utilities.formatDate(
      dimancheSemaine,
      CONFIG.FUSEAU_HORAIRE,
      "dd/MM/yyyy"
    );

    var titreForm =
      "📝 Inscription Semaine " +
      infoSemaine.semaine +
      " (" +
      dateDebut +
      " - " +
      dateFin +
      ")";
    
    Logger.log("📝 Création : " + titreForm);
    
    // Créer le formulaire
    var form = FormApp.create(titreForm);
    var formId = form.getId();
    
    form.setDescription(
      "Inscris-toi aux créneaux de groupes d'étude de la semaine.\n\n" +
      "⚠️ Une seule réponse par personne et par semaine.\n" +
      "✏️ Tu peux modifier ta réponse jusqu'au dimanche 23h59."
    );
    
    // ✅ CONFIGURATION CORRIGÉE (sans setRequireLogin)
    form.setCollectEmail(true);
    form.setLimitOneResponsePerUser(true);
    form.setAllowResponseEdits(true);
    // Note: setRequireLogin() est déprécié depuis 2023
    form.setShowLinkToRespondAgain(false);
    form.setConfirmationMessage(
      "✅ Inscription enregistrée !\n\n" +
      "Tu recevras un email de confirmation avec tous les détails.\n" +
      "Les événements ont été ajoutés à ton calendrier."
    );
    
    // === SECTION IDENTITÉ ===
    
    form
      .addSectionHeaderItem()
      .setTitle("👤 Identité")
      .setHelpText("Informations obligatoires pour l'inscription");
    
    form.addTextItem().setTitle("Prénom").setRequired(true);
    
    form.addTextItem().setTitle("Nom").setRequired(true);
    
    form
      .addMultipleChoiceItem()
      .setTitle("Niveau")
      .setChoiceValues(["B3", "B3+L"])
      .setRequired(true);
    
    form
      .addMultipleChoiceItem()
      .setTitle("Groupe")
      .setChoiceValues(["L3A", "L3B", "L3C"])
      .setRequired(true);
    
    // === SECTION MATIÈRES ===
    
    form
      .addSectionHeaderItem()
      .setTitle("📚 Matières")
      .setHelpText("Choisis une ou deux matières pour la semaine");
    
    form
      .addMultipleChoiceItem()
      .setTitle("Matière principale")
      .setChoiceValues(CONFIG.MATIERES)
      .setRequired(true);
    
    form
      .addMultipleChoiceItem()
      .setTitle("Type d'activité (Matière principale)")
      .setChoiceValues(["Révisions", "Devoirs"])
      .setRequired(true);
    
    form
      .addMultipleChoiceItem()
      .setTitle("Matière secondaire (optionnelle)")
      .setChoiceValues(["Aucune"].concat(CONFIG.MATIERES))
      .setRequired(false);
    
    form
      .addMultipleChoiceItem()
      .setTitle("Type d'activité (Matière secondaire)")
      .setChoiceValues(["Révisions", "Devoirs"])
      .setRequired(false);
    
    // === SECTION CRÉNEAUX ===
    
    form
      .addSectionHeaderItem()
      .setTitle("📅 Créneaux disponibles")
      .setHelpText("Coche tous les créneaux où tu peux venir");
    
    // Jeudi Campus
    var jeudi = AJOUTER_JOURS_(lundiSemaine, 3);
    var dateJeudi = Utilities.formatDate(jeudi, CONFIG.FUSEAU_HORAIRE, "dd/MM");
    
    form
      .addMultipleChoiceItem()
      .setTitle("🏫 Jeudi " + dateJeudi + " (13h-17h) - Campus")
      .setChoiceValues(["Oui", "Non"])
      .setRequired(true);
    
    // Lundi Discord
    var dateLundi = Utilities.formatDate(
      lundiSemaine,
      CONFIG.FUSEAU_HORAIRE,
      "dd/MM"
    );

    form
      .addMultipleChoiceItem()
      .setTitle("💬 Lundi " + dateLundi + " (16h45-19h) - Discord")
      .setChoiceValues(["Oui", "Non"])
      .setRequired(true);
    
    // Mardi Discord
    var mardi = AJOUTER_JOURS_(lundiSemaine, 1);
    var dateMardi = Utilities.formatDate(mardi, CONFIG.FUSEAU_HORAIRE, "dd/MM");
    
    form
      .addMultipleChoiceItem()
      .setTitle("💬 Mardi " + dateMardi + " (16h45-19h) - Discord")
      .setChoiceValues(["Oui", "Non"])
      .setRequired(true);
    
    // Mercredi Discord
    var mercredi = AJOUTER_JOURS_(lundiSemaine, 2);
    var dateMercredi = Utilities.formatDate(
      mercredi,
      CONFIG.FUSEAU_HORAIRE,
      "dd/MM"
    );

    form
      .addMultipleChoiceItem()
      .setTitle("💬 Mercredi " + dateMercredi + " (16h45-19h) - Discord")
      .setChoiceValues(["Oui", "Non"])
      .setRequired(true);
    
    // Jeudi Discord
    form
      .addMultipleChoiceItem()
      .setTitle("💬 Jeudi " + dateJeudi + " (16h45-19h) - Discord")
      .setChoiceValues(["Oui", "Non"])
      .setRequired(true);
    
    // Vendredi Discord
    var vendredi = AJOUTER_JOURS_(lundiSemaine, 4);
    var dateVendredi = Utilities.formatDate(
      vendredi,
      CONFIG.FUSEAU_HORAIRE,
      "dd/MM"
    );

    form
      .addMultipleChoiceItem()
      .setTitle("💬 Vendredi " + dateVendredi + " (16h45-19h) - Discord")
      .setChoiceValues(["Oui", "Non"])
      .setRequired(true);
    
    // === LIER AU SPREADSHEET (MÉTHODE CORRIGÉE) ===
    
    // Créer le trigger de soumission manuellement
    ScriptApp.newTrigger("TRAITER_REPONSE_FORMULAIRE_")
      .forForm(form)
      .onFormSubmit()
      .create();
    
    Logger.log("✅ Trigger de soumission créé");
    
    // === SAUVEGARDER LES IDs ===
    
     // À la fin, RETOURNER L'OBJET FORM, PAS JUSTE L'ID
    props.setProperty(CONFIG.PROPS.ID_FORM, formId);
    props.setProperty(CONFIG.PROPS.SEMAINE_FORM, numSemaine);
    
    Logger.log("✅ Formulaire créé : " + formId);
    Logger.log("✅ URL : " + form.getPublishedUrl());

    // Audit
    ECRIRE_AUDIT_("FORMULAIRE_CREE", {
      semaine: numSemaine,
      formId: formId,
      url: form.getPublishedUrl(),
    });

    return form; // ✅ Retourner l'objet, pas l'ID
  } catch (e) {
    Logger.log("❌ ERREUR création formulaire : " + e.toString());
    throw e;
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 📥 TRAITEMENT DES RÉPONSES
 * ═══════════════════════════════════════════════════════════════════════
 */

/**
 * Traite une nouvelle réponse au formulaire
 */
function TRAITER_REPONSE_FORMULAIRE_(e) {
  Logger.log("═══════════════════════════════════════════════════════");
  Logger.log("📥 TRAITEMENT D'UNE NOUVELLE RÉPONSE");
  Logger.log("═══════════════════════════════════════════════════════");
  
  try {
    var props = PropertiesService.getScriptProperties();
    var ssId = props.getProperty(CONFIG.PROPS.ID_SPREADSHEET);
    var calId = props.getProperty(CONFIG.PROPS.ID_CALENDAR);
    var numSemaine = props.getProperty(CONFIG.PROPS.SEMAINE_FORM);
    
    var ss = SpreadsheetApp.openById(ssId);
    var cal = CalendarApp.getCalendarById(calId);
    var sheetReponses = ss.getSheetByName(CONFIG.ONGLETS.REPONSES);
    
    // Récupérer les données de la réponse
    var response = e.response;
    var itemResponses = response.getItemResponses();
    var email = response.getRespondentEmail();
    var timestamp = new Date();
    
    Logger.log("📧 Email : " + email);
    Logger.log("⏰ Timestamp : " + timestamp);
    
    // Extraire les données de la réponse (structure: Prénom, Nom, Niveau, Groupe, ...)
    var items = itemResponses;
    
    var prenom = items[0].getResponse();
    var nom = items[1].getResponse();
    var niveau = items[2].getResponse();
    var groupe = items[3].getResponse();
    
    // MATIÈRE 1
    var matiere1 = items[4].getResponse();
    var type1 = items[5].getResponse();
    var accompagnement1 = items[6].getResponse();
    
    // MATIÈRE 2
    var matiere2 = items[7].getResponse();
    var type2 = items[8] ? items[8].getResponse() : "";
    var accompagnement2 = items[9] ? items[9].getResponse() : "";
    
    // MATIÈRE 3
    var matiere3 = items[10].getResponse();
    var type3 = items[11] ? items[11].getResponse() : "";
    var accompagnement3 = items[12] ? items[12].getResponse() : "";
    
    // MATIÈRE 4
    var matiere4 = items[13].getResponse();
    var type4 = items[14] ? items[14].getResponse() : "";
    var accompagnement4 = items[15] ? items[15].getResponse() : "";
    
    // CRÉNEAUX
    var jeudiCampus = items[16].getResponse();
    var lundiDiscord = items[17].getResponse();
    var mardiDiscord = items[18].getResponse();
    var mercrediDiscord = items[19].getResponse();
    var jeudiDiscord = items[20].getResponse();
    var vendrediDiscord = items[21].getResponse();
    // COMMENTAIRE
    var commentaire = items[22] ? items[22].getResponse() : "";

    // Regrouper les réponses créneaux pour simplifier l'accès plus loin.
    var creneaux = {
      jeudiCampus: jeudiCampus,
      lundiDiscord: lundiDiscord,
      mardiDiscord: mardiDiscord,
      mercrediDiscord: mercrediDiscord,
      jeudiDiscord: jeudiDiscord,
      vendrediDiscord: vendrediDiscord,
    };

    Logger.log(
      "👤 " + prenom + " " + nom + " (" + niveau + " - " + groupe + ")"
    );
    Logger.log("📚 Matière 1 : " + matiere1 + " [" + type1 + "]");
    if (matiere2 && matiere2.indexOf("Aucune") === -1) {
      Logger.log("📚 Matière 2 : " + matiere2 + " [" + type2 + "]");
    }
    
    // === GESTION DU MODE REPLACE ===
    
    var data = sheetReponses.getDataRange().getValues();
    var ligneExistante = -1;
    var modeReplace = false;
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][1] === email) {
        ligneExistante = i + 1;
        modeReplace = true;
        break;
      }
    }
    
    if (modeReplace) {
      Logger.log(
        "🔄 REPLACE MODE : Ancienne réponse trouvée ligne " + ligneExistante
      );
      
      // Supprimer les anciens événements
      SUPPRIMER_EVENTS_UTILISATEUR_(cal, email, numSemaine);
      
      // Supprimer l'ancienne ligne
      sheetReponses.deleteRow(ligneExistante);
      
      Logger.log("✅ Ancienne réponse supprimée");
    }
    
    // === ENREGISTRER LA RÉPONSE DANS LE SPREADSHEET ===
    // Construire exactement 25 éléments dans l'ordre des HEADERS_REPONSES
    var rowValues = [
      timestamp, // 1. Horodateur
      email, // 2. Adresse e-mail
      prenom, // 3. Prénom
      nom, // 4. Nom
      niveau, // 5. Niveau
      groupe, // 6. Groupe
      matiere1, // 7. Matière 1
      type1, // 8. Type 1
      accompagnement1, // 9. Accompagnement 1
      matiere2, // 10. Matière 2
      type2, // 11. Type 2
      accompagnement2, // 12. Accompagnement 2
      matiere3, // 13. Matière 3
      type3, // 14. Type 3
      accompagnement3, // 15. Accompagnement 3
      matiere4, // 16. Matière 4
      type4, // 17. Type 4
      accompagnement4, // 18. Accompagnement 4
      jeudiCampus, // 19. Jeudi Campus
      lundiDiscord, // 20. Lundi Discord
      mardiDiscord, // 21. Mardi Discord
      mercrediDiscord, // 22. Mercredi Discord
      jeudiDiscord, // 23. Jeudi Discord
      vendrediDiscord, // 24. Vendredi Discord
      commentaire, // 25. Commentaire (optionnel)
    ];

    sheetReponses.appendRow(rowValues);

    var eventsCreed = []; // plus de création immédiate

    // Plus de création d\'événements ici

    Logger.log("ℹ️ Réponse enregistrée sans création immédiate d'événements");

    // === CONSTRUIRE LA LISTE DES CRÉNEAUX CHOISIS ===
    var creneauxChoisis = [];
    if (jeudiCampus === "Oui") {
      creneauxChoisis.push("Jeudi après-midi (Campus) - 13h-17h");
    }
    if (lundiDiscord === "Oui") {
      creneauxChoisis.push("Lundi soir (Discord) - 16h45-19h");
    }
    if (mardiDiscord === "Oui") {
      creneauxChoisis.push("Mardi soir (Discord) - 16h45-19h");
    }
    if (mercrediDiscord === "Oui") {
      creneauxChoisis.push("Mercredi soir (Discord) - 16h45-19h");
    }
    if (jeudiDiscord === "Oui") {
      creneauxChoisis.push("Jeudi soir (Discord) - 16h45-19h");
    }
    if (vendrediDiscord === "Oui") {
      creneauxChoisis.push("Vendredi soir (Discord) - 16h45-19h");
    }
    
    // === ENVOI EMAIL ÉTUDIANT (désactivable) ===
    if (CONFIG.ENVOI_CONFIRMATION_ETUDIANT) {
    ENVOYER_EMAIL_CONFIRMATION_(
      email,
      prenom,
      nom,
      niveau,
      groupe,
      matiere1,
      type1,
      matiere2,
      type2,
        matiere3,
        type3,
        matiere4,
        type4,
        creneauxChoisis,
      modeReplace,
      numSemaine
    );
    }
    
    // === NOTIFIER L'ADMIN ===
    
    NOTIFIER_ADMIN_NOUVELLE_INSCRIPTION_(
      email,
      prenom,
      nom,
      niveau,
      groupe,
      matiere1,
      type1,
      matiere2,
      type2,
      matiere3,
      type3,
      matiere4,
      type4,
      creneauxChoisis,
      modeReplace
    );
    
    // === AUDIT ===
    
    ECRIRE_AUDIT_(
      modeReplace ? "INSCRIPTION_MODIFIEE" : "NOUVELLE_INSCRIPTION",
      {
      email: email,
        nom: prenom + " " + nom,
      niveau: niveau,
      groupe: groupe,
      matiere1: matiere1,
      type1: type1,
      matiere2: matiere2,
      type2: type2,
      nbCreneaux: eventsCreed.length,
        semaine: numSemaine,
      }
    );
    
    Logger.log("═══════════════════════════════════════════════════════");
    Logger.log("✅ RÉPONSE TRAITÉE AVEC SUCCÈS");
    Logger.log("═══════════════════════════════════════════════════════");
  } catch (e) {
    Logger.log("❌ ERREUR : " + e.toString());
    Logger.log("Stack : " + e.stack);
    
    ECRIRE_AUDIT_("ERREUR_TRAITEMENT", {
      erreur: e.toString(),
      stack: e.stack,
    });
    
    var htmlBody = GENERER_EMAIL_HEADER_("Erreur traitement réponse", "❌");
    htmlBody +=
      '<div class="card">' +
      '<h2 class="error">❌ Erreur lors du traitement</h2>' +
      '<div class="info-line">' +
      '<span class="info-label">Erreur :</span>' +
      '<span class="info-value error">' +
      e.toString() +
      "</span>" +
      "</div>" +
      '<div class="info-line">' +
      '<span class="info-label">Stack :</span>' +
      '<span class="info-value"><pre>' +
      e.stack +
      "</pre></span>" +
      "</div>" +
      "</div>";
    htmlBody += GENERER_EMAIL_FOOTER_();
    
    MailApp.sendEmail({
      to: CONFIG.EMAIL_ADMIN,
      subject: "❌ Erreur traitement réponse",
      htmlBody: htmlBody,
    });
    
    throw e;
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 📅 GESTION DES ÉVÉNEMENTS CALENDAR
 * ═══════════════════════════════════════════════════════════════════════
 */

/**
 * Crée un événement Calendar pour un créneau
 */
function CREER_EVENT_CRENEAU_(
  calendar,
  creneau,
  lundiSemaine,
  matiere,
  type,
  nomParticipant,
  emailParticipant,
  description,
  couleur
) {
  try {
    var jourSemaine = AJOUTER_JOURS_(lundiSemaine, creneau.jour - 1);
    
    var heureDebut = Math.floor(creneau.debut);
    var minuteDebut = Math.round((creneau.debut - heureDebut) * 60);
    
    var heureFin = Math.floor(creneau.fin);
    var minuteFin = Math.round((creneau.fin - heureFin) * 60);
    
    var dateDebut = new Date(jourSemaine);
    dateDebut.setHours(heureDebut, minuteDebut, 0, 0);
    
    var dateFin = new Date(jourSemaine);
    dateFin.setHours(heureFin, minuteFin, 0, 0);
    
    var titre = "📚 " + matiere + " [" + type + "] - " + creneau.lieu;
    
    var descriptionComplete =
      description +
      "\n\n" +
      "📍 LIEU : " +
      creneau.lieu +
      "\n" +
      "⏰ HORAIRE : " +
      Utilities.formatDate(dateDebut, CONFIG.FUSEAU_HORAIRE, "HH:mm") +
      " - " +
      Utilities.formatDate(dateFin, CONFIG.FUSEAU_HORAIRE, "HH:mm");
    
    var event = calendar.createEvent(titre, dateDebut, dateFin, {
      description: descriptionComplete,
      location: creneau.lieu,
      guests: emailParticipant,
      sendInvites: true,
    });
    
    event.setColor(couleur);
    event.setTag("EMAIL_PARTICIPANT", emailParticipant);
    event.setTag("MATIERE", matiere);
    event.setTag("TYPE", type);
    
    Logger.log("  ✅ Event créé : " + titre);
    
    return event;
  } catch (e) {
    Logger.log("  ❌ ERREUR création event : " + e.toString());
    return null;
  }
}

/**
 * Supprime tous les événements d'un utilisateur pour une semaine
 */
function SUPPRIMER_EVENTS_UTILISATEUR_(calendar, email, numSemaine) {
  try {
    var lundiSemaine = OBTENIR_LUNDI_SEMAINE_DEPUIS_NUMERO_(numSemaine);
    var dimancheSemaine = AJOUTER_JOURS_(lundiSemaine, 6);
    
    var events = calendar.getEvents(lundiSemaine, dimancheSemaine);
    var nbSupprimes = 0;
    
    for (var i = 0; i < events.length; i++) {
      var event = events[i];
      var desc = event.getDescription() || "";
      if (
        desc.indexOf("Email : " + email) !== -1 &&
        desc.indexOf("Semaine : " + numSemaine) !== -1
      ) {
        event.deleteEvent();
        nbSupprimes++;
      }
    }
    
    Logger.log("  🗑️ " + nbSupprimes + " ancien(s) événement(s) supprimé(s)");
  } catch (e) {
    Logger.log("  ⚠️ Erreur suppression events : " + e.toString());
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 📧 EMAILS DE CONFIRMATION
 * ═══════════════════════════════════════════════════════════════════════
 */

/**
 * Envoie un email de confirmation à l'étudiant
 */
function ENVOYER_EMAIL_CONFIRMATION_(
  email,
  prenom,
  nom,
  niveau,
  groupe,
  matiere1,
  type1,
  matiere2,
  type2,
  matiere3,
  type3,
  matiere4,
  type4,
  creneauxChoisis,
  modeReplace,
  numSemaine
) {
  try {
    // Vérifier le quota avant d'envoyer
    var quota = MailApp.getRemainingDailyQuota();
    if (quota < 1) {
      Logger.log(
        "⚠️ Quota d'emails épuisé - Email de confirmation non envoyé à " + email
      );
      return;
    }
    var action = modeReplace ? "modifiée" : "enregistrée";
    var emoji = modeReplace ? "🔄" : "✅";
    
    var htmlBody = GENERER_EMAIL_HEADER_("Inscription " + action, emoji);
    
    // Card de confirmation
    htmlBody +=
      '<div class="card">' +
      "<h2>" +
      emoji +
      " Inscription " +
      action +
      " !</h2>" +
      '<p style="font-size: 16px;">Bonjour <strong>' +
      prenom +
      " " +
      nom +
      "</strong>,</p>" +
      "<p>Ton inscription pour la semaine <strong>" +
      numSemaine +
      "</strong> a bien été " +
      action +
      ".</p>" +
      "</div>";
    
    // Card informations personnelles
    htmlBody +=
      '<div class="card">' +
      "<h2>👤 Tes informations</h2>" +
      '<div class="info-line">' +
      '<span class="info-label">Nom complet :</span>' +
      '<span class="info-value">' +
      prenom +
      " " +
      nom +
      "</span>" +
      "</div>" +
      '<div class="info-line">' +
      '<span class="info-label">Niveau :</span>' +
      '<span class="info-value">' +
      niveau +
      "</span>" +
      "</div>" +
      '<div class="info-line">' +
      '<span class="info-label">Groupe :</span>' +
      '<span class="info-value">' +
      groupe +
      "</span>" +
      "</div>" +
      "</div>";

    // Card matières - Afficher toutes les 4 matières
    htmlBody +=
      '<div class="card">' +
      "<h2>📚 Tes matières</h2>" +
      '<div class="matiere-item">' +
      "<strong>Matière 1 :</strong> " +
      matiere1 +
      ' <span style="color: #667eea;">[' +
      type1 +
      "]</span>" +
      "</div>";
    
    if (matiere2 && matiere2.indexOf("Aucune") === -1) {
      htmlBody +=
        '<div class="matiere-item">' +
        "<strong>Matière 2 :</strong> " +
        matiere2 +
        ' <span style="color: #667eea;">[' +
        type2 +
        "]</span>" +
        "</div>";
    }

    if (matiere3 && matiere3.indexOf("Aucune") === -1) {
      htmlBody +=
        '<div class="matiere-item">' +
        "<strong>Matière 3 :</strong> " +
        matiere3 +
        ' <span style="color: #667eea;">[' +
        type3 +
        "]</span>" +
        "</div>";
    }

    if (matiere4 && matiere4.indexOf("Aucune") === -1) {
      htmlBody +=
        '<div class="matiere-item">' +
        "<strong>Matière 4 :</strong> " +
        matiere4 +
        ' <span style="color: #667eea;">[' +
        type4 +
        "]</span>" +
        "</div>";
    }

    htmlBody += "</div>";
    
    // Card créneaux
    htmlBody +=
      '<div class="card">' +
      "<h2>📅 Tes créneaux (" +
      creneauxChoisis.length +
      ")</h2>";

    if (creneauxChoisis.length > 0) {
      htmlBody += "<p>Créneaux sélectionnés :</p>";
      creneauxChoisis.forEach(function (cr) {
        htmlBody += '<div class="creneau-item">' + cr + "</div>";
      });
      htmlBody +=
        '<p style="margin-top: 20px; color: #27ae60;"><strong>✅ Inscription enregistrée !</strong></p>' +
        '<p style="font-size: 14px; color: #666;">Les groupes seront formés automatiquement chaque jour à 12h00.</p>';
    } else {
      htmlBody +=
        '<p style="color: #e67e22;">⚠️ Aucun créneau sélectionné.</p>';
    }
    
    htmlBody += "</div>";
    
    // Card informations pratiques
    htmlBody +=
      '<div class="card">' +
      "<h2>💡 Informations pratiques</h2>" +
      '<ul style="line-height: 1.8;">' +
      "<li><strong>Pour modifier</strong> ton inscription : renvoie le formulaire avec la même adresse email</li>" +
      "<li><strong>Lieu campus :</strong> Vérifier l'événement Calendar pour les détails</li>" +
      "<li><strong>Discord :</strong> Le lien sera partagé avant chaque session</li>" +
      "<li><strong>Questions :</strong> Contacte " +
      CONFIG.EMAIL_ADMIN +
      "</li>" +
      "</ul>" +
      '<div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #007bff; border-radius: 4px;">' +
      "<h3 style='margin-top: 0; color: #007bff;'>📋 Règles de bonne conduite</h3>" +
      '<ul style="line-height: 1.6; margin-bottom: 0;">' +
      "<li>Arrive à l'heure et préviens en cas d'absence</li>" +
      "<li>Participe activement et respecte les autres membres</li>" +
      "<li>Prépare tes questions et documents à l'avance</li>" +
      "<li>Respecte les créneaux horaires (pas de dépassement)</li>" +
      "<li>Utilise Discord de manière appropriée</li>" +
      "</ul>" +
      "</div>" +
      "</div>";
    
    htmlBody += GENERER_EMAIL_FOOTER_();
    
    MailApp.sendEmail({
      to: email,
      subject: emoji + " Inscription " + action + " - Semaine " + numSemaine,
      htmlBody: htmlBody,
    });
    
    Logger.log("  ✅ Email de confirmation envoyé à " + email);
  } catch (e) {
    Logger.log("  ⚠️ Erreur envoi email confirmation : " + e.toString());
  }
}

/**
 * Notifie l'admin d'une nouvelle inscription
 */
function NOTIFIER_ADMIN_NOUVELLE_INSCRIPTION_(
  email,
  prenom,
  nom,
  niveau,
  groupe,
  matiere1,
  type1,
  matiere2,
  type2,
  matiere3,
  type3,
  matiere4,
  type4,
  creneauxChoisis,
  modeReplace
) {
  try {
    var action = modeReplace ? "modifiée" : "nouvelle";
    var emoji = modeReplace ? "🔄" : "🆕";
    
    var htmlBody = GENERER_EMAIL_HEADER_("Inscription " + action, emoji);
    
    htmlBody +=
      '<div class="card">' +
      "<h2>" +
      emoji +
      " Inscription " +
      action +
      "</h2>" +
      "<p>Un étudiant vient de " +
      (modeReplace ? "modifier" : "soumettre") +
      " son inscription.</p>" +
      "</div>";

    htmlBody +=
      '<div class="card">' +
      "<h2>👤 Étudiant</h2>" +
      '<div class="info-line">' +
      '<span class="info-label">Nom :</span>' +
      '<span class="info-value">' +
      prenom +
      " " +
      nom +
      "</span>" +
      "</div>" +
      '<div class="info-line">' +
      '<span class="info-label">Email :</span>' +
      '<span class="info-value">' +
      email +
      "</span>" +
      "</div>" +
      '<div class="info-line">' +
      '<span class="info-label">Niveau :</span>' +
      '<span class="info-value">' +
      niveau +
      "</span>" +
      "</div>" +
      '<div class="info-line">' +
      '<span class="info-label">Groupe :</span>' +
      '<span class="info-value">' +
      groupe +
      "</span>" +
      "</div>" +
      "</div>";

    htmlBody +=
      '<div class="card">' +
      "<h2>📚 Matières</h2>" +
      '<div class="matiere-item">' +
      "<strong>Matière 1 :</strong> " +
      matiere1 +
      " [" +
      type1 +
      "]" +
      "</div>";
    
    if (matiere2 && matiere2.indexOf("Aucune") === -1) {
      htmlBody +=
        '<div class="matiere-item">' +
        "<strong>Matière 2 :</strong> " +
        matiere2 +
        " [" +
        type2 +
        "]" +
        "</div>";
    }

    if (matiere3 && matiere3.indexOf("Aucune") === -1) {
      htmlBody +=
        '<div class="matiere-item">' +
        "<strong>Matière 3 :</strong> " +
        matiere3 +
        " [" +
        type3 +
        "]" +
        "</div>";
    }

    if (matiere4 && matiere4.indexOf("Aucune") === -1) {
      htmlBody +=
        '<div class="matiere-item">' +
        "<strong>Matière 4 :</strong> " +
        matiere4 +
        " [" +
        type4 +
        "]" +
        "</div>";
    }

    htmlBody += "</div>";

    htmlBody +=
      '<div class="card">' +
      "<h2>📅 Créneaux (" +
      creneauxChoisis.length +
      ")</h2>";

    if (creneauxChoisis.length > 0) {
      creneauxChoisis.forEach(function (cr) {
        htmlBody += '<div class="creneau-item">' + cr + "</div>";
      });
    } else {
      htmlBody +=
        '<p style="color: #e67e22;">⚠️ Aucun créneau sélectionné.</p>';
    }

    htmlBody += "</div>";
    
    htmlBody += GENERER_EMAIL_FOOTER_();
    
    MailApp.sendEmail({
      to: CONFIG.EMAIL_ADMIN,
      subject: emoji + " Inscription " + action + " - " + prenom + " " + nom,
      htmlBody: htmlBody,
    });
    
    Logger.log("  ✅ Admin notifié");
  } catch (e) {
    Logger.log("  ⚠️ Erreur notification admin : " + e.toString());
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🧪 TESTS ET DIAGNOSTICS
 * ═══════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🧪 FONCTIONS DE TEST ET DIAGNOSTIC
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Ces fonctions permettent de tester et diagnostiquer le système
 * pour s'assurer que tout fonctionne correctement.
 */

/**
 * Teste tous les composants du système
 * Cette fonction de test complète vérifie :
 * 1. La configuration du système (spreadsheet, calendrier)
 * 2. La création de formulaires
 * 3. L'envoi d'emails
 * 4. La formation de groupes
 * 5. La gestion des triggers
 *
 * ⚠️ IMPORTANT :
 * Exécutez cette fonction APRÈS CONFIG_INITIALE() et DEMARRER_SYSTEME()
 * Elle vous dira si tout fonctionne correctement
 *
 * @return {Object} - Résultats des tests avec statistiques
 */
function TEST_COMPLET() {
  Logger.log("═══════════════════════════════════════════════════════");
  Logger.log("🧪 TEST COMPLET DU SYSTÈME");
  Logger.log("═══════════════════════════════════════════════════════");
  
  var resultats = [];
  var nbTests = 0;
  var nbReussis = 0;
  var props = PropertiesService.getScriptProperties();
  
  // Test 1: Properties
  Logger.log("\n🔑 Test 1/6 : Properties...");
  nbTests++;
  var ssId = props.getProperty(CONFIG.PROPS.ID_SPREADSHEET);
  var calId = props.getProperty(CONFIG.PROPS.ID_CALENDAR);
  var version = props.getProperty(CONFIG.PROPS.VERSION);
  
  if (ssId && calId && version) {
    resultats.push("✅ Test 1 : Properties OK");
    Logger.log("  ✅ Spreadsheet ID : " + ssId);
    Logger.log("  ✅ Calendar ID : " + calId);
    Logger.log("  ✅ Version : " + version);
    nbReussis++;
  } else {
    resultats.push("❌ Test 1 : Properties manquantes");
    Logger.log("  ❌ Exécutez CONFIG_INITIALE()");
  }
  
  // Test 2: Spreadsheet
  Logger.log("\n📊 Test 2/6 : Spreadsheet...");
  nbTests++;
  if (ssId) {
    try {
      var ss = SpreadsheetApp.openById(ssId);
      var onglets = [
        CONFIG.ONGLETS.REPONSES,
        CONFIG.ONGLETS.CRENEAUX,
        CONFIG.ONGLETS.AUDIT,
        CONFIG.ONGLETS.CONFIG,
        CONFIG.ONGLETS.ARCHIVE,
      ];
      
      var tousOK = true;
      for (var i = 0; i < onglets.length; i++) {
        var sheet = ss.getSheetByName(onglets[i]);
        if (!sheet) {
          tousOK = false;
          Logger.log("  ❌ Onglet manquant : " + onglets[i]);
        }
      }
      
      if (tousOK) {
        resultats.push("✅ Test 2 : Spreadsheet OK (5 onglets)");
        Logger.log("  ✅ Tous les onglets présents");
        Logger.log("  ✅ URL : " + ss.getUrl());
        nbReussis++;
      } else {
        resultats.push("⚠️ Test 2 : Spreadsheet incomplet");
      }
    } catch (e) {
      resultats.push("❌ Test 2 : Spreadsheet inaccessible");
      Logger.log("  ❌ Erreur : " + e.toString());
    }
  } else {
    resultats.push("❌ Test 2 : Pas de Spreadsheet");
  }
  
  // Test 3: Calendar
  Logger.log("\n📅 Test 3/6 : Calendar...");
  nbTests++;
  if (calId) {
    try {
      var cal = CalendarApp.getCalendarById(calId);
      resultats.push("✅ Test 3 : Calendar OK");
      Logger.log("  ✅ Nom : " + cal.getName());
      Logger.log("  ✅ Fuseau : " + cal.getTimeZone());
      nbReussis++;
    } catch (e) {
      resultats.push("❌ Test 3 : Calendar inaccessible");
      Logger.log("  ❌ Erreur : " + e.toString());
    }
  } else {
    resultats.push("❌ Test 3 : Pas de Calendar");
  }
  
  // Test 4: Triggers
  Logger.log("\n⏰ Test 4/6 : Triggers...");
  nbTests++;
  var triggers = ScriptApp.getProjectTriggers();
  if (triggers.length > 0) {
    resultats.push("✅ Test 4 : " + triggers.length + " trigger(s) actif(s)");
    Logger.log("  ✅ Nombre de triggers : " + triggers.length);
    for (var i = 0; i < triggers.length; i++) {
      Logger.log("    • " + triggers[i].getHandlerFunction());
    }
    nbReussis++;
  } else {
    resultats.push("⚠️ Test 4 : Aucun trigger installé");
    Logger.log("  ⚠️ Exécutez DEMARRER_SYSTEME()");
  }
  
  // Test 5: Email
  Logger.log("\n📧 Test 5/6 : Configuration email...");
  nbTests++;
  if (CONFIG.EMAIL_ADMIN && CONFIG.EMAIL_ADMIN !== "votre.email@exemple.com") {
    resultats.push("✅ Test 5 : Email admin configuré");
    Logger.log("  ✅ Email : " + CONFIG.EMAIL_ADMIN);
    nbReussis++;
  } else {
    resultats.push("❌ Test 5 : Email admin non configuré");
    Logger.log("  ❌ Modifiez CONFIG.EMAIL_ADMIN");
  }
  
  // Test 6: Formulaire
  Logger.log("\n📋 Test 6/6 : Formulaire actuel...");
  nbTests++;
  var formId = props.getProperty(CONFIG.PROPS.ID_FORM);
  var semaine = props.getProperty(CONFIG.PROPS.SEMAINE_FORM);
  
  if (formId && semaine) {
    try {
      var form = FormApp.openById(formId);
      resultats.push("✅ Test 6 : Formulaire actif (Semaine " + semaine + ")");
      Logger.log("  ✅ Titre : " + form.getTitle());
      Logger.log("  ✅ Semaine : " + semaine);
      Logger.log("  ✅ URL : " + form.getPublishedUrl());
      nbReussis++;
    } catch (e) {
      resultats.push("❌ Test 6 : Formulaire inaccessible");
      Logger.log("  ❌ Erreur : " + e.toString());
    }
  } else {
    resultats.push("⚠️ Test 6 : Aucun formulaire actif");
    Logger.log("  ⚠️ Exécutez DEMARRER_SYSTEME()");
  }
  
  // Résumé
  Logger.log("\n═══════════════════════════════════════════════════════");
  Logger.log("📊 RÉSUMÉ : " + nbReussis + "/" + nbTests + " tests réussis");
  Logger.log("═══════════════════════════════════════════════════════");
  
  var score = Math.round((nbReussis / nbTests) * 100);
  var statut = "";
  var couleurStatut = "";
  
  if (score === 100) {
    statut = "✅ Système 100% opérationnel !";
    couleurStatut = "#27ae60";
  } else if (score >= 80) {
    statut = "⚠️ Système opérationnel avec alertes mineures";
    couleurStatut = "#f39c12";
  } else {
    statut = "❌ Système nécessite une attention urgente";
    couleurStatut = "#e74c3c";
  }
  
  // Email HTML soigné
  var htmlBody = GENERER_EMAIL_HEADER_("Résultats des tests", "🧪");
  
  htmlBody +=
    '<div class="card">' +
    "<h2>📊 Score global</h2>" +
    '<div style="text-align: center; padding: 20px;">' +
    '<div style="font-size: 48px; font-weight: bold; color: ' +
    couleurStatut +
    ';">' +
    score +
    "%</div>" +
    '<div style="font-size: 18px; color: ' +
    couleurStatut +
    '; margin-top: 10px;">' +
    statut +
    "</div>" +
    '<div style="margin-top: 15px; color: #666;">' +
    nbReussis +
    " / " +
    nbTests +
    " tests réussis</div>" +
    "</div>" +
    "</div>";

  htmlBody += '<div class="card">' + "<h2>📋 Détails des tests</h2>";
  
  for (var i = 0; i < resultats.length; i++) {
    var ligne = resultats[i];
    var classe = "";
    if (ligne.indexOf("✅") !== -1) classe = "success";
    else if (ligne.indexOf("⚠️") !== -1) classe = "warning";
    else if (ligne.indexOf("❌") !== -1) classe = "error";
    
    htmlBody +=
      '<div class="info-line"><span class="' +
      classe +
      '">' +
      ligne +
      "</span></div>";
  }

  htmlBody += "</div>";
  
  if (nbReussis < nbTests) {
    htmlBody +=
      '<div class="card">' + "<h2>🔧 Actions recommandées</h2>" + "<ul>";
    
    if (resultats[0].indexOf("❌") !== -1) {
      htmlBody += "<li>Exécuter <code>CONFIG_INITIALE()</code></li>";
    }
    if (
      resultats[3].indexOf("⚠️") !== -1 ||
      resultats[5].indexOf("⚠️") !== -1
    ) {
      htmlBody += "<li>Exécuter <code>DEMARRER_SYSTEME()</code></li>";
    }
    if (resultats[4].indexOf("❌") !== -1) {
      htmlBody +=
        "<li>Modifier <code>CONFIG.EMAIL_ADMIN</code> dans le code</li>";
    }
    
    htmlBody += "</ul></div>";
  }
  
  htmlBody += GENERER_EMAIL_FOOTER_();
  
  MailApp.sendEmail({
    to: CONFIG.EMAIL_ADMIN,
    subject: "🧪 Résultats des tests système - Score: " + score + "%",
    htmlBody: htmlBody,
  });
  
  Logger.log("✅ Rapport envoyé par email");
  
  return nbReussis === nbTests;
}

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🛠️ FONCTIONS UTILITAIRES
 * ═══════════════════════════════════════════════════════════════════════
 */

/**
 * Calcule la semaine ISO d'une date
 */
function CALCULER_SEMAINE_ISO_(date) {
  var d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  
  var premierJanvier = new Date(d.getFullYear(), 0, 1);
  var numeroSemaine = Math.ceil(((d - premierJanvier) / 86400000 + 1) / 7);
  
  return {
    annee: d.getFullYear(),
    semaine: numeroSemaine,
  };
}

/**
 * Ajoute des jours à une date
 */
function AJOUTER_JOURS_(date, jours) {
  var resultat = new Date(date);
  resultat.setDate(resultat.getDate() + jours);
  return resultat;
}

/**
 * Convertit un numéro de semaine ISO en date du lundi
 */
function OBTENIR_LUNDI_SEMAINE_DEPUIS_NUMERO_(numSemaine) {
  var parts = numSemaine.match(/(\d{4})W(\d{1,2})/);
  if (!parts) {
    throw new Error("Format de semaine invalide : " + numSemaine);
  }
  
  var annee = parseInt(parts[1], 10);
  var semaine = parseInt(parts[2], 10);
  
  var premierJanvier = new Date(annee, 0, 1);
  var premierJeudi = new Date(annee, 0, 1);
  var jour = premierJanvier.getDay();
  
  if (jour <= 4) {
    premierJeudi.setDate(premierJanvier.getDate() + (4 - jour));
  } else {
    premierJeudi.setDate(premierJanvier.getDate() + (11 - jour));
  }
  
  var lundiSemaine1 = new Date(premierJeudi);
  lundiSemaine1.setDate(premierJeudi.getDate() - 3);
  
  var lundiCible = new Date(lundiSemaine1);
  lundiCible.setDate(lundiSemaine1.getDate() + (semaine - 1) * 7);
  
  return lundiCible;
}

/**
 * Formate un nombre avec un zéro devant si < 10
 */
function ZERO_PAD_(num) {
  return num < 10 ? "0" + num : "" + num;
}

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🧹 NETTOYAGE ET MAINTENANCE
 * ═══════════════════════════════════════════════════════════════════════
 */

/**
 * Nettoie complètement le système (ATTENTION: DESTRUCTIF)
 */
function NETTOYER_SYSTEME() {
  Logger.log("═══════════════════════════════════════════════════════");
  Logger.log("🧹 NETTOYAGE COMPLET DU SYSTÈME");
  Logger.log("═══════════════════════════════════════════════════════");
  Logger.log("⚠️ ATTENTION : Cette opération est DESTRUCTIVE !");
  Logger.log("");
  
  try {
    var props = PropertiesService.getScriptProperties();
    var elementsSupprimes = [];
    
    // 1. Supprimer les triggers
    Logger.log("⏰ Suppression des triggers...");
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
      ScriptApp.deleteTrigger(triggers[i]);
    }
    Logger.log("✅ " + triggers.length + " trigger(s) supprimé(s)");
    elementsSupprimes.push(triggers.length + " trigger(s)");
    
    // 2. Supprimer le Spreadsheet
    var ssId = props.getProperty(CONFIG.PROPS.ID_SPREADSHEET);
    if (ssId) {
      Logger.log("📊 Suppression du Spreadsheet...");
      try {
        var file = DriveApp.getFileById(ssId);
        file.setTrashed(true);
        Logger.log("✅ Spreadsheet supprimé");
        elementsSupprimes.push("Spreadsheet");
      } catch (e) {
        Logger.log("⚠️ Spreadsheet déjà supprimé ou inaccessible");
      }
    }
    
    // 3. Supprimer le Calendar
    var calId = props.getProperty(CONFIG.PROPS.ID_CALENDAR);
    if (calId) {
      Logger.log("📅 Suppression du Calendar...");
      try {
        var cal = CalendarApp.getCalendarById(calId);
        cal.deleteCalendar();
        Logger.log("✅ Calendar supprimé");
        elementsSupprimes.push("Calendar");
      } catch (e) {
        Logger.log("⚠️ Calendar déjà supprimé ou inaccessible");
      }
    }
    
    // 4. Supprimer le formulaire actuel
    var formId = props.getProperty(CONFIG.PROPS.ID_FORM);
    if (formId) {
      Logger.log("📝 Suppression du formulaire...");
      try {
        var file = DriveApp.getFileById(formId);
        file.setTrashed(true);
        Logger.log("✅ Formulaire supprimé");
        elementsSupprimes.push("Formulaire");
      } catch (e) {
        Logger.log("⚠️ Formulaire déjà supprimé ou inaccessible");
      }
    }
    
    // 5. Effacer toutes les properties
    Logger.log("🔑 Suppression des properties...");
    props.deleteAllProperties();
    Logger.log("✅ Properties effacées");
    elementsSupprimes.push("Properties");
    
    Logger.log("");
    Logger.log("═══════════════════════════════════════════════════════");
    Logger.log("✅ NETTOYAGE TERMINÉ");
    Logger.log("═══════════════════════════════════════════════════════");
    Logger.log("");
    Logger.log("🔄 Pour réinstaller : Exécutez CONFIG_INITIALE()");
    
    // Email de confirmation
    var htmlBody = GENERER_EMAIL_HEADER_("Système nettoyé", "🧹");
    
    htmlBody +=
      '<div class="card">' +
      "<h2>✅ Nettoyage terminé</h2>" +
      "<p>Le système a été complètement nettoyé et réinitialisé.</p>" +
      "</div>";

    htmlBody += '<div class="card">' + "<h2>🗑️ Éléments supprimés</h2>";
    
    for (var i = 0; i < elementsSupprimes.length; i++) {
      htmlBody +=
        '<div class="info-line">✅ ' + elementsSupprimes[i] + "</div>";
    }

    htmlBody += "</div>";

    htmlBody +=
      '<div class="card">' +
      "<h2>🔄 Prochaines étapes</h2>" +
      "<p>Pour réinstaller le système :</p>" +
      "<ol>" +
      "<li>Exécuter <code>CONFIG_INITIALE()</code></li>" +
      "<li>Exécuter <code>DEMARRER_SYSTEME()</code></li>" +
      "<li>Exécuter <code>TEST_COMPLET()</code></li>" +
      "</ol>" +
      "</div>";
    
    htmlBody += GENERER_EMAIL_FOOTER_();
    
    MailApp.sendEmail({
      to: CONFIG.EMAIL_ADMIN,
      subject: "🧹 Système nettoyé avec succès",
      htmlBody: htmlBody,
    });
  } catch (e) {
    Logger.log("❌ ERREUR : " + e.toString());
    Logger.log("Stack : " + e.stack);
    
    var htmlBody = GENERER_EMAIL_HEADER_("Erreur de nettoyage", "❌");
    htmlBody +=
      '<div class="card">' +
      '<h2 class="error">❌ Erreur</h2>' +
      '<div class="info-line">' +
      '<span class="info-label">Erreur :</span>' +
      '<span class="info-value error">' +
      e.toString() +
      "</span>" +
      "</div>" +
      "</div>";
    htmlBody += GENERER_EMAIL_FOOTER_();
    
    MailApp.sendEmail({
      to: CONFIG.EMAIL_ADMIN,
      subject: "❌ Erreur lors du nettoyage",
      htmlBody: htmlBody,
    });
    
    throw e;
  }
}


/**
 * Génère un rapport hebdomadaire des statistiques
 */
function GENERER_RAPPORT_HEBDOMADAIRE_() {
  Logger.log("═══════════════════════════════════════════════════════");
  Logger.log("📊 GÉNÉRATION DU RAPPORT HEBDOMADAIRE");
  Logger.log("═══════════════════════════════════════════════════════");
  
  try {
    var props = PropertiesService.getScriptProperties();
    var ssId = props.getProperty(CONFIG.PROPS.ID_SPREADSHEET);
    var ss = SpreadsheetApp.openById(ssId);
    var sheetReponses = ss.getSheetByName(CONFIG.ONGLETS.REPONSES);
    
    var data = sheetReponses.getDataRange().getValues();
    
    if (data.length <= 1) {
      Logger.log("⚠️ Aucune donnée à analyser");
      return;
    }
    
    // Statistiques
    var nbReponses = data.length - 1;
    var utilisateursUniques = {};
    var statsMatiere1 = {};
    var statsType1 = {};
    var statsNiveau = {};
    var statsGroupe = {};
    var statsCreneaux = {
      jeudiCampus: 0,
      lundiDiscord: 0,
      mardiDiscord: 0,
      mercrediDiscord: 0,
      jeudiDiscord: 0,
      vendrediDiscord: 0,
    };
    
    for (var i = 1; i < data.length; i++) {
      var email = data[i][CONFIG.COLONNES_REPONSES.EMAIL - 1];
      var niveau = data[i][CONFIG.COLONNES_REPONSES.NIVEAU - 1];
      var groupe = data[i][CONFIG.COLONNES_REPONSES.GROUPE - 1];
      var matiere1 = data[i][CONFIG.COLONNES_REPONSES.MATIERE1 - 1];
      var type1 = data[i][CONFIG.COLONNES_REPONSES.TYPE1 - 1];
      
      utilisateursUniques[email] = true;
      
      statsMatiere1[matiere1] = (statsMatiere1[matiere1] || 0) + 1;
      statsType1[type1] = (statsType1[type1] || 0) + 1;
      statsNiveau[niveau] = (statsNiveau[niveau] || 0) + 1;
      statsGroupe[groupe] = (statsGroupe[groupe] || 0) + 1;
      
      if (data[i][CONFIG.COLONNES_REPONSES.JEUDI_CAMPUS - 1] === "Oui")
        statsCreneaux.jeudiCampus++;
      if (data[i][CONFIG.COLONNES_REPONSES.LUNDI_DISCORD - 1] === "Oui")
        statsCreneaux.lundiDiscord++;
      if (data[i][CONFIG.COLONNES_REPONSES.MARDI_DISCORD - 1] === "Oui")
        statsCreneaux.mardiDiscord++;
      if (data[i][CONFIG.COLONNES_REPONSES.MERCREDI_DISCORD - 1] === "Oui")
        statsCreneaux.mercrediDiscord++;
      if (data[i][CONFIG.COLONNES_REPONSES.JEUDI_DISCORD - 1] === "Oui")
        statsCreneaux.jeudiDiscord++;
      if (data[i][CONFIG.COLONNES_REPONSES.VENDREDI_DISCORD - 1] === "Oui")
        statsCreneaux.vendrediDiscord++;
    }
    
    var nbUtilisateursUniques = Object.keys(utilisateursUniques).length;
    
    // Trouver les tops
    var topMatieres = Object.keys(statsMatiere1)
      .sort(function (a, b) {
      return statsMatiere1[b] - statsMatiere1[a];
      })
      .slice(0, 5);
    
    // Générer l'email HTML
    var htmlBody = GENERER_EMAIL_HEADER_("Rapport hebdomadaire", "📊");
    
    htmlBody +=
      '<div class="card">' +
      "<h2>📈 Vue d'ensemble</h2>" +
      '<div class="info-line">' +
      '<span class="info-label">Total réponses :</span>' +
      '<span class="info-value success">' +
      nbReponses +
      "</span>" +
      "</div>" +
      '<div class="info-line">' +
      '<span class="info-label">Étudiants uniques :</span>' +
      '<span class="info-value success">' +
      nbUtilisateursUniques +
      "</span>" +
      "</div>" +
      '<div class="info-line">' +
      '<span class="info-label">Période :</span>' +
      '<span class="info-value">' +
      Utilities.formatDate(new Date(), CONFIG.FUSEAU_HORAIRE, "dd/MM/yyyy") +
      "</span>" +
      "</div>" +
      "</div>";

    htmlBody += '<div class="card">' + "<h2>📚 Top 5 des matières</h2>";
    
    for (var i = 0; i < topMatieres.length; i++) {
      var matiere = topMatieres[i];
      var nb = statsMatiere1[matiere];
      var pourcentage = Math.round((nb / nbReponses) * 100);
      
      htmlBody +=
        '<div class="matiere-item">' +
        "<strong>" +
        (i + 1) +
        ". " +
        matiere +
        "</strong><br>" +
        '<span style="color: #667eea;">' +
        nb +
        " demande(s) (" +
        pourcentage +
        "%)</span>" +
        "</div>";
    }

    htmlBody += "</div>";

    htmlBody += '<div class="card">' + "<h2>📊 Types d'activité</h2>";
    
    for (var type in statsType1) {
      var nb = statsType1[type];
      var pourcentage = Math.round((nb / nbReponses) * 100);
      
      htmlBody +=
        '<div class="info-line">' +
        '<span class="info-label">' +
        type +
        " :</span>" +
        '<span class="info-value">' +
        nb +
        " (" +
        pourcentage +
        "%)</span>" +
        "</div>";
    }

    htmlBody += "</div>";

    htmlBody += '<div class="card">' + "<h2>🎓 Répartition niveaux</h2>";
    
    for (var niveau in statsNiveau) {
      var nb = statsNiveau[niveau];
      var pourcentage = Math.round((nb / nbReponses) * 100);
      
      htmlBody +=
        '<div class="info-line">' +
        '<span class="info-label">' +
        niveau +
        " :</span>" +
        '<span class="info-value">' +
        nb +
        " (" +
        pourcentage +
        "%)</span>" +
        "</div>";
    }

    htmlBody += "</div>";

    htmlBody += '<div class="card">' + "<h2>👥 Répartition groupes</h2>";
    
    for (var groupe in statsGroupe) {
      var nb = statsGroupe[groupe];
      var pourcentage = Math.round((nb / nbReponses) * 100);
      
      htmlBody +=
        '<div class="info-line">' +
        '<span class="info-label">' +
        groupe +
        " :</span>" +
        '<span class="info-value">' +
        nb +
        " (" +
        pourcentage +
        "%)</span>" +
        "</div>";
    }

    htmlBody += "</div>";

    htmlBody +=
      '<div class="card">' +
      "<h2>📅 Créneaux populaires</h2>" +
      '<div class="creneau-item">🏫 Jeudi Campus : <strong>' +
      statsCreneaux.jeudiCampus +
      "</strong> inscription(s)</div>" +
      '<div class="creneau-item">💬 Lundi Discord : <strong>' +
      statsCreneaux.lundiDiscord +
      "</strong> inscription(s)</div>" +
      '<div class="creneau-item">💬 Mardi Discord : <strong>' +
      statsCreneaux.mardiDiscord +
      "</strong> inscription(s)</div>" +
      '<div class="creneau-item">💬 Mercredi Discord : <strong>' +
      statsCreneaux.mercrediDiscord +
      "</strong> inscription(s)</div>" +
      '<div class="creneau-item">💬 Jeudi Discord : <strong>' +
      statsCreneaux.jeudiDiscord +
      "</strong> inscription(s)</div>" +
      '<div class="creneau-item">💬 Vendredi Discord : <strong>' +
      statsCreneaux.vendrediDiscord +
      "</strong> inscription(s)</div>" +
      "</div>";
    
    htmlBody += GENERER_EMAIL_FOOTER_();
    
    MailApp.sendEmail({
      to: CONFIG.EMAIL_ADMIN,
      subject: "📊 Rapport hebdomadaire - " + nbReponses + " réponse(s)",
      htmlBody: htmlBody,
    });
    
    Logger.log("✅ Rapport généré et envoyé");
  } catch (e) {
    Logger.log("❌ ERREUR : " + e.toString());
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 📚 DOCUMENTATION
 * ═══════════════════════════════════════════════════════════════════════
 */

/**
 * Génère et envoie la documentation complète
 */
function GENERER_DOCUMENTATION() {
  Logger.log("📚 Génération de la documentation...");
  
  var htmlBody = GENERER_EMAIL_HEADER_("Documentation système", "📚");
  
  htmlBody += '<div class="card">' +
    '<h2>📚 Documentation complète</h2>' +
    '<p>Version <strong>' + CONFIG.VERSION + '</strong></p>' +
    '<p>Voici la documentation complète du système de gestion des groupes d\'étude.</p>' +
    '</div>';
  
  htmlBody += '<div class="card">' +
    '<h2>🚀 PROCÉDURE D\'INSTALLATION</h2>' +
    '<h3>Étape 1 : Configuration initiale</h3>' +
    '<ol>' +
    '<li>Ouvrir Apps Script</li>' +
    '<li>Modifier <code>CONFIG.EMAIL_ADMIN</code> (ligne 50) avec votre email</li>' +
    '<li>Exécuter <code>CONFIG_INITIALE()</code></li>' +
    '<li>Autoriser les permissions demandées</li>' +
    '</ol>' +
    '<h3>Étape 2 : Démarrage du système</h3>' +
    '<ol>' +
    '<li>Exécuter <code>DEMARRER_SYSTEME()</code></li>' +
    '<li>Exécuter <code>TEST_COMPLET()</code></li>' +
    '<li>Vérifier que tous les tests passent</li>' +
    '</ol>' +
    '<h3>Étape 3 : Activation</h3>' +
    '<ol>' +
    '<li>Partager le lien du formulaire aux étudiants</li>' +
    '<li>Le système fonctionne automatiquement</li>' +
    '</ol>' +
    '</div>';
  
  htmlBody += '<div class="card">' +
    '<h2>⚙️ FONCTIONS DE MAINTENANCE</h2>' +
    '<h3>🔧 Fonctions principales</h3>' +
    '<div class="matiere-item">' +
    '<strong>CONFIG_INITIALE()</strong><br>' +
    'Crée le Spreadsheet et le Calendar. À exécuter une seule fois.' +
    '</div>' +
    '<div class="matiere-item">' +
    '<strong>DEMARRER_SYSTEME()</strong><br>' +
    'Crée le premier formulaire et installe les triggers automatiques.' +
    '</div>' +
    '<div class="matiere-item">' +
    '<strong>TEST_COMPLET()</strong><br>' +
    'Vérifie que tous les composants fonctionnent correctement.' +
    '</div>' +
    '<div class="matiere-item">' +
    '<strong>NETTOYER_SYSTEME()</strong><br>' +
    '⚠️ ATTENTION : Supprime tout et réinitialise le système.' +
    '</div>' +
    '</div>';
  
  htmlBody += '<div class="card">' +
    '<h3>📊 Fonctions de rapport</h3>' +
    '<div class="matiere-item">' +
    '<strong>GENERER_RAPPORT_HEBDOMADAIRE_()</strong><br>' +
    'Génère un rapport statistique complet.' +
    '</div>' +
    '<div class="matiere-item">' +
    '<strong>GENERER_DOCUMENTATION()</strong><br>' +
    'Génère et envoie cette documentation.' +
    '</div>' +
    '</div>';
  
  htmlBody += '<div class="card">' +
    '<h3>🛠️ Fonctions de maintenance manuelle</h3>' +
    '<div class="matiere-item">' +
    '<strong>LANCER_BATCH_MIDI_MANUEL_AUJOURDHUI_()</strong><br>' +
    'Lance manuellement le batch de planification pour aujourd\'hui.' +
    '</div>' +
    '<div class="matiere-item">' +
    '<strong>LANCER_BATCH_MIDI_MANUEL_DATE_()</strong><br>' +
    'Lance manuellement le batch pour une date spécifique.' +
    '</div>' +
    '<div class="matiere-item">' +
    '<strong>CREER_FORMULAIRE_SEMAINE_ACTUELLE_()</strong><br>' +
    'Crée manuellement le formulaire pour la semaine en cours.' +
    '</div>' +
    '<div class="matiere-item">' +
    '<strong>INSTALLER_TRIGGERS_()</strong><br>' +
    'Réinstalle tous les triggers automatiques.' +
    '</div>' +
    '</div>';
  
  htmlBody += '<div class="card">' +
    '<h2>🔍 PROCÉDURES DE DIAGNOSTIC</h2>' +
    '<h3>Problème : Aucun groupe formé</h3>' +
    '<ol>' +
    '<li>Exécuter <code>TEST_COMPLET()</code> pour vérifier l\'état</li>' +
    '<li>Vérifier l\'onglet "Réponses" : y a-t-il des données ?</li>' +
    '<li>Exécuter <code>LANCER_BATCH_MIDI_MANUEL_AUJOURDHUI_()</code></li>' +
    '<li>Consulter les logs pour voir les erreurs</li>' +
    '<li>Vérifier que les participants ont coché "Oui" pour les créneaux</li>' +
    '</ol>' +
    '<h3>Problème : Erreurs d\'email</h3>' +
    '<ol>' +
    '<li>Vérifier <code>CONFIG.EMAIL_ADMIN</code> est correct</li>' +
    '<li>Consulter les logs pour "Service invoked too many times"</li>' +
    '<li>Attendre le lendemain ou utiliser <code>TEST_SANS_EMAILS()</code></li>' +
    '</ol>' +
    '<h3>Problème : Triggers non fonctionnels</h3>' +
    '<ol>' +
    '<li>Apps Script > Déclencheurs</li>' +
    '<li>Vérifier que les triggers sont présents</li>' +
    '<li>Exécuter <code>INSTALLER_TRIGGERS_()</code> si nécessaire</li>' +
    '</ol>' +
    '<h3>Problème : Formulaire non créé</h3>' +
    '<ol>' +
    '<li>Exécuter <code>CREER_FORMULAIRE_SEMAINE_ACTUELLE_()</code></li>' +
    '<li>Vérifier les permissions du script</li>' +
    '<li>Consulter les logs d\'erreur</li>' +
    '</ol>' +
    '</div>';
  
  htmlBody += '<div class="card">' +
    '<h2>🆘 CAS D\'URGENCE</h2>' +
    '<h3>Reset complet du système</h3>' +
    '<ol>' +
    '<li>⚠️ <strong>NETTOYER_SYSTEME()</strong> - Supprime tout</li>' +
    '<li>Exécuter <code>CONFIG_INITIALE()</code></li>' +
    '<li>Exécuter <code>DEMARRER_SYSTEME()</code></li>' +
    '<li>Exécuter <code>TEST_COMPLET()</code></li>' +
    '</ol>' +
    '<h3>Récupération après erreur</h3>' +
    '<ol>' +
    '<li>Consulter l\'onglet AUDIT du Spreadsheet</li>' +
    '<li>Identifier la dernière action réussie</li>' +
    '<li>Relancer les fonctions manquantes</li>' +
    '<li>Vérifier avec <code>TEST_COMPLET()</code></li>' +
    '</ol>' +
    '</div>';
  
  htmlBody += '<div class="card">' +
    '<h2>⏰ AUTOMATISATIONS</h2>' +
    '<ul>' +
    '<li><strong>Dimanche 9h :</strong> Création automatique du formulaire de la semaine</li>' +
    '<li><strong>À l\'inscription :</strong> Traitement immédiat et création des événements Calendar</li>' +
    '<li><strong>Lundi-Vendredi 12h :</strong> Planification automatique des groupes</li>' +
    '<li><strong>Hebdomadaire :</strong> Génération de rapports statistiques (optionnel)</li>' +
    '</ul>' +
    '</div>';
  
  htmlBody += '<div class="card">' +
    '<h2>📚 FONCTIONNALITÉS v3.1.0</h2>' +
    '<ul>' +
    '<li>✅ 12 matières disponibles</li>' +
    '<li>✅ Choix entre Révisions et Devoirs</li>' +
    '<li>✅ Niveaux obligatoires : B3 ou B3+L</li>' +
    '<li>✅ Groupes obligatoires : L3A, L3B, L3C</li>' +
    '<li>✅ Prénom et nom réels obligatoires</li>' +
    '<li>✅ Emails HTML professionnels</li>' +
    '<li>✅ Rapports statistiques détaillés</li>' +
    '<li>✅ Invitations Calendar personnalisées</li>' +
    '<li>✅ Diagnostic détaillé des erreurs</li>' +
    '</ul>' +
    '</div>';
  
  htmlBody += '<div class="card">' +
    '<h2>🆘 SUPPORT</h2>' +
    '<p>En cas de problème :</p>' +
    '<ol>' +
    '<li>Vérifier les logs (Ctrl+Enter dans Apps Script)</li>' +
    '<li>Exécuter <code>TEST_COMPLET()</code></li>' +
    '<li>Consulter l\'onglet AUDIT du Spreadsheet</li>' +
    '<li>Utiliser les procédures de diagnostic ci-dessus</li>' +
    '<li>Contacter l\'administrateur</li>' +
    '</ol>' +
    '</div>';
  
  htmlBody += GENERER_EMAIL_FOOTER_();
  
  MailApp.sendEmail({
    to: CONFIG.EMAIL_ADMIN,
    subject: "📚 Documentation système v" + CONFIG.VERSION,
    htmlBody: htmlBody
  });
  
  Logger.log("✅ Documentation envoyée");
}

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 📅 GESTION DU FORMULAIRE HEBDOMADAIRE
 * ═══════════════════════════════════════════════════════════════════════
 */

/**
 * Crée le formulaire pour la semaine en cours
 */
function CREER_FORMULAIRE_SEMAINE_ACTUELLE_() {
  Logger.log("═══════════════════════════════════════════════════════");
  Logger.log("📝 CRÉATION FORMULAIRE SEMAINE ACTUELLE");
  Logger.log("═══════════════════════════════════════════════════════");
  
  try {
    var maintenant = new Date();
    var lundiSemaine = OBTENIR_LUNDI_SEMAINE_(maintenant);
    
    CREER_FORMULAIRE_SEMAINE_(lundiSemaine);
    
    Logger.log("✅ Formulaire créé avec succès");
  } catch (e) {
    Logger.log("❌ ERREUR : " + e.toString());
    throw e;
  }
}

/**
 * Crée le formulaire pour une semaine spécifique
 */
function CREER_FORMULAIRE_SEMAINE_(lundiSemaine) {
  try {
    var props = PropertiesService.getScriptProperties();
    var ssId = props.getProperty(CONFIG.PROPS.ID_SPREADSHEET);
    var ss = SpreadsheetApp.openById(ssId);
    
    var infoSemaine = CALCULER_SEMAINE_ISO_(lundiSemaine);
    var numSemaine = infoSemaine.annee + "W" + ZERO_PAD_(infoSemaine.semaine);
    
    var dimanche = AJOUTER_JOURS_(lundiSemaine, 6);
    var dateDebut = Utilities.formatDate(
      lundiSemaine,
      CONFIG.FUSEAU_HORAIRE,
      "dd/MM"
    );
    var dateFin = Utilities.formatDate(
      dimanche,
      CONFIG.FUSEAU_HORAIRE,
      "dd/MM/yyyy"
    );

    var titre =
      CONFIG.TITRE_FORMULAIRE_PREFIX +
      " " +
      infoSemaine.semaine +
      " (" +
      dateDebut +
      " - " +
      dateFin +
      ")";
    
    Logger.log("📝 Création : " + titre);
    
    var form = FormApp.create(titre);
    var formId = form.getId();
    
    // Configuration générale
    var description =
      "🎓 Inscris-toi aux sessions de groupe d'étude de la semaine " +
      infoSemaine.semaine +
      "\n\n" +
      "📅 Du " +
      dateDebut +
      " au " +
      dateFin +
      "\n\n" +
                      "⚠️ Une seule inscription par semaine.\n" +
                      "Pour modifier : renvoie le formulaire avec la même adresse email.";
    
    form.setDescription(description);
    form.setConfirmationMessage(
      "✅ Inscription enregistrée ! Tu recevras les invitations Calendar."
    );
    form.setCollectEmail(true);
    form.setLimitOneResponsePerUser(false);
    form.setAllowResponseEdits(false);
    form.setShowLinkToRespondAgain(true);
    
    // Lier au Spreadsheet
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ssId);
    
    // === SECTION 1 : IDENTITÉ ===
    form.addPageBreakItem().setTitle("👤 Qui es-tu ?");
    
    form
      .addTextItem()
      .setTitle("Prénom")
      .setHelpText("Ton prénom réel")
      .setRequired(true);
    
    form
      .addTextItem()
      .setTitle("Nom")
      .setHelpText("Ton nom de famille réel")
      .setRequired(true);
    
    form
      .addMultipleChoiceItem()
      .setTitle("Niveau d'études")
      .setChoiceValues(CONFIG.NIVEAUX)
      .setRequired(true);
    
    form
      .addMultipleChoiceItem()
      .setTitle("Groupe de classe")
      .setChoiceValues(CONFIG.GROUPES)
      .setRequired(true);
    
        // === SECTION 2 : MATIÈRES (4 CHOIX POSSIBLES) ===
    form.addPageBreakItem().setTitle("📚 Quelles matières ? (Maximum 4)");
    
    // MATIÈRE 1 (OBLIGATOIRE)
    form
      .addMultipleChoiceItem()
      .setTitle("Matière 1")
      .setChoiceValues(CONFIG.MATIERES)
      .setRequired(true);
    
    form
      .addMultipleChoiceItem()
      .setTitle("Type d'activité pour Matière 1")
      .setChoiceValues(CONFIG.TYPES_ACTIVITE)
      .setRequired(true);
    
    form
      .addMultipleChoiceItem()
      .setTitle("Niveau d'accompagnement pour Matière 1")
      .setChoiceValues(CONFIG.NIVEAUX_ACCOMPAGNEMENT)
      .setRequired(true);
    
    // MATIÈRE 2 (OPTIONNELLE)
    var matieres2 = ["Aucune autre matière"].concat(CONFIG.MATIERES);
    
    form
      .addMultipleChoiceItem()
      .setTitle("Matière 2 (optionnelle)")
      .setChoiceValues(matieres2)
      .setRequired(true);
    
    form
      .addMultipleChoiceItem()
      .setTitle("Type d'activité pour Matière 2")
      .setChoiceValues(CONFIG.TYPES_ACTIVITE)
      .setRequired(false);
    
    form
      .addMultipleChoiceItem()
      .setTitle("Niveau d'accompagnement pour Matière 2")
      .setChoiceValues(CONFIG.NIVEAUX_ACCOMPAGNEMENT)
      .setRequired(false);
    
    // MATIÈRE 3 (OPTIONNELLE)
    form
      .addMultipleChoiceItem()
      .setTitle("Matière 3 (optionnelle)")
      .setChoiceValues(matieres2)
      .setRequired(true);
    
    form
      .addMultipleChoiceItem()
      .setTitle("Type d'activité pour Matière 3")
      .setChoiceValues(CONFIG.TYPES_ACTIVITE)
      .setRequired(false);
    
    form
      .addMultipleChoiceItem()
      .setTitle("Niveau d'accompagnement pour Matière 3")
      .setChoiceValues(CONFIG.NIVEAUX_ACCOMPAGNEMENT)
      .setRequired(false);
    
    // MATIÈRE 4 (OPTIONNELLE)
    form
      .addMultipleChoiceItem()
      .setTitle("Matière 4 (optionnelle)")
      .setChoiceValues(matieres2)
      .setRequired(true);
    
    form
      .addMultipleChoiceItem()
      .setTitle("Type d'activité pour Matière 4")
      .setChoiceValues(CONFIG.TYPES_ACTIVITE)
      .setRequired(false);
    
    form
      .addMultipleChoiceItem()
      .setTitle("Niveau d'accompagnement pour Matière 4")
      .setChoiceValues(CONFIG.NIVEAUX_ACCOMPAGNEMENT)
      .setRequired(false);
    
    // === SECTION 3 : CRÉNEAUX ===
    form
      .addPageBreakItem()
      .setTitle("📅 Créneaux disponibles")
      .setHelpText("Coche tous les créneaux où tu peux venir");
    
    var jeudi = AJOUTER_JOURS_(lundiSemaine, 3);
    var dateJeudi = Utilities.formatDate(jeudi, CONFIG.FUSEAU_HORAIRE, "dd/MM");
    
    form
      .addMultipleChoiceItem()
      .setTitle("🏫 Jeudi " + dateJeudi + " (13h-17h) - Campus")
      .setChoiceValues(["Oui", "Non"])
      .setRequired(true);
    
    var dateLundi = Utilities.formatDate(
      lundiSemaine,
      CONFIG.FUSEAU_HORAIRE,
      "dd/MM"
    );

    form
      .addMultipleChoiceItem()
      .setTitle("💬 Lundi " + dateLundi + " (16h45-19h) - Discord")
      .setChoiceValues(["Oui", "Non"])
      .setRequired(true);
    
    var mardi = AJOUTER_JOURS_(lundiSemaine, 1);
    var dateMardi = Utilities.formatDate(mardi, CONFIG.FUSEAU_HORAIRE, "dd/MM");
    
    form
      .addMultipleChoiceItem()
      .setTitle("💬 Mardi " + dateMardi + " (16h45-19h) - Discord")
      .setChoiceValues(["Oui", "Non"])
      .setRequired(true);
    
    var mercredi = AJOUTER_JOURS_(lundiSemaine, 2);
    var dateMercredi = Utilities.formatDate(
      mercredi,
      CONFIG.FUSEAU_HORAIRE,
      "dd/MM"
    );

    form
      .addMultipleChoiceItem()
      .setTitle("💬 Mercredi " + dateMercredi + " (16h45-19h) - Discord")
      .setChoiceValues(["Oui", "Non"])
      .setRequired(true);
    
    form
      .addMultipleChoiceItem()
      .setTitle("💬 Jeudi " + dateJeudi + " (16h45-19h) - Discord")
      .setChoiceValues(["Oui", "Non"])
      .setRequired(true);
    
    var vendredi = AJOUTER_JOURS_(lundiSemaine, 4);
    var dateVendredi = Utilities.formatDate(
      vendredi,
      CONFIG.FUSEAU_HORAIRE,
      "dd/MM"
    );

    form
      .addMultipleChoiceItem()
      .setTitle("💬 Vendredi " + dateVendredi + " (16h45-19h) - Discord")
      .setChoiceValues(["Oui", "Non"])
      .setRequired(true);
    
    // === COMMENTAIRE (OPTIONNEL) ===
    form
      .addParagraphTextItem()
      .setTitle("Commentaire (optionnel)")
      .setHelpText("Précision utile pour l'organisation (max 300 caractères)")
      .setRequired(false);
    
    // Sauvegarder les IDs
    props.setProperty(CONFIG.PROPS.ID_FORM, formId);
    props.setProperty(CONFIG.PROPS.SEMAINE_FORM, numSemaine);
    
    Logger.log("✅ Formulaire créé : " + formId);
    Logger.log("✅ URL : " + form.getPublishedUrl());
    
    ECRIRE_AUDIT_("FORMULAIRE_CREE", {
      semaine: numSemaine,
      formId: formId,
      url: form.getPublishedUrl(),
    });
    
    return form;
  } catch (e) {
    Logger.log("❌ ERREUR création formulaire : " + e.toString());
    throw e;
  }
}

/**
 * Trigger automatique : Création du formulaire chaque dimanche à 9h
 */
function TRIGGER_CREATION_FORMULAIRE_HEBDO_() {
  Logger.log("═══════════════════════════════════════════════════════");
  Logger.log("⏰ TRIGGER HEBDOMADAIRE DÉCLENCHÉ");
  Logger.log("═══════════════════════════════════════════════════════");
  
  try {
    var maintenant = new Date();
    var lundiProchain = OBTENIR_LUNDI_SEMAINE_(AJOUTER_JOURS_(maintenant, 1));
    
    Logger.log(
      "📅 Création du formulaire pour le lundi : " +
        Utilities.formatDate(lundiProchain, CONFIG.FUSEAU_HORAIRE, "dd/MM/yyyy")
    );
    
    CREER_FORMULAIRE_SEMAINE_(lundiProchain);
    
    Logger.log("✅ Formulaire hebdomadaire créé");
  } catch (e) {
    Logger.log("❌ ERREUR trigger : " + e.toString());
    
    MailApp.sendEmail({
      to: CONFIG.EMAIL_ADMIN,
      subject: "❌ Erreur création formulaire hebdo",
      body: "Erreur : " + e.toString() + "\n\nStack:\n" + e.stack,
    });
  }
}

/**
 * Installe/replace le trigger quotidien à 12h pour la planification des groupes.
 */
function PROGRAMMER_PLANIFICATION_QUOTIDIENNE_MIDI_() {
  try {
    // Supprime les anciens triggers du même handler
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
      if (triggers[i].getHandlerFunction() === "PLANIFIER_GROUPES_DU_JOUR_") {
        ScriptApp.deleteTrigger(triggers[i]);
      }
    }

    // Crée le nouveau trigger (tous les jours à 12h fuseau Europe/Paris)
    ScriptApp.newTrigger("PLANIFIER_GROUPES_DU_JOUR_")
      .timeBased()
      .everyDays(1)
      .atHour(12) // 12h locale
      .create();

    Logger.log("✅ Trigger quotidien (12h) installé");
  } catch (e) {
    Logger.log("❌ ERREUR installation trigger midi : " + e.toString());
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🧩 FORMATION AUTOMATIQUE DES GROUPES
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Ces fonctions gèrent la formation automatique des groupes de travail
 * basée sur les matières choisies et les disponibilités des étudiants.
 */

/**
 * Planifie les groupes pour la journée courante
 * Cette fonction est déclenchée chaque jour ouvré à 12h00 et :
 * 1. Vérifie que ce n'est pas un week-end
 * 2. Identifie les créneaux disponibles pour aujourd'hui
 * 3. Charge les candidats pour chaque créneau
 * 4. Forme des groupes de 2-4 personnes avec matières communes
 * 5. Crée les événements calendrier et envoie les invitations
 *
 * ⚠️ IMPORTANT :
 * Cette fonction est appelée automatiquement par un trigger quotidien
 * Elle ignore les week-ends et ne traite que les jours ouvrables
 *
 * @return {boolean} - true si la planification s'est bien passée
 */
function PLANIFIER_GROUPES_DU_JOUR_() {
  try {
    var today = new Date();
    var tz = CONFIG.FUSEAU_HORAIRE;
    var day = Utilities.formatDate(today, tz, "u"); // 1=lundi ... 7=dimanche
    if (day == "6" || day == "7") {
      Logger.log("🚫 Week-end, aucun groupe à planifier.");
      return;
    }

    Logger.log(
      "📅 Planification des groupes pour le " +
        Utilities.formatDate(today, tz, "yyyy-MM-dd") +
        " …"
    );

    ECRIRE_AUDIT_("BATCH_MIDI", {
      date: today,
      statut: "TODO",
    });
  } catch (e) {
    Logger.log("❌ ERREUR batch midi : " + e.toString());
    ECRIRE_AUDIT_("ERREUR_BATCH_MIDI", e.toString());
  }
}

/**
 * 🎨 GENERER_DESCRIPTION_EVENEMENT_()
 * -----------------------------------------------------------------
 * Génère une description enrichie pour l'événement Calendar avec :
 * - Niveau des participants [A], [B], [C]
 * - Matières communes multiples
 * - Commentaires avec nom du propriétaire
 * - Lien Discord
 */
function GENERER_DESCRIPTION_EVENEMENT_(participants, subject) {
  var description = "🎯 Matière commune : " + subject + "\n\n";
  
  // Détecter les matières communes multiples
  var matieresCommunes = [];
  if (participants.length > 1) {
    var matieresParParticipant = participants.map(function(p) {
      return p.matieres || [];
    });
    
    // Trouver les matières communes à tous
    var premiereListe = matieresParParticipant[0];
    for (var i = 0; i < premiereListe.length; i++) {
      var matiere = premiereListe[i];
      var estCommune = true;
      for (var j = 1; j < matieresParParticipant.length; j++) {
        if (matieresParParticipant[j].indexOf(matiere) === -1) {
          estCommune = false;
          break;
        }
      }
      if (estCommune && matiere) {
        matieresCommunes.push(matiere);
      }
    }
  }
  
  if (matieresCommunes.length > 1) {
    description += "📚 Matières communes : " + matieresCommunes.join(", ") + "\n\n";
  }
  
  description += "👥 Participants :\n";
  participants.forEach(function(p) {
    var niveau = p.niveau || "";
    var niveauCode = "";
    if (niveau.includes("A")) niveauCode = "[A]";
    else if (niveau.includes("B")) niveauCode = "[B]";
    else if (niveau.includes("C")) niveauCode = "[C]";
    
    description += "• " + p.prenom + " " + p.nom + " " + niveauCode + "\n";
    
    if (p.commentaire && p.commentaire.trim()) {
      description += "  💬 " + p.prenom + " : " + p.commentaire + "\n";
    }
  });
  
  description += "\n💬 Discord : " + CONFIG.DISCORD_LINK;
  
  return description;
}

/**
 * =====================================================================
 * SLOT → COLONNE Spreadsheet (réponses Oui/Non)
 * Permet de savoir quelle colonne de Réponses correspond à quel créneau.
 * =====================================================================*/
function GET_SLOT_COLONNE_() {
  // Vérification de sécurité
  if (!CONFIG) {
    Logger.log("❌ ERREUR: CONFIG non défini");
    return null;
  }
  if (!CONFIG.COLONNES_REPONSES) {
    Logger.log("❌ ERREUR: CONFIG.COLONNES_REPONSES non défini");
    Logger.log("CONFIG keys: " + Object.keys(CONFIG).join(", "));
    return null;
  }
  if (!CONFIG.COLONNES_REPONSES.LUNDI_DISCORD) {
    Logger.log("❌ ERREUR: CONFIG.COLONNES_REPONSES.LUNDI_DISCORD non défini");
    Logger.log("COLONNES_REPONSES keys: " + Object.keys(CONFIG.COLONNES_REPONSES).join(", "));
    return null;
  }
  
  return {
    JEUDI_CAMPUS: CONFIG.COLONNES_REPONSES.JEUDI_CAMPUS,
    LUNDI_DISCORD: CONFIG.COLONNES_REPONSES.LUNDI_DISCORD,
    MARDI_DISCORD: CONFIG.COLONNES_REPONSES.MARDI_DISCORD,
    MERCREDI_DISCORD: CONFIG.COLONNES_REPONSES.MERCREDI_DISCORD,
    JEUDI_DISCORD: CONFIG.COLONNES_REPONSES.JEUDI_DISCORD,
    VENDREDI_DISCORD: CONFIG.COLONNES_REPONSES.VENDREDI_DISCORD,
  };
}

/**
 * Retourne la clé(s) de créneau correspondant au jour donné.
 * @param {Date} dateJS
 * @return {string[]} tableau de SlotKey pour ce jour (jeudi => 2 slots)
 */
function OBTENIR_SLOTS_DU_JOUR_(dateJS) {
  var jour = dateJS.getDay(); // 0=dimanche
  switch (jour) {
    case 1:
      return ["LUNDI_DISCORD"];
    case 2:
      return ["MARDI_DISCORD"];
    case 3:
      return ["MERCREDI_DISCORD"];
    case 4:
      return ["JEUDI_CAMPUS", "JEUDI_DISCORD"];
    case 5:
      return ["VENDREDI_DISCORD"];
    default:
      return [];
  }
}

/**
 * CHARGER_CANDIDATS_POUR_SLOT_
 * -----------------------------------------------------------
 * Lit l'onglet Réponses et ne conserve que les étudiants ayant répondu
 * "Oui" pour le slotKey demandé, dans la semaine courante.
 * Pour la déduplication, on garde la réponse la plus récente (Horodateur).
 */
function CHARGER_CANDIDATS_POUR_SLOT_(sheetReponses, slotKey, dateRef) {
  var data = sheetReponses.getDataRange().getValues();
  if (data.length <= 1) return [];

  // DIAGNOSTIC DÉTAILLÉ
  Logger.log("[Diag] === CHARGER_CANDIDATS_POUR_SLOT_ ===");
  Logger.log("[Diag] slotKey: " + slotKey);
  Logger.log("[Diag] dateRef: " + dateRef);
  Logger.log("[Diag] Total lignes: " + data.length);
  Logger.log("[Diag] Mode: traiter TOUTES les réponses (pas de filtre par date d'inscription)");

  // Vérification de sécurité
  var SLOT_COLONNE = GET_SLOT_COLONNE_();
  if (!SLOT_COLONNE) {
    Logger.log("[Diag] ERREUR: SLOT_COLONNE n'est pas défini !");
    Logger.log("[Diag] Vérifiez que CONFIG est correctement initialisé");
    return [];
  }
  
  var colSlot = SLOT_COLONNE[slotKey];
  if (!colSlot) {
    Logger.log("[Diag] ERREUR: slotKey '" + slotKey + "' non trouvé dans SLOT_COLONNE");
    Logger.log("[Diag] Slots disponibles: " + Object.keys(SLOT_COLONNE).join(", "));
    return [];
  }
  Logger.log("[Diag] Colonne slot: " + colSlot);
  colSlot = colSlot - 1; // 0-based
  var mapParEmail = {}; // email -> ligne la + récente

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var horoCell = row[CONFIG.COLONNES_REPONSES.TIMESTAMP - 1];
    var horodateur = PARSE_TIMESTAMP_(horoCell, CONFIG.FUSEAU_HORAIRE);
    if (!horodateur) continue;
    Logger.log("[Diag] Ligne " + i + ": horodateur=" + horodateur + " (cell=" + horoCell + ")");
    // SUPPRIMÉ: filtre par semaine d'inscription - on traite TOUTES les réponses
    // if (horodateur < lundiSemaine || horodateur > dimancheSemaine) continue;

    var email = row[CONFIG.COLONNES_REPONSES.EMAIL - 1];
    // Si doublon, garder le + récent
    if (!mapParEmail[email] || mapParEmail[email].horodateur < horodateur) {
      mapParEmail[email] = { row: row, horodateur: horodateur };
    }
  }

  var candidats = [];
  for (var email in mapParEmail) {
    var row = mapParEmail[email].row;
    var slotValue = String(row[colSlot] || "").trim();
    Logger.log("[Diag] " + email + " -> slotValue='" + slotValue + "'");
    if (slotValue !== "Oui") continue; // non disponible

    // Construire objet candidat
    var matieres = [];
    for (var idx = 0; idx < 4; idx++) {
      var mat = row[CONFIG.COLONNES_REPONSES.MATIERE1 - 1 + idx * 3];
      if (mat && mat.indexOf("Aucune") === -1 && mat !== "") {
        var type = row[CONFIG.COLONNES_REPONSES.TYPE1 - 1 + idx * 3];
        var acc = row[CONFIG.COLONNES_REPONSES.ACCOMPAGNEMENT1 - 1 + idx * 3];
        matieres.push({ matiere: mat, type: type, acc: acc });
      }
    }

    if (!VALID_EMAIL_(email)) {
      Logger.log("[Diag] Email invalide ignoré: '" + email + "'");
      continue;
    }
    candidats.push({
      email: String(email).trim(),
      prenom: row[CONFIG.COLONNES_REPONSES.PRENOM - 1],
      nom: row[CONFIG.COLONNES_REPONSES.NOM - 1],
      niveau: row[CONFIG.COLONNES_REPONSES.NIVEAU - 1],
      groupe: row[CONFIG.COLONNES_REPONSES.GROUPE - 1],
      matieres: matieres,
      commentaire: row[CONFIG.COLONNES_REPONSES.COMMENTAIRE - 1] || "",
    });
  }

  return candidats;
}

/**
 * FORMER_GROUPES_POUR_SLOT_
 * -----------------------------------------------------------
 * Regroupe les candidats (min 2, max 4) avec au moins une matière commune.
 * Algo simplifié :
 * 1. Index matière -> liste candidats encore libres.
 * 2. Parcours matières par popularité, formation de groupes de 4 puis 3 puis 2.
 * 3. S'il reste 1 iso, on l'ajoute au groupe dont il partage le + de matières,
 *    sinon au plus petit groupe.
 */
function FORMER_GROUPES_POUR_SLOT_(candidats) {
  var groupes = [];
  var restants = candidats.slice();

  // Construire compteur par matière
  var count = {};
  restants.forEach(function (c) {
    c.matieres.forEach(function (m) {
      count[m.matiere] = (count[m.matiere] || 0) + 1;
    });
  });

  var matieresTriees = Object.keys(count).sort(function (a, b) {
    return count[b] - count[a];
  });

  function popNextFree(mat, usedSet) {
    for (var i = 0; i < restants.length; i++) {
      if (usedSet.has(i)) continue;
      var cand = restants[i];
      var has = cand.matieres.some(function (mm) {
        return mm.matiere === mat;
      });
      if (has) {
        usedSet.add(i);
        return cand;
      }
    }
    return null;
  }

  // formation primaire
  matieresTriees.forEach(function (mat) {
    var used = new Set();
    while (true) {
      var grp = [];
      var cand = popNextFree(mat, used);
      if (!cand) break;
      grp.push(cand);
      // essayer d'étoffer le groupe jusqu'à 4
      for (var s = 0; s < restants.length && grp.length < 4; s++) {
        if (used.has(s)) continue;
        var c2 = restants[s];
        var partage = c2.matieres.some(function (mm) {
          return mm.matiere === mat;
        });
        if (partage) {
          used.add(s);
          grp.push(c2);
        }
      }
      if (grp.length >= 2) {
        groupes.push({ subject: mat, participants: grp });
      } else {
        // Pas assez pour groupe, libère
        used.delete(restants.indexOf(cand));
        break;
      }
    }

    // retirer used de restants
    restants = restants.filter(function (c, idx) {
      return !used.has(idx);
    });
  });

  // Gestion des restants
  if (restants.length === 1) {
    var iso = restants[0];
    // trouver le groupe avec plus d'affinités sinon plus petit
    var bestIdx = 0;
    var bestScore = -1;
    groupes.forEach(function (g, idx) {
      var score = 0;
      iso.matieres.forEach(function (m) {
        g.participants.forEach(function (p) {
          p.matieres.forEach(function (pm) {
            if (pm.matiere === m.matiere) score++;
          });
        });
      });
      if (score > bestScore) {
        bestScore = score;
        bestIdx = idx;
      }
    });
    groupes[bestIdx].participants.push(iso);
    restants = [];
  }

  // Si d'autres restants >1, créer groupes même sans matière commune (fallback)
  while (restants.length >= 2) {
    groupes.push({
      subject: restants[0].matieres[0]
        ? restants[0].matieres[0].matiere
        : "Divers",
      participants: restants.splice(0, Math.min(4, restants.length)),
    });
  }

  return groupes;
}

/**
 * UPSERT_EVENEMENT_ET_PERSISTANCE_
 * -----------------------------------------------------------
 * Crée ou met à jour l'événement Calendar et la ligne de l'onglet GROUPES.
 */
function UPSERT_EVENEMENT_ET_PERSISTANCE_(
  dateISO,
  slotKey,
  subject,
  index,
  participants,
  calId,
  sheetGroupes
) {
  var cal = CalendarApp.getCalendarById(calId);

  // Rechercher ligne dans GROUPES
  var data = sheetGroupes.getDataRange().getValues();
  var ligne = -1;
  for (var i = 1; i < data.length; i++) {
    if (
      data[i][0] === dateISO &&
      data[i][1] === slotKey &&
      data[i][2] === subject &&
      data[i][3] === index
    ) {
      ligne = i + 1; // 1-based
      break;
    }
  }

  // Construit les dates/heures début/fin
  var lundi = OBTENIR_LUNDI_SEMAINE_(new Date(dateISO)); // dateISO est déjà jour précis mais ok
  var creneau = CONFIG.CRENEAUX[slotKey];
  var start = new Date(lundi);
  start = AJOUTER_JOURS_(start, creneau.jour - 1);
  start.setHours(
    Math.floor(creneau.debut),
    Math.round((creneau.debut % 1) * 60)
  );
  var end = new Date(start);
  end.setHours(Math.floor(creneau.fin), Math.round((creneau.fin % 1) * 60));

  var title = "📚 " + subject + " - " + participants.length + " participants";
  var description = GENERER_DESCRIPTION_EVENEMENT_(participants, subject);

  var eventId = "";
  if (ligne !== -1 && data[ligne - 1][4]) {
    // update event
    eventId = data[ligne - 1][4];
    try {
      var ev = cal.getEventById(eventId);
      if (ev) {
        ev.setTitle(title);
        ev.setTime(start, end);
        ev.setDescription(description);
        ev.setLocation(creneau.lieu);
        // guests sync
        var currentGuests = ev.getGuestList().map(function (g) {
          return g.getEmail();
        });
        emails.forEach(function (mail) {
          if (currentGuests.indexOf(mail) === -1) ev.addGuest(mail);
        });
      }
    } catch (e) {
      Logger.log("⚠️ Impossible de récupérer l'événement, recréation : " + e);
      ligne = -1; // force création
    }
  }

  if (ligne === -1) {
    // create event
    var ev = cal.createEvent(title, start, end, {
      description: description,
      location: creneau.lieu,
      guests: emails.join(","),
      sendInvites: true,
    });
    eventId = ev.getId();

    // écrire nouvelle ligne GROUPES
    sheetGroupes.appendRow([
      dateISO,
      slotKey,
      subject,
      index,
      eventId,
      emails.join(";"),
      noms.join(";"),
      new Date(),
      new Date(),
      new Date().toISOString(),
    ]);
  } else {
    // mise à jour ligne existante
    sheetGroupes.getRange(ligne, 5, 1, 6).setValues([
      [
        eventId,
        emails.join(";"),
        noms.join(";"),
        data[ligne - 1][7], // CreatedAt reste
        new Date(),
        new Date().toISOString(),
      ],
    ]);
  }

  return eventId;
}

function ENVOYER_EMAIL_INVITATION_GROUPE_(groupe, dateISO, slotKey) {
  var creneau = CONFIG.CRENEAUX[slotKey];
  var tz = CONFIG.FUSEAU_HORAIRE;
  var dateAff = Utilities.formatDate(new Date(dateISO), tz, "dd/MM/yyyy");

  var html = GENERER_EMAIL_HEADER_("Groupe confirmé", "📅");
  html +=
    '<div class="card">' +
    "<h2>📅 Groupe confirmé — " +
    groupe.subject +
    "</h2>" +
    "<p><strong>Date :</strong> " +
    dateAff +
    "</p>" +
    "<p><strong>Créneau :</strong> " +
    creneau.nom +
    " (" +
    creneau.debut +
    "h - " +
    creneau.fin +
    "h)</p>" +
    "</div>";

  html +=
    '<div class="card"><h2>👥 Participants (' +
    groupe.participants.length +
    ")</h2>";
  groupe.participants.forEach(function (p) {
    html +=
      '<div class="info-line"><span class="info-label">' +
      p.prenom +
      " " +
      p.nom +
      ' :</span><span class="info-value">' +
      p.email +
      "</span></div>";
    if (p.commentaire) {
      html +=
        '<div class="info-line" style="margin-left:20px;"><em>"' +
        p.commentaire +
        '"</em></div>';
    }
  });
  html += "</div>";

  html += GENERER_EMAIL_FOOTER_();

  var to = groupe.participants
    .map(function (p) {
      return p.email;
    })
    .join(",");
  MailApp.sendEmail({
    to: to,
    subject: "📅 Groupe confirmé — " + groupe.subject + " — " + dateAff,
    htmlBody: html,
  });
}

function NOTIFIER_ADMIN_GROUPES_JOUR_(resumeHtml, dateISO) {
  var html =
    GENERER_EMAIL_HEADER_("Résumé planification", "📊") +
    resumeHtml +
    GENERER_EMAIL_FOOTER_();
  MailApp.sendEmail({
    to: CONFIG.EMAIL_ADMIN,
    subject: "📊 Planification groupes " + dateISO,
    htmlBody: html,
  });
}

/**
 * Relance le batch quotidien pour la date du jour (comme à 12h).
 */
function LANCER_BATCH_MIDI_MANUEL_AUJOURDHUI_() {
  try {
    var tz = CONFIG.FUSEAU_HORAIRE;
    var today = new Date();
    EXECUTER_BATCH_POUR_DATE_(today);
    try {
      SpreadsheetApp.getUi().alert(
        "Batch relancé pour le " +
          Utilities.formatDate(today, tz, "yyyy-MM-dd") +
          "."
      );
    } catch (uiErr) {
      // Contexte autonome: pas d'UI → fallback email/log
      try {
        MailApp.sendEmail({
          to: CONFIG.EMAIL_ADMIN,
          subject: "Batch relancé (manuel)",
          htmlBody:
            GENERER_EMAIL_HEADER_("Batch relancé", "🕒") +
            '<div class="card">Batch relancé pour le ' +
            Utilities.formatDate(today, tz, "yyyy-MM-dd") +
            ".</div>" +
            GENERER_EMAIL_FOOTER_(),
        });
      } catch (mailErr) {
        Logger.log(
          "Info: Batch relancé pour le " +
            Utilities.formatDate(today, tz, "yyyy-MM-dd")
        );
      }
    }
  } catch (e) {
    Logger.log("❌ Batch manuel ajd err: " + e);
    try {
      SpreadsheetApp.getUi().alert("Erreur: " + e);
    } catch (_) {
      try {
        MailApp.sendEmail({
          to: CONFIG.EMAIL_ADMIN,
          subject: "Erreur batch manuel aujourd'hui",
          htmlBody:
            GENERER_EMAIL_HEADER_("Erreur batch manuel", "❌") +
            '<div class="card"><pre>' + e + "</pre></div>" +
            GENERER_EMAIL_FOOTER_(),
        });
      } catch (__) {
        // noop
      }
    }
  }
}

/**
 * Demande une date (yyyy-mm-dd) et relance le batch pour cette date.
 */
function LANCER_BATCH_MIDI_MANUEL_DATE_() {
  var ui, resp, texte;
  try {
    ui = SpreadsheetApp.getUi();
    resp = ui.prompt(
      "Relancer le batch",
      "Entrez une date au format yyyy-mm-dd",
      ui.ButtonSet.OK_CANCEL
    );
    if (resp.getSelectedButton() !== ui.Button.OK) return;
    texte = resp.getResponseText().trim();
  } catch (uiErr) {
    // Contexte autonome: lire ADMIN!B3 comme source de vérité
    try {
      var ssId = PropertiesService.getScriptProperties().getProperty(
        CONFIG.PROPS.ID_SPREADSHEET
      );
      var ss = SpreadsheetApp.openById(ssId);
      var admin = ss.getSheetByName("ADMIN");
      texte = String(admin.getRange(3, 2).getValue() || "").trim();
    } catch (e) {
      Logger.log("⚠️ Impossible de lire ADMIN!B3 pour la date: " + e);
      return;
    }
  }
  var parts = texte.split("-");
  if (parts.length !== 3) {
    try {
      SpreadsheetApp.getUi().alert("Format invalide. Exemple: 2025-10-06");
    } catch (_) {
      Logger.log("Format invalide. Exemple: 2025-10-06");
    }
    return;
  }
  var y = parseInt(parts[0], 10);
  var m = parseInt(parts[1], 10) - 1; // 0-based
  var d = parseInt(parts[2], 10);
  var dateJS = new Date(y, m, d, 12, 0, 0, 0);
  EXECUTER_BATCH_POUR_DATE_(dateJS);
  try {
    SpreadsheetApp.getUi().alert("Batch relancé pour le " + texte + ".");
  } catch (_) {
    try {
      MailApp.sendEmail({
        to: CONFIG.EMAIL_ADMIN,
        subject: "Batch relancé (manuel) pour " + texte,
        htmlBody:
          GENERER_EMAIL_HEADER_("Batch relancé", "🕒") +
          '<div class="card">Batch relancé pour le ' + texte + ".</div>" +
          GENERER_EMAIL_FOOTER_(),
      });
    } catch (__) {
      Logger.log("Batch relancé pour le " + texte + ".");
    }
  }
}

/**
 * Exécute la planification des groupes pour une date donnée (équivalent 12h).
 * Ne tient pas compte du week-end (permet de rejouer au besoin).
 */
function EXECUTER_BATCH_POUR_DATE_(dateJS) {
  try {
    var tz = CONFIG.FUSEAU_HORAIRE;
    var dateISO = Utilities.formatDate(dateJS, tz, "yyyy-MM-dd");

    var slots = OBTENIR_SLOTS_DU_JOUR_(dateJS);
    if (slots.length === 0) {
      Logger.log("Aucun créneau pour cette date: " + dateISO);
      return;
    }

    var ssId = PropertiesService.getScriptProperties().getProperty(
      CONFIG.PROPS.ID_SPREADSHEET
    );
    var ss = SpreadsheetApp.openById(ssId);
    // S’auto-réparer si ADMIN absent
    var sheetAdmin = ss.getSheetByName("ADMIN");
    if (!sheetAdmin) {
      sheetAdmin = ss.insertSheet("ADMIN");
      sheetAdmin.getRange(1, 1).setValue("Action").setFontWeight("bold");
      sheetAdmin.getRange(1, 2).setValue("Paramètre").setFontWeight("bold");
      sheetAdmin.getRange(2, 1).setValue("Relancer batch aujourd'hui");
      sheetAdmin.getRange(3, 1).setValue("Relancer batch pour date (yyyy-mm-dd)");
      sheetAdmin.getRange(3, 2).setValue(
        Utilities.formatDate(new Date(), CONFIG.FUSEAU_HORAIRE, "yyyy-MM-dd")
      );
      sheetAdmin.getRange(2, 1).insertCheckboxes();
      sheetAdmin.getRange(3, 1).insertCheckboxes();
      sheetAdmin.setFrozenRows(1);
      sheetAdmin.autoResizeColumns(1, 2);
    }

    var sheetRep = ss.getSheetByName(CONFIG.ONGLETS.REPONSES);
    var sheetGroupes = ss.getSheetByName("GROUPES");
    var calId = PropertiesService.getScriptProperties().getProperty(
      CONFIG.PROPS.ID_CALENDAR
    );

    var resume = '<div class="card"><h2>Batch manuel ' + dateISO + "</h2>";

    slots.forEach(function (slotKey) {
      var candidats = CHARGER_CANDIDATS_POUR_SLOT_(sheetRep, slotKey, dateJS);
      // Diagnostics
      try {
        Logger.log(
          "[Diag] " +
            slotKey +
            ": candidats=" +
            candidats.length +
            ", emails=" +
            candidats
              .map(function (c) {
                return (c.prenom || "") + " " + (c.nom || "") + " <" + c.email + ">";
              })
              .join(", ")
        );
      } catch (e) {
        Logger.log("[Diag] erreur log candidats: " + e);
      }

      var groupes = FORMER_GROUPES_POUR_SLOT_(candidats);
      try {
        Logger.log(
          "[Diag] " + slotKey + ": groupes formés=" + groupes.length
        );
        groupes.forEach(function (g, idx) {
          var participants = g.participants
            .map(function (p) {
              return (p.prenom || "") + " " + (p.nom || "");
            })
            .join(", ");
          Logger.log(
            "[Diag]   G" + (idx + 1) + " subject='" + g.subject + "' => " + participants
          );
        });
      } catch (e) {
        Logger.log("[Diag] erreur log groupes: " + e);
      }

      resume += "<h3>" + slotKey + " — " + groupes.length + " groupe(s)</h3>";
      groupes.forEach(function (g, idx) {
        UPSERT_EVENEMENT_ET_PERSISTANCE_(
          dateISO,
          slotKey,
          g.subject,
          idx + 1,
          g.participants,
          calId,
          sheetGroupes
        );
        ENVOYER_EMAIL_INVITATION_GROUPE_(g, dateISO, slotKey);

        resume +=
          "<p><strong>G" +
          (idx + 1) +
          " (" +
          g.participants.length +
          ")</strong> : " +
          g.subject +
          "</p>";
      });
    });

    resume += "</div>";
    NOTIFIER_ADMIN_GROUPES_JOUR_(resume, dateISO);
    ECRIRE_AUDIT_("BATCH_MANUEL_OK", { date: dateISO, slots: slots.length });
  } catch (e) {
    Logger.log("❌ Batch manuel error: " + e);
    ECRIRE_AUDIT_("BATCH_MANUEL_ERR", e.toString());
  }
}

/**
 * Vérifie l’onglet ADMIN et exécute les actions si cochées, puis décoche.
 */
function POLLER_BATCH_ADMIN_() {
  try {
    var ssId = PropertiesService.getScriptProperties().getProperty(
      CONFIG.PROPS.ID_SPREADSHEET
    );
    if (!ssId) return;
    var ss = SpreadsheetApp.openById(ssId);
    var admin = ss.getSheetByName("ADMIN");
    if (!admin) return;

    var tz = CONFIG.FUSEAU_HORAIRE;
    var today = new Date();

    // A2: relancer aujourd’hui (case à cocher)
    var relancerAuj = admin.getRange(2, 1).getValue() === true;
    if (relancerAuj) {
      EXECUTER_BATCH_POUR_DATE_(today);
      admin.getRange(2, 1).setValue(false);
    }

    // A3: relancer pour date, B3: yyyy-mm-dd
    var relancerDate = admin.getRange(3, 1).getValue() === true;
    if (relancerDate) {
      var txt = String(admin.getRange(3, 2).getValue() || "").trim();
      var parts = txt.split("-");
      if (parts.length === 3) {
        var y = parseInt(parts[0], 10);
        var m = parseInt(parts[1], 10) - 1;
        var d = parseInt(parts[2], 10);
        var dateJS = new Date(y, m, d, 12, 0, 0, 0);
        EXECUTER_BATCH_POUR_DATE_(dateJS);
      }
      admin.getRange(3, 1).setValue(false);
    }
  } catch (e) {
    Logger.log("⚠️ Poller ADMIN error: " + e);
  }
}

// Mise à jour de PLANIFIER_GROUPES_DU_JOUR_ pour appeler les fonctions ci-dessus
function PLANIFIER_GROUPES_DU_JOUR_() {
  try {
    var tz = CONFIG.FUSEAU_HORAIRE;
    var today = new Date();
    var dateISO = Utilities.formatDate(today, tz, "yyyy-MM-dd");
    var day = Utilities.formatDate(today, tz, "u");
    if (day == "6" || day == "7") return; // weekend

    var slots = OBTENIR_SLOTS_DU_JOUR_(today);
    if (slots.length === 0) return;

    var ssId = PropertiesService.getScriptProperties().getProperty(
      CONFIG.PROPS.ID_SPREADSHEET
    );
    var ss = SpreadsheetApp.openById(ssId);
    var sheetRep = ss.getSheetByName(CONFIG.ONGLETS.REPONSES);
    var sheetGroupes = ss.getSheetByName("GROUPES");
    var calId = PropertiesService.getScriptProperties().getProperty(
      CONFIG.PROPS.ID_CALENDAR
    );

    var resume = '<div class="card"><h2>Récapitulatif du ' + dateISO + "</h2>";

    slots.forEach(function (slotKey) {
      var candidats = CHARGER_CANDIDATS_POUR_SLOT_(sheetRep, slotKey);
      var groupes = FORMER_GROUPES_POUR_SLOT_(candidats);

      resume += "<h3>" + slotKey + " — " + groupes.length + " groupe(s)</h3>";
      groupes.forEach(function (g, idx) {
        UPSERT_EVENEMENT_ET_PERSISTANCE_(
          dateISO,
          slotKey,
          g.subject,
          idx + 1,
          g.participants,
          calId,
          sheetGroupes
        );
        ENVOYER_EMAIL_INVITATION_GROUPE_(g, dateISO, slotKey);

        resume +=
          "<p><strong>G" +
          (idx + 1) +
          " (" +
          g.participants.length +
          ")</strong> : " +
          g.subject +
          "</p>";
      });
    });

    resume += "</div>";
    NOTIFIER_ADMIN_GROUPES_JOUR_(resume, dateISO);

    ECRIRE_AUDIT_("BATCH_MIDI_OK", { date: dateISO, slots: slots.length });
  } catch (e) {
    Logger.log("❌ Batch midi error : " + e);
    ECRIRE_AUDIT_("BATCH_MIDI_ERR", e.toString());
  }
}

/** =====================================================================
 * 🧪 UTILITAIRE DE TEST : génère des groupes factices pour un jour ouvré
 * ---------------------------------------------------------------------
 * Permet de tester la logique de création d'événements sans attendre 12h.
 * 1. Crée trois faux étudiants avec des matières / créneaux du jour.
 * 2. Exécute le pipeline complet de planification pour todayForced.
 * --------------------------------------------------------------------*/
function TEST_GENERATION_INVITATIONS() {
  Logger.log("🧪 DÉMARRAGE DU TEST DE GÉNÉRATION D'INVITATIONS");

  try {
    var tz = CONFIG.FUSEAU_HORAIRE;

    // Forcer la date à un prochain jour ouvré (lundi par exemple)
    var now = new Date();
    var day = now.getDay(); // 0=dim
    var delta = day === 0 ? 1 : day >= 6 ? 8 - day : 0; // next lundi si week-end
    var testDate = AJOUTER_JOURS_(now, delta);
    testDate.setHours(12, 0, 0, 0);

    Logger.log(
      "🧪 TEST à la date forcée : " +
        Utilities.formatDate(testDate, tz, "yyyy-MM-dd HH:mm")
    );

    // Insérer trois réponses factices dans l'onglet Réponses
    var ssId = PropertiesService.getScriptProperties().getProperty(
      CONFIG.PROPS.ID_SPREADSHEET
    );

    if (!ssId) {
      Logger.log("❌ ID Spreadsheet non trouvé dans les propriétés");
      return;
    }

    var ss = SpreadsheetApp.openById(ssId);
    var sheetRep = ss.getSheetByName(CONFIG.ONGLETS.REPONSES);

    if (!sheetRep) {
      Logger.log("❌ Onglet Réponses non trouvé");
      return;
    }

    var timestamp = new Date();

    // Données fictives avec la structure complète des 25 colonnes
    var rowsFake = [
      [
        timestamp, // 1. Horodateur
        "alice@test.com", // 2. Adresse e-mail
        "Alice", // 3. Prénom
        "Test", // 4. Nom
        "[B3] Bachelor 3", // 5. Niveau
        "[L3A] Groupe A", // 6. Groupe
        "Mathématiques", // 7. Matière 1
        "Révisions", // 8. Type 1
        "🤔 J'ai besoin d'aide", // 9. Accompagnement 1
        "Physique", // 10. Matière 2
        "Révisions", // 11. Type 2
        "🤔 J'ai besoin d'aide", // 12. Accompagnement 2
        "Aucune autre matière", // 13. Matière 3
        "", // 14. Type 3
        "", // 15. Accompagnement 3
        "Aucune autre matière", // 16. Matière 4
        "", // 17. Type 4
        "", // 18. Accompagnement 4
        "Oui", // 19. Jeudi Campus
        "Oui", // 20. Lundi Discord
        "Oui", // 21. Mardi Discord
        "", // 22. Mercredi Discord
        "", // 23. Jeudi Discord
        "", // 24. Vendredi Discord
        "Disponible pour les tests", // 25. Commentaire
      ],
      [
        timestamp, // 1. Horodateur
        "bob@test.com", // 2. Adresse e-mail
        "Bob", // 3. Prénom
        "Test", // 4. Nom
        "[B3] Bachelor 3", // 5. Niveau
        "[L3A] Groupe A", // 6. Groupe
        "Mathématiques", // 7. Matière 1
        "Révisions", // 8. Type 1
        "🤔 J'ai besoin d'aide", // 9. Accompagnement 1
        "Physique", // 10. Matière 2
        "Révisions", // 11. Type 2
        "🤔 J'ai besoin d'aide", // 12. Accompagnement 2
        "Aucune autre matière", // 13. Matière 3
        "", // 14. Type 3
        "", // 15. Accompagnement 3
        "Aucune autre matière", // 16. Matière 4
        "", // 17. Type 4
        "", // 18. Accompagnement 4
        "Oui", // 19. Jeudi Campus
        "Oui", // 20. Lundi Discord
        "Oui", // 21. Mardi Discord
        "", // 22. Mercredi Discord
        "", // 23. Jeudi Discord
        "", // 24. Vendredi Discord
        "Prêt pour les tests", // 25. Commentaire
      ],
      [
        timestamp, // 1. Horodateur
        "carla@test.com", // 2. Adresse e-mail
        "Carla", // 3. Prénom
        "Test", // 4. Nom
        "[B3] Bachelor 3", // 5. Niveau
        "[L3A] Groupe A", // 6. Groupe
        "Mathématiques", // 7. Matière 1
        "Révisions", // 8. Type 1
        "🤔 J'ai besoin d'aide", // 9. Accompagnement 1
        "Physique", // 10. Matière 2
        "Révisions", // 11. Type 2
        "🤔 J'ai besoin d'aide", // 12. Accompagnement 2
        "Aucune autre matière", // 13. Matière 3
        "", // 14. Type 3
        "", // 15. Accompagnement 3
        "Aucune autre matière", // 16. Matière 4
        "", // 17. Type 4
        "", // 18. Accompagnement 4
        "Oui", // 19. Jeudi Campus
        "Oui", // 20. Lundi Discord
        "Oui", // 21. Mardi Discord
        "", // 22. Mercredi Discord
        "", // 23. Jeudi Discord
        "", // 24. Vendredi Discord
        "Motivée pour les tests", // 25. Commentaire
      ],
    ];

    // Ajouter les données fictives
    sheetRep
      .getRange(
        sheetRep.getLastRow() + 1,
        1,
        rowsFake.length,
        rowsFake[0].length
      )
      .setValues(rowsFake);

    Logger.log(
      "✅ Données fictives ajoutées : 3 participants avec Mathématiques et Physique"
    );

    // Forcer la date pour bypasser les restrictions de jours
    // Modifier temporairement la fonction PLANIFIER_GROUPES_DU_JOUR_ pour accepter une date forcée
    Logger.log("🧪 Exécution de la planification des groupes...");

    // Appeler directement la logique de planification en forçant la date
    var dateISO = Utilities.formatDate(testDate, tz, "yyyy-MM-dd");
    var slots = OBTENIR_SLOTS_DU_JOUR_(testDate);

    Logger.log("📅 Slots disponibles : " + slots.length);

    var calId = PropertiesService.getScriptProperties().getProperty(
      CONFIG.PROPS.ID_CALENDAR
    );
    var sheetGroupes = ss.getSheetByName("GROUPES");

    if (!sheetGroupes) {
      Logger.log("❌ Onglet GROUPES non trouvé");
      return;
    }

    var totalGroupes = 0;

    // Traiter chaque slot
    for (var i = 0; i < slots.length; i++) {
      var slotKey = slots[i];
      Logger.log("🔄 Traitement du slot : " + slotKey);

      // Charger les candidats pour ce slot
      var candidats = CHARGER_CANDIDATS_POUR_SLOT_(sheetRep, slotKey);
      Logger.log("👥 Candidats trouvés : " + candidats.length);

      if (candidats.length >= 2) {
        // Former les groupes
        var groupes = FORMER_GROUPES_POUR_SLOT_(candidats);
        Logger.log("📚 Groupes formés : " + groupes.length);

        // Créer les événements et envoyer les invitations
        for (var j = 0; j < groupes.length; j++) {
          var groupe = groupes[j];
          Logger.log(
            "🎯 Groupe " +
              (j + 1) +
              " : " +
              groupe.participants.length +
              " participants"
          );

          // Upsert événement
          var eventId = UPSERT_EVENEMENT_ET_PERSISTANCE_(
            dateISO,
            slotKey,
            groupe.subject,
            j + 1,
            groupe.participants,
            calId,
            sheetGroupes
          );

          if (eventId) {
            Logger.log("✅ Événement créé/mis à jour : " + eventId);

            // Envoyer email d'invitation
            ENVOYER_EMAIL_INVITATION_GROUPE_(groupe, dateISO, slotKey);

            totalGroupes++;
          }
        }
      } else {
        Logger.log("⚠️ Pas assez de candidats pour le slot " + slotKey);
      }
    }

    // Notifier l'admin
    var resumeHtml =
      "<h2>🧪 Test de génération d'invitations</h2>" +
      "<p><strong>Date du test :</strong> " +
      dateISO +
      "</p>" +
      "<p><strong>Groupes formés :</strong> " +
      totalGroupes +
      "</p>" +
      "<p><strong>Participants test :</strong> Alice, Bob, Carla</p>" +
      "<p><strong>Matières communes :</strong> Mathématiques, Physique</p>";

    NOTIFIER_ADMIN_GROUPES_JOUR_(resumeHtml, dateISO);

    Logger.log("✅ TEST terminé : " + totalGroupes + " groupes formés");
    Logger.log("📧 Vérifiez vos emails et le calendrier Google");
  } catch (error) {
    Logger.log("❌ Erreur lors du test : " + error.toString());
  }
}

/**
 * 🧪 TEST_RAPPORT_HEBDO_()
 * -----------------------------------------------------------------
 * Utilitaire pour forcer immédiatement la génération du rapport hebdomadaire.
 * Exécute simplement GENERER_RAPPORT_HEBDOMADAIRE().
 */
function TEST_RAPPORT_HEBDO_() {
  Logger.log("🧪 Lancement du rapport hebdomadaire (test)…");
  try {
    GENERER_RAPPORT_HEBDOMADAIRE_();
    Logger.log("✅ Rapport hebdomadaire généré et envoyé (test)");
  } catch (e) {
    Logger.log("❌ Erreur test rapport hebdo : " + e.toString());
  }
}

/**
 * 🔧 NETTOYER_DONNEES_FICTIVES_TEST_()
 * -----------------------------------------------------------------
 * Supprime les données générées par TEST_GENERATION_INVITATIONS() :
 * - Lignes de l'onglet Réponses pour les emails de test
 * - Lignes de l'onglet GROUPES contenant ces emails
 * - Événements Calendar référencés par EventId pour ces lignes
 */
function NETTOYER_DONNEES_FICTIVES_TEST_() {
  Logger.log("🧹 Nettoyage des données fictives de test…");

  try {
    var props = PropertiesService.getScriptProperties();
    var ssId = props.getProperty(CONFIG.PROPS.ID_SPREADSHEET);
    var calId = props.getProperty(CONFIG.PROPS.ID_CALENDAR);
    if (!ssId) {
      Logger.log("❌ Pas de Spreadsheet configuré");
      return;
    }

    var emailsTest = {
      "alice@test.com": true,
      "bob@test.com": true,
      "carla@test.com": true,
    };

    var ss = SpreadsheetApp.openById(ssId);

    // 1) Nettoyage onglet Réponses
    var sheetRep = ss.getSheetByName(CONFIG.ONGLETS.REPONSES);
    if (sheetRep && sheetRep.getLastRow() > 1) {
      var dataRep = sheetRep.getDataRange().getValues();
      var colEmail = CONFIG.COLONNES_REPONSES.EMAIL - 1;
      var colComment = CONFIG.COLONNES_REPONSES.COMMENTAIRE - 1;
      var supprimées = 0;
      for (var i = dataRep.length - 1; i >= 1; i--) {
        var email = String(dataRep[i][colEmail] || "").toLowerCase();
        var comment = String(dataRep[i][colComment] || "");
        var isTest = emailsTest[email] || /\btest\b/i.test(comment);
        if (isTest) {
          sheetRep.deleteRow(i + 1);
          supprimées++;
        }
      }
      Logger.log("✅ Réponses supprimées: " + supprimées);
    }

    // 2) Nettoyage onglet GROUPES + Calendar
    var sheetGroupes = ss.getSheetByName("GROUPES");
    if (sheetGroupes && sheetGroupes.getLastRow() > 1) {
      var cal = calId ? CalendarApp.getCalendarById(calId) : null;
      var dataG = sheetGroupes.getDataRange().getValues();
      var supGroupes = 0;
      for (var r = dataG.length - 1; r >= 1; r--) {
        var participantEmails = String(dataG[r][5] || ""); // ParticipantEmails col 6
        var hasTest = participantEmails
          .toLowerCase()
          .split(";")
          .some(function (m) {
            return emailsTest[m.trim()];
          });
        if (hasTest) {
          // tenter suppression de l'événement si possible
          var eventId = String(dataG[r][4] || ""); // EventId col 5
          if (cal && eventId) {
            try {
              var ev = cal.getEventById(eventId);
              if (ev) ev.deleteEvent();
            } catch (e) {
              Logger.log("⚠️ Impossible de supprimer l'événement " + eventId + ": " + e);
            }
          }
          sheetGroupes.deleteRow(r + 1);
          supGroupes++;
        }
      }
      Logger.log("✅ GROUPES nettoyés: " + supGroupes);
    }

    ECRIRE_AUDIT_("NETTOYAGE_TEST", { status: "OK" });
    Logger.log("🧹 Nettoyage terminé");
  } catch (e) {
    Logger.log("❌ Erreur nettoyage test: " + e);
    ECRIRE_AUDIT_("NETTOYAGE_TEST_ERR", e.toString());
  }
}

/**
 * 🔧 FONCTION DE MIGRATION : Corriger les en-têtes de l'onglet Réponses
 *
 * Cette fonction corrige les en-têtes d'un onglet Réponses existant
 * pour qu'ils correspondent exactement aux 25 colonnes standardisées.
 *
 * ═══════════════════════════════════════════════════════════════════════
 */
function CORRIGER_ENTETES_REPONSES_() {
  Logger.log("🔧 CORRECTION DES EN-TÊTES RÉPONSES");

  try {
    var props = PropertiesService.getScriptProperties();
    var ssId = props.getProperty(CONFIG.PROPS.ID_SPREADSHEET);

    if (!ssId) {
      Logger.log("❌ ID Spreadsheet non trouvé dans les propriétés");
      return;
    }

    var ss = SpreadsheetApp.openById(ssId);
    var sheetReponses = ss.getSheetByName(CONFIG.ONGLETS.REPONSES);

    if (!sheetReponses) {
      Logger.log("❌ Onglet Réponses non trouvé");
      return;
    }

    // Vérifier et corriger les en-têtes
    var entetesActuels = sheetReponses
      .getRange(1, 1, 1, sheetReponses.getLastColumn())
      .getValues()[0];
    var entetesAttendus = CONFIG.HEADERS_REPONSES;

    Logger.log("📊 En-têtes actuels : " + entetesActuels.length + " colonnes");
    Logger.log(
      "📊 En-têtes attendus : " + entetesAttendus.length + " colonnes"
    );

    // Vérifier si correction nécessaire
    var correctionNecessaire = false;
    if (entetesActuels.length !== entetesAttendus.length) {
      correctionNecessaire = true;
    } else {
      for (var i = 0; i < entetesActuels.length; i++) {
        if (entetesActuels[i] !== entetesAttendus[i]) {
          correctionNecessaire = true;
          break;
        }
      }
    }

    if (correctionNecessaire) {
      // GARDE-FOU: si des données existent (lignes > 1), ne rien modifier
      var lastRow = sheetReponses.getLastRow();
      if (lastRow > 1) {
        Logger.log(
          "🛡️ Garde-fou: en-têtes non conformes mais des données existent (" +
            (lastRow - 1) +
            ") → Aucune modification appliquée."
        );
        return;
      }

      Logger.log("🔧 Correction des en-têtes nécessaire (feuille vide)");

      // Effacer la première ligne et la recréer
      sheetReponses.getRange(1, 1, 1, sheetReponses.getLastColumn()).clear();

      // Appliquer les nouveaux en-têtes
      sheetReponses
        .getRange(1, 1, 1, CONFIG.HEADERS_REPONSES.length)
        .setValues([CONFIG.HEADERS_REPONSES])
        .setFontWeight("bold")
        .setBackground("#4285f4")
        .setFontColor("#ffffff");

      sheetReponses.setFrozenRows(1);
      sheetReponses.autoResizeColumns(1, CONFIG.HEADERS_REPONSES.length);

      Logger.log("✅ En-têtes corrigés avec succès");
    } else {
      Logger.log("✅ En-têtes déjà corrects");
    }
  } catch (error) {
    Logger.log(
      "❌ Erreur lors de la correction des en-têtes : " + error.toString()
    );
  }
}

/**
 * 🔧 FONCTION DE VÉRIFICATION : Vérifier et insérer les colonnes manquantes
 *
 * Cette fonction vérifie qu'un onglet a le bon nombre de colonnes
 * et insère les colonnes manquantes si nécessaire.
 *
 * @param {Sheet} sheet - L'onglet à vérifier
 * @param {number} nombreColonnesAttendu - Le nombre de colonnes attendu
 * @returns {boolean} - true si des colonnes ont été ajoutées
 *
 * ═══════════════════════════════════════════════════════════════════════
 */
function VERIFIER_ET_INSERER_COLONNES_MANQUANTES_(
  sheet,
  nombreColonnesAttendu
) {
  try {
    var nombreColonnesActuelles = sheet.getLastColumn();

    if (nombreColonnesActuelles < nombreColonnesAttendu) {
      var colonnesAManquer = nombreColonnesAttendu - nombreColonnesActuelles;

      Logger.log(
        "🔧 Insertion de " + colonnesAManquer + " colonnes manquantes"
      );

      // Insérer les colonnes manquantes après la dernière colonne existante
      sheet.insertColumnsAfter(nombreColonnesActuelles, colonnesAManquer);

      return true;
    }

    return false;
  } catch (error) {
    Logger.log(
      "❌ Erreur lors de l'insertion des colonnes : " + error.toString()
    );
    return false;
  }
}

/**
 * 🔧 FONCTION DE VALIDATION : Valider le nombre de colonnes lors de l'ajout de nouvelles lignes
 *
 * Cette fonction valide qu'une ligne à ajouter a le bon nombre de colonnes
 * avant de l'insérer dans la feuille.
 *
 * @param {Sheet} sheet - L'onglet où ajouter la ligne
 * @param {Array} ligne - La ligne à ajouter
 * @param {number} nombreColonnesAttendu - Le nombre de colonnes attendu
 * @returns {boolean} - true si la ligne a été ajoutée avec succès
 *
 * ═══════════════════════════════════════════════════════════════════════
 */
function VALIDER_ET_AJOUTER_LIGNE_(sheet, ligne, nombreColonnesAttendu) {
  try {
    if (ligne.length !== nombreColonnesAttendu) {
      Logger.log(
        "❌ Le nombre de colonnes de la ligne (" +
          ligne.length +
          ") ne correspond pas aux en-têtes (" +
          nombreColonnesAttendu +
          ")"
      );
      return false;
    }

    sheet.appendRow(ligne);
    return true;
  } catch (error) {
    Logger.log("❌ Erreur lors de l'ajout de la ligne : " + error.toString());
    return false;
  }
}

/**
 * 🔧 FONCTION DE MIGRATION COMPLÈTE : Corriger tous les onglets Réponses et Archive
 *
 * Cette fonction corrige complètement la structure des onglets Réponses et Archive
 * pour qu'ils correspondent aux 25 colonnes standardisées.
 *
 * ═══════════════════════════════════════════════════════════════════════
 */
function MIGRER_STRUCTURE_SPREADSHEET_() {
  Logger.log("🔧 MIGRATION COMPLÈTE DE LA STRUCTURE SPREADSHEET");

  try {
    var props = PropertiesService.getScriptProperties();
    var ssId = props.getProperty(CONFIG.PROPS.ID_SPREADSHEET);

    if (!ssId) {
      Logger.log("❌ ID Spreadsheet non trouvé dans les propriétés");
      return;
    }

    var ss = SpreadsheetApp.openById(ssId);

    // Corriger l'onglet Réponses
    var sheetReponses = ss.getSheetByName(CONFIG.ONGLETS.REPONSES);
    if (sheetReponses) {
      Logger.log("🔧 Correction de l'onglet Réponses");
      VERIFIER_ET_INSERER_COLONNES_MANQUANTES_(
        sheetReponses,
        CONFIG.HEADERS_REPONSES.length
      );

      // Appliquer les en-têtes corrects
      sheetReponses
        .getRange(1, 1, 1, CONFIG.HEADERS_REPONSES.length)
        .setValues([CONFIG.HEADERS_REPONSES])
        .setFontWeight("bold")
        .setBackground("#4285f4")
        .setFontColor("#ffffff");

      sheetReponses.setFrozenRows(1);
      sheetReponses.autoResizeColumns(1, CONFIG.HEADERS_REPONSES.length);
    }

    // Corriger l'onglet Archive
    var sheetArchive = ss.getSheetByName(CONFIG.ONGLETS.ARCHIVE);
    if (sheetArchive) {
      Logger.log("🔧 Correction de l'onglet Archive");
      // GARDE-FOU: ne modifier les en-têtes QUE si la feuille est vide (1 seule ligne)
      var lastRowArchive = sheetArchive.getLastRow();
      if (lastRowArchive > 1) {
        Logger.log(
          "🛡️ Garde-fou Archive: données présentes (" +
            (lastRowArchive - 1) +
            ") → aucun changement sur les en-têtes."
        );
      } else {
        VERIFIER_ET_INSERER_COLONNES_MANQUANTES_(
          sheetArchive,
          CONFIG.HEADERS_REPONSES.length
        );

        // Appliquer les en-têtes corrects
        sheetArchive
          .getRange(1, 1, 1, CONFIG.HEADERS_REPONSES.length)
          .setValues([CONFIG.HEADERS_REPONSES])
          .setFontWeight("bold")
          .setBackground("#9e9e9e")
          .setFontColor("#ffffff");

        sheetArchive.setFrozenRows(1);
        sheetArchive.autoResizeColumns(1, CONFIG.HEADERS_REPONSES.length);
      }
    }

    Logger.log("✅ Migration complète terminée avec succès");
  } catch (error) {
    Logger.log("❌ Erreur lors de la migration : " + error.toString());
  }
}

/**
 * 🔍 DIAGNOSTIC : Vérifier le quota d'emails restant
 *
 * Cette fonction vérifie le quota d'emails quotidien et affiche
 * les informations de quota pour éviter l'erreur "too many times".
 *
 * ═══════════════════════════════════════════════════════════════════════
 */
function VERIFIER_QUOTA_EMAILS() {
  try {
    var quota = MailApp.getRemainingDailyQuota();
    Logger.log("📧 Quota d'emails restant aujourd'hui : " + quota);

    if (quota < 10) {
      Logger.log(
        "⚠️ ATTENTION : Quota faible ! Seulement " + quota + " emails restants"
      );
      Logger.log(
        "💡 Recommandation : Attendez demain ou optimisez l'envoi d'emails"
      );
    } else if (quota < 50) {
      Logger.log("⚠️ Quota modéré : " + quota + " emails restants");
    } else {
      Logger.log("✅ Quota suffisant : " + quota + " emails restants");
    }

    return quota;
  } catch (error) {
    Logger.log(
      "❌ Erreur lors de la vérification du quota : " + error.toString()
    );
    return -1;
  }
}

/**
 * 🧪 TEST SANS EMAILS : Version allégée pour les tests
 *
 * Cette fonction teste la logique de regroupement sans envoyer d'emails
 * pour éviter de consommer le quota quotidien.
 *
 * ═══════════════════════════════════════════════════════════════════════
 */
function TEST_SANS_EMAILS() {
  Logger.log("🧪 TEST SANS EMAILS - Vérification de la logique uniquement");

  try {
    // Vérifier le quota d'abord
    var quota = VERIFIER_QUOTA_EMAILS();
    if (quota < 5) {
      Logger.log("❌ Quota insuffisant pour les tests. Attendez demain.");
      return;
    }

    var tz = CONFIG.FUSEAU_HORAIRE;
    var now = new Date();
    var day = now.getDay();
    var delta = day === 0 ? 1 : day >= 6 ? 8 - day : 0;
    var testDate = AJOUTER_JOURS_(now, delta);
    testDate.setHours(12, 0, 0, 0);

    Logger.log(
      "🧪 TEST à la date : " +
        Utilities.formatDate(testDate, tz, "yyyy-MM-dd HH:mm")
    );

    var ssId = PropertiesService.getScriptProperties().getProperty(
      CONFIG.PROPS.ID_SPREADSHEET
    );
    if (!ssId) {
      Logger.log("❌ ID Spreadsheet non trouvé");
      return;
    }

    var ss = SpreadsheetApp.openById(ssId);
    var sheetRep = ss.getSheetByName(CONFIG.ONGLETS.REPONSES);
    if (!sheetRep) {
      Logger.log("❌ Onglet Réponses non trouvé");
      return;
    }

    // Simuler la logique sans envoyer d'emails
    var dateISO = Utilities.formatDate(testDate, tz, "yyyy-MM-dd");
    var slots = OBTENIR_SLOTS_DU_JOUR_(testDate);

    Logger.log("📅 Slots disponibles : " + slots.length);

    var totalGroupes = 0;

    for (var i = 0; i < slots.length; i++) {
      var slotKey = slots[i];
      Logger.log("🔄 Traitement du slot : " + slotKey);

      var candidats = CHARGER_CANDIDATS_POUR_SLOT_(sheetRep, slotKey);
      Logger.log("👥 Candidats trouvés : " + candidats.length);

      if (candidats.length >= 2) {
        var groupes = FORMER_GROUPES_POUR_SLOT_(candidats);
        Logger.log("📚 Groupes formés : " + groupes.length);

        for (var j = 0; j < groupes.length; j++) {
          var groupe = groupes[j];
          Logger.log(
            "🎯 Groupe " +
              (j + 1) +
              " : " +
              groupe.participants.length +
              " participants"
          );
          Logger.log("   Matière commune : " + groupe.subject);
          Logger.log(
            "   Participants : " +
              groupe.participants
                .map(function (p) {
                  return p.prenom + " " + p.nom;
                })
                .join(", ")
          );
          totalGroupes++;
        }
      } else {
        Logger.log("⚠️ Pas assez de candidats pour le slot " + slotKey);
      }
    }

    Logger.log(
      "✅ TEST SANS EMAILS terminé : " + totalGroupes + " groupes simulés"
    );
    Logger.log(
      "💡 Pour tester avec emails, utilisez TEST_GENERATION_INVITATIONS() quand le quota est suffisant"
    );
  } catch (error) {
    Logger.log("❌ Erreur lors du test : " + error.toString());
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════
 * ✅ FIN DU CODE
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * Version : 3.1.0
 * Compatible : Google Apps Script (V8 Runtime)

 * 👨‍💻 AUTEUR
 * Anthony F. - Développeur du système
 * https://github.com/Anthony-Faria-dos-santos
 * Si tu a aimé ce projet, lâche une ⭐️ sur mon repo 😉 🙏🏼
 * 
 * Testé le : 2025-10-04
 *
 * ÉTAPES D'INITIALISATION DU PROJET :
 * 1. Modifier CONFIG.EMAIL_ADMIN // mail de l'administrateur
 * 2. Exécuter CONFIG_INITIALE()
 * 3. Exécuter DEMARRER_SYSTEME()
 * 4. Exécuter TEST_COMPLET()
 * 5. Partager le lien du formulaire aux étudiants
 * 
 * ═══════════════════════════════════════════════════════════════════════
 */
