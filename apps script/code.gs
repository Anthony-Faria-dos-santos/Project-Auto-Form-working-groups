// Script pour créer automatiquement des formulaires d'inscription hebdomadaires
// Auteur : Anthony F.
//
// Ce script :
//  - Crée un nouveau formulaire Google Form chaque dimanche pour la semaine suivante
//  - Limite à une seule réponse par personne et par semaine / permet de modifier sa soumission précédente
//  - Crée automatiquement des événements dans Google Calendar quand les gens s'inscrivent
//
// MEMO __Initialisation du script :
// 1) Via  https://script.google.com creer un nouveau projet
// 2) Remplacez le contenu par ce code
// 3) Lancez la fonction demarrerScript() une seule fois et Exécuter
//    Le script va créer l'agenda "Groupe de Travail" et tout préparer automatiquement
// 4) Chaque dimanche à 9h, un nouveau formulaire sera créé automatiquement

// LE 29/09/25 == Phase de test et correctifs

// ===== CONFIGURATION - valeurs ajustables =====
const NOM_AGENDA = "Groupe de Travail"; // Nom de l'agenda
const DEBUT_TITRE_FORM = "Groupe d'étude – Semaine"; // Début du nom des formulaires
const FUSEAU_HORAIRE = Session.getScriptTimeZone() || "Europe/Paris"; // Fuseau horaire

// Matières disponibles dans le formulaire (valeurs ajustables)
const MATIERES = [
  "Mathématiques",
  "Systèmes d'information et bases de données",
  "Anglais / TOEIC exam",
  "Cyberstructure de l'internet: réseaux et sécurité",
  "Systèmes d'exploitation : Linux",
  "Coding #Python",
];

// Horaires des séances (1=lundi, 2=mardi, 3=mercredi, 4=jeudi, 5=vendredi, 6=samedi, 7=dimanche)
const CRENEAUX_DISPONIBLES = [
  { cle: "campus_thu", lieu: "Campus", jour: 4, debut: "13:00", fin: "17:00" }, // Jeudi 13–17
  {
    cle: "discord_mon",
    lieu: "Discord",
    jour: 1,
    debut: "16:45",
    fin: "19:00",
  }, // Lundi soir
  {
    cle: "discord_tue",
    lieu: "Discord",
    jour: 2,
    debut: "16:45",
    fin: "19:00",
  },
  {
    cle: "discord_wed",
    lieu: "Discord",
    jour: 3,
    debut: "16:45",
    fin: "19:00",
  },
  {
    cle: "discord_thu",
    lieu: "Discord",
    jour: 4,
    debut: "16:45",
    fin: "19:00",
  },
  {
    cle: "discord_fri",
    lieu: "Discord",
    jour: 5,
    debut: "16:45",
    fin: "19:00",
  },
];

// Niveaux d'aide possibles
const NIVEAUX_AIDE = [
  "✅ Je viens pour aider",
  "🟡 Besoin de confirmer mes acquis",
  "🟠 Besoin d'aide",
  "🔴 Vraiment besoin d'aide",
];

// Clés pour sauvegarder les informations importantes
const CLES_SAUVEGARDE = {
  ID_FORMULAIRE: "FORM_ID",
  ID_FEUILLE: "SHEET_ID",
  ID_AGENDA: "CAL_ID",
  SEMAINE: "WEEK_ISO",
};

// ===== FONCTION PRINCIPALE - À lancer une seule fois =====
// Cette fonction configure tout le système automatiquement
function demarrerScript() {
  const proprietes = PropertiesService.getScriptProperties();

  // Étape 1 : Créer ou trouver l'agenda
  let agenda = trouverAgendaParNom(NOM_AGENDA);
  if (!agenda) {
    agenda = CalendarApp.createCalendar(NOM_AGENDA, {
      timeZone: FUSEAU_HORAIRE,
    });
  }
  proprietes.setProperty(CLES_SAUVEGARDE.ID_AGENDA, agenda.getId());

  // Étape 2 : Créer le formulaire pour la semaine prochaine
  const aujourdhui = new Date();
  const lundiSemaineProchaine = obtenirLundiDeLaSemaine(
    ajouterJours(aujourdhui, 7)
  );
  creerFormulaireHebdomadaire(lundiSemaineProchaine);

  // Étape 3 : Programmer la création automatique chaque dimanche
  programmerCreationAutomatique();

  Logger.log("✅ Script configuré avec succès !");
  // route parametrée du nouveau formulaire
  Logger.log(
    "Lien agenda : https://calendar.google.com/calendar/u/0/r?cid=" +
      encodeURIComponent(agenda.getId())
  );
}

// ===== GESTION DES DÉCLENCHEURS AUTOMATIQUES =====

// Programme la création automatique du formulaire chaque dimanche à 9h
function programmerCreationAutomatique() {
  // Supprimer les anciens déclencheurs s'il y en a
  const declencheurs = ScriptApp.getProjectTriggers();
  for (let i = 0; i < declencheurs.length; i++) {
    if (
      declencheurs[i].getHandlerFunction() === "creerNouveauFormulaireDimanche"
    ) {
      ScriptApp.deleteTrigger(declencheurs[i]);
    }
  }

  // Créer le nouveau déclencheur
  ScriptApp.newTrigger("creerNouveauFormulaireDimanche")
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.SUNDAY)
    .atHour(9) // 09:00
    .create();
}

// Cette fonction est appelée automatiquement chaque dimanche
function creerNouveauFormulaireDimanche() {
  const aujourdhui = new Date();
  const lundiSemaineProchaine = obtenirLundiDeLaSemaine(
    ajouterJours(aujourdhui, 7)
  );
  creerFormulaireHebdomadaire(lundiSemaineProchaine);
}

// ===== CRÉATION DU FORMULAIRE =====

// Crée un nouveau formulaire pour la semaine donnée
function creerFormulaireHebdomadaire(lundiDeLaSemaine) {
  const proprietes = PropertiesService.getScriptProperties();

  // Calculer le numéro de semaine
  const infoSemaine = calculerNumeroSemaine(lundiDeLaSemaine);
  const nomSemaine =
    infoSemaine.annee + "-W" + ajouterZeroDevant(infoSemaine.semaine);

  // Créer le formulaire avec un titre clair
  const titreFormulaire = DEBUT_TITRE_FORM + " " + nomSemaine;
  const formulaire = FormApp.create(titreFormulaire);

  // Description du formulaire
  formulaire.setDescription(
    "Inscription pour les séances de travail de la " +
      nomSemaine +
      ".\n" +
      "Tu peux choisir maximum 2 matières, indiquer ton niveau, et tes créneaux préférés."
  );

  // Configuration du formulaire
  formulaire.setProgressBar(true);
  formulaire.setCollectEmail(true); // Important pour éviter les doublons
  formulaire.setLimitOneResponsePerUser(false); //  la limite est géré manuellement dans la logique metier

  // ===== SECTION 1 : QUI ES-TU ? =====
  formulaire.addPageBreakItem().setTitle("Qui es-tu ?");
  formulaire.addTextItem().setTitle("Nom & Prénom").setRequired(true);
  formulaire.addTextItem().setTitle("Pseudo Discord").setRequired(false);

  // ===== SECTION 2 : QUELLES MATIÈRES ? =====
  formulaire.addPageBreakItem().setTitle("Quelles matières ?");
  const choixMatieres = formulaire.addCheckboxItem();
  choixMatieres.setTitle(
    "Sur quoi veux-tu travailler ? (choisis au maximum 2 matières)"
  );
  choixMatieres.setChoiceValues(MATIERES);

  // Validation : maximum 2 choix
  const validationMatieres = FormApp.createCheckboxValidation()
    .setHelpText("Tu peux choisir au maximum 2 matières.")
    .requireSelectAtMost(2)
    .build();
  choixMatieres.setValidation(validationMatieres);

  // ===== SECTION 3 : QUEL EST TON NIVEAU ? =====
  formulaire.addPageBreakItem().setTitle("Quel est ton niveau ?");
  const grilleNiveaux = formulaire.addGridItem();
  grilleNiveaux.setTitle(
    "Pour chaque matière que tu as choisie, indique ton niveau (laisse vide les autres)"
  );
  grilleNiveaux.setRows(MATIERES);
  grilleNiveaux.setColumns(NIVEAUX_AIDE);
  grilleNiveaux.setRequired(false);

  // ===== SECTION 4 : QUAND ES-TU DISPONIBLE ? =====
  const creneauxDates = creerCreneauxAvecDates(lundiDeLaSemaine);
  formulaire.addPageBreakItem().setTitle("Quand es-tu disponible ?");
  const choixCreneaux = formulaire.addCheckboxItem();
  choixCreneaux.setTitle("Choisis tous les créneaux où tu peux venir");

  const listeCreneaux = [];
  for (let i = 0; i < creneauxDates.length; i++) {
    listeCreneaux.push(creneauxDates[i].texte);
  }
  choixCreneaux.setChoiceValues(listeCreneaux);

  // ===== SECTION 5 : COMMENTAIRES =====
  formulaire.addPageBreakItem().setTitle("C'est fini !");
  formulaire
    .addParagraphTextItem()
    .setTitle("Un commentaire ? (optionnel)")
    .setRequired(false);

  // Message de confirmation
  formulaire.setConfirmationMessage(
    "Merci pour ton inscription !\n" +
      "Rappel : tu ne peux répondre qu'une seule fois par semaine.\n" +
      "Si tes disponibilités évoluent, tu peux renvoyer le formulaire : seule ta dernière réponse de la semaine est conservée.\n" +
      "Les groupes seront organisés automatiquement. Reste connecté sur Discord pour les infos !"
  );

  // ===== CRÉER LA FEUILLE DE CALCUL POUR LES RÉPONSES =====
  const feuille = SpreadsheetApp.create("Réponses – " + titreFormulaire);
  formulaire.setDestination(
    FormApp.DestinationType.SPREADSHEET,
    feuille.getId()
  );

  // Créer un onglet dédié pour stocker les infos des créneaux
  const ongletCreneaux = feuille.insertSheet("CRENEAUX");
  ongletCreneaux
    .getRange(1, 1, 1, 5)
    .setValues([["Texte", "Début", "Fin", "Semaine", "Créé le"]]);

  // Remplir les infos des créneaux
  const lignesCreneaux = [];
  for (let i = 0; i < creneauxDates.length; i++) {
    const creneau = creneauxDates[i];
    lignesCreneaux.push([
      creneau.texte,
      creneau.debut.toISOString(),
      creneau.fin.toISOString(),
      nomSemaine,
      new Date().toISOString(),
    ]);
  }
  if (lignesCreneaux.length > 0) {
    ongletCreneaux
      .getRange(2, 1, lignesCreneaux.length, 5)
      .setValues(lignesCreneaux);
  }

  // ===== FEUILLE D'AUDIT (journal des enregistrements / remplacements) =====
  // Crée une feuille "AUDIT" pour tracer chaque enregistrement et remplacement
  let ongletAudit = feuille.getSheetByName("AUDIT");
  if (!ongletAudit) {
    ongletAudit = feuille.insertSheet("AUDIT");
    ongletAudit.getRange(1, 1, 1, 7).setValues([
      [
        "Horodatage",
        "Email",
        "Semaine",
        "Action", // SUBMIT | REPLACE
        "LigneConservee",
        "LignesSupprimees",
        "IP",
      ],
    ]);
  }

  // ===== SAUVEGARDER LES INFOS IMPORTANTES =====
  proprietes.setProperty(CLES_SAUVEGARDE.ID_FORMULAIRE, formulaire.getId());
  proprietes.setProperty(CLES_SAUVEGARDE.ID_FEUILLE, feuille.getId());
  proprietes.setProperty(CLES_SAUVEGARDE.SEMAINE, nomSemaine);

  // S'assurer que l'agenda existe
  let agenda = trouverAgendaParNom(NOM_AGENDA);
  if (!agenda) {
    agenda = CalendarApp.createCalendar(NOM_AGENDA, {
      timeZone: FUSEAU_HORAIRE,
    });
  }
  proprietes.setProperty(CLES_SAUVEGARDE.ID_AGENDA, agenda.getId());

  // ===== les Triggers =====
  // D'abord supprimer les anciens déclencheurs
  const anciensDeclencheurs = ScriptApp.getProjectTriggers();
  for (let i = 0; i < anciensDeclencheurs.length; i++) {
    if (anciensDeclencheurs[i].getHandlerFunction() === "quelquunARepondu") {
      ScriptApp.deleteTrigger(anciensDeclencheurs[i]);
    }
  }

  // Puis créer le nouveau déclencheur pour ce formulaire
  ScriptApp.newTrigger("quelquunARepondu")
    .forForm(formulaire)
    .onFormSubmit()
    .create();

  // Messages de succès
  Logger.log("✅ Formulaire créé pour la " + nomSemaine);
  Logger.log("Lien public : " + formulaire.getPublishedUrl());
  Logger.log("Feuille de réponses : " + feuille.getUrl());
}

// ===== RÉACTION QUAND QUELQU'UN RÉPOND AU FORMULAIRE =====

function quelquunARepondu(evenement) {
  const proprietes = PropertiesService.getScriptProperties();
  const idFeuille = proprietes.getProperty(CLES_SAUVEGARDE.ID_FEUILLE);
  const idAgenda = proprietes.getProperty(CLES_SAUVEGARDE.ID_AGENDA);

  const feuille = SpreadsheetApp.openById(idFeuille);
  const ongletReponses = feuille.getSheets()[0]; // Premier onglet = réponses
  const ongletCreneaux = feuille.getSheetByName("CRENEAUX");

  if (!ongletCreneaux) {
    throw new Error("L'onglet CRENEAUX n'existe pas dans la feuille");
  }

  // Récupérer l'email de la personne qui a répondu
  let emailRepondant = "";
  if (
    evenement &&
    evenement.response &&
    evenement.response.getRespondentEmail
  ) {
    emailRepondant = evenement.response.getRespondentEmail();
  }

  // Récupérer toutes les réponses
  const toutesLesReponses = ongletReponses.getDataRange().getValues();
  const entetes = toutesLesReponses[0];

  // S'assurer que les colonnes de suivi existent (Version, Dernière mise à jour)
  const suiviMeta = assurerColonnesSuivi_(ongletReponses);
  const colVersion = suiviMeta.colVersion;
  const colMaj = suiviMeta.colMaj;

  // Trouver les colonnes importantes
  const colonneEmail = trouverColonneEmail(entetes);
  const colonneDate = trouverColonneDate(entetes);

  // Vérifier la dernière réponse
  const numeroLigneReponse = ongletReponses.getLastRow();
  const derniereReponse = ongletReponses
    .getRange(numeroLigneReponse, 1, 1, ongletReponses.getLastColumn())
    .getValues()[0];
  const dateDerniereReponse = new Date(derniereReponse[colonneDate]);
  const semaineDerniereReponse = calculerNumeroSemaine(dateDerniereReponse);
  const nomSemaineDerniereReponse =
    semaineDerniereReponse.annee +
    "-W" +
    ajouterZeroDevant(semaineDerniereReponse.semaine);

  // Vérifier si cette personne a déjà répondu cette semaine
  if (emailRepondant) {
    let nombreReponsesPersonne = 0;
    const lignesDoublons = []; // lignes (1-based) à supprimer si doublon détecté

    for (let i = 1; i < toutesLesReponses.length; i++) {
      const reponse = toutesLesReponses[i];
      const emailCetteReponse =
        colonneEmail >= 0 ? String(reponse[colonneEmail] || "").trim() : "";
      const dateCetteReponse =
        colonneDate >= 0 ? new Date(reponse[colonneDate]) : null;

      if (emailCetteReponse && dateCetteReponse) {
        const semaineCetteReponse = calculerNumeroSemaine(dateCetteReponse);
        const nomSemaineCetteReponse =
          semaineCetteReponse.annee +
          "-W" +
          ajouterZeroDevant(semaineCetteReponse.semaine);

        if (
          emailCetteReponse.toLowerCase() === emailRepondant.toLowerCase() &&
          nomSemaineCetteReponse === nomSemaineDerniereReponse
        ) {
          nombreReponsesPersonne++;
          // Conserver uniquement la dernière réponse (ligne actuelle = numeroLigneReponse)
          const numeroLigneCetteReponse = i + 1; // +1 car entête en ligne 1
          if (numeroLigneCetteReponse !== numeroLigneReponse) {
            lignesDoublons.push(numeroLigneCetteReponse);
          }
        }
      }
    }

    // Si doublons : on supprime les anciennes réponses et on garde la plus récente
    if (nombreReponsesPersonne > 1 && lignesDoublons.length > 0) {
      // Supprimer en ordre décroissant pour ne pas décaler les indices
      lignesDoublons
        .sort((a, b) => b - a)
        .forEach((ligne) => ongletReponses.deleteRow(ligne));

      // prévenir la personne que ses choix ont été mis à jour
      try {
        MailApp.sendEmail({
          to: emailRepondant,
          subject: "Modification de ta réponse enregistrée",
          htmlBody:
            "Bonjour,<br><br>" +
            "Ta nouvelle réponse pour la " +
            nomSemaineDerniereReponse +
            " a remplacé la précédente. " +
            "Nous avons mis à jour tes choix et disponibilités." +
            "<br><br>" +
            "Tu peux soumettre à nouveau si besoin : seule la dernière réponse de la semaine est conservée." +
            "<br><br>Bonne journée !",
        });
      } catch (erreur) {
        Logger.log("Info: envoi mail impossible  : " + erreur);
      }
      // Journaliser dans AUDIT (REPLACE)
      ecrireAudit_(feuille, {
        email: emailRepondant,
        semaine: nomSemaineDerniereReponse,
        action: "REPLACE",
        ligneConservee: ongletReponses.getLastRow(),
        lignesSupprimees: lignesDoublons.join(","),
        ip: obtenirIP_(evenement),
      });
      // Ne pas return ici afin de synchroniser l'agenda
    } else {
      // Journaliser dans AUDIT (SUBMIT)
      ecrireAudit_(feuille, {
        email: emailRepondant,
        semaine: nomSemaineDerniereReponse,
        action: "SUBMIT",
        ligneConservee: numeroLigneReponse,
        lignesSupprimees: "",
        ip: obtenirIP_(evenement),
      });
    }

    // Mettre à jour les colonnes de suivi (Version / Dernière mise à jour) sur la ligne conservée
    const ligneConserveeFinale = ongletReponses.getLastRow();
    const versionValeur = Math.max(1, nombreReponsesPersonne);
    ongletReponses
      .getRange(ligneConserveeFinale, colVersion)
      .setValue(versionValeur);
    ongletReponses.getRange(ligneConserveeFinale, colMaj).setValue(new Date());
  } else {
    Logger.log(
      "⚠️ Attention : impossible de récupérer l'email, on ne peut pas vérifier les doublons"
    );
  }

  // Si tout va bien, mettre à jour l'agenda
  mettreAJourAgenda(ongletReponses, ongletCreneaux, idAgenda);
}

// ===== MISE À JOUR DE L'AGENDA =====

function mettreAJourAgenda(ongletReponses, ongletCreneaux, idAgenda) {
  const agenda = CalendarApp.getCalendarById(idAgenda);
  if (!agenda) {
    throw new Error("Impossible de trouver l'agenda : " + idAgenda);
  }

  // Créer un dictionnaire : nom du créneau → infos de date/heure
  const infoCreneaux = {};
  const donneesCreneaux = ongletCreneaux.getDataRange().getValues();
  const entetesCreneaux = donneesCreneaux[0];

  const colTexte = entetesCreneaux.indexOf("Texte");
  const colDebut = entetesCreneaux.indexOf("Début");
  const colFin = entetesCreneaux.indexOf("Fin");

  for (let i = 1; i < donneesCreneaux.length; i++) {
    const ligne = donneesCreneaux[i];
    const texte = String(ligne[colTexte]);
    infoCreneaux[texte] = {
      debut: new Date(ligne[colDebut]),
      fin: new Date(ligne[colFin]),
    };
  }

  // Analyser toutes les réponses au formulaire
  const donneesReponses = ongletReponses.getDataRange().getValues();
  if (donneesReponses.length < 2) {
    return; // Pas de réponses
  }

  const entetesReponses = donneesReponses[0];
  const reponses = donneesReponses.slice(1).filter(function (ligne) {
    return ligne.join("").trim() !== ""; // Ignorer les lignes vides
  });

  // Créer un index des colonnes
  const colonnes = {};
  for (let i = 0; i < entetesReponses.length; i++) {
    colonnes[String(entetesReponses[i]).trim()] = i;
  }

  // Regrouper les participants par (créneau + matière)
  const groupes = {};

  for (let i = 0; i < reponses.length; i++) {
    const reponse = reponses[i];

    // Récupérer les infos de base
    const nom = String(reponse[colonnes["Nom & Prénom"]] || "").trim();
    const discord = String(
      reponse[colonnes["Pseudo Discord (si tu en as un)"]] || ""
    ).trim();

    // Récupérer les matières choisies
    const matieresChoisies = extraireChoixMultiples(
      reponse,
      entetesReponses,
      "Sur quoi veux-tu travailler ? (choisis au maximum 2 matières)"
    );

    // Récupérer les niveaux pour chaque matière
    const niveauxParMatiere = {};
    for (let j = 0; j < MATIERES.length; j++) {
      const matiere = MATIERES[j];
      // Chercher la colonne correspondante dans la grille
      let nomColonneNiveau = null;
      for (let k = 0; k < entetesReponses.length; k++) {
        const entete = String(entetesReponses[k]);
        if (
          entete.indexOf("Pour chaque matière") > -1 &&
          entete.indexOf("[" + matiere + "]") > -1
        ) {
          nomColonneNiveau = entete;
          break;
        }
      }
      if (nomColonneNiveau && colonnes[nomColonneNiveau] !== undefined) {
        const niveau = String(reponse[colonnes[nomColonneNiveau]] || "").trim();
        niveauxParMatiere[matiere] = niveau;
      }
    }

    // Récupérer les créneaux choisis
    const creneauxChoisis = extraireChoixMultiples(
      reponse,
      entetesReponses,
      "Choisis tous les créneaux où tu peux venir"
    );

    // Pour chaque combinaison (créneau, matière), ajouter le participant
    for (let j = 0; j < creneauxChoisis.length; j++) {
      const creneau = creneauxChoisis[j];
      for (let k = 0; k < matieresChoisies.length; k++) {
        const matiere = matieresChoisies[k];
        const cleGroupe = creneau + "||" + matiere;

        const niveau = niveauxParMatiere[matiere] || "";
        let nomComplet = nom;
        if (discord) {
          nomComplet += " (@" + discord + ")";
        }
        if (niveau) {
          nomComplet += " — " + niveau;
        }

        if (!groupes[cleGroupe]) {
          groupes[cleGroupe] = [];
        }
        groupes[cleGroupe].push(nomComplet);
      }
    }
  }

  // Créer ou mettre à jour les événements dans l'agenda
  for (const cleGroupe in groupes) {
    const parties = cleGroupe.split("||");
    const nomCreneau = parties[0];
    const matiere = parties[1];
    const heures = infoCreneaux[nomCreneau];

    if (!heures) {
      continue; // Créneau non trouvé, passer au suivant
    }

    const titreEvenement = "Groupe " + matiere + " — " + nomCreneau;
    const participants = groupes[cleGroupe];
    const description =
      "Participants (" +
      participants.length +
      ")\n" +
      participants
        .map(function (p) {
          return "• " + p;
        })
        .join("\n") +
      "\n\nMatière : " +
      matiere +
      "\nCréneau : " +
      nomCreneau +
      "\n(Mis à jour automatiquement)";

    // Chercher s'il existe déjà un événement ce jour-là avec le même titre et horaires
    const debutJour = new Date(heures.debut);
    debutJour.setHours(0, 0, 0, 0);
    const finJour = new Date(debutJour);
    finJour.setDate(finJour.getDate() + 1);

    const evenementsExistants = agenda.getEvents(debutJour, finJour, {
      search: titreEvenement,
    });
    let evenementTrouve = null;

    for (let i = 0; i < evenementsExistants.length; i++) {
      const evt = evenementsExistants[i];
      if (
        evt.getStartTime().getTime() === heures.debut.getTime() &&
        evt.getEndTime().getTime() === heures.fin.getTime() &&
        evt.getTitle() === titreEvenement
      ) {
        evenementTrouve = evt;
        break;
      }
    }

    // Mettre à jour l'événement existant ou en créer un nouveau
    if (evenementTrouve) {
      evenementTrouve.setDescription(description);
    } else {
      agenda.createEvent(titreEvenement, heures.debut, heures.fin, {
        description: description,
      });
    }
  }
}

// ===== FONCTIONS UTILITAIRES =====

// Trouve un agenda par son nom, ou renvoie null
function trouverAgendaParNom(nom) {
  const tousLesAgendas = CalendarApp.getAllCalendars();
  for (let i = 0; i < tousLesAgendas.length; i++) {
    if (tousLesAgendas[i].getName() === nom) {
      return tousLesAgendas[i];
    }
  }
  return null;
}

// Crée la liste des créneaux avec les vraies dates de la semaine
function creerCreneauxAvecDates(lundiDeLaSemaine) {
  const infoSemaine = calculerNumeroSemaine(lundiDeLaSemaine);
  const texteSemaine =
    "Semaine " +
    infoSemaine.annee +
    "-W" +
    ajouterZeroDevant(infoSemaine.semaine);

  const creneaux = [];
  for (let i = 0; i < CRENEAUX_DISPONIBLES.length; i++) {
    const modele = CRENEAUX_DISPONIBLES[i];
    const dateDebut = obtenirDateEtHeure(
      lundiDeLaSemaine,
      modele.jour,
      modele.debut
    );
    const dateFin = obtenirDateEtHeure(
      lundiDeLaSemaine,
      modele.jour,
      modele.fin
    );

    // Créer un texte lisible : "Jeudi 12/10 13:00–17:00 • Semaine 2025-W41 • Campus"
    const nomJour = obtenirNomJour(dateDebut.getDay());
    const texteJour =
      nomJour +
      " " +
      ajouterZeroDevant(dateDebut.getDate()) +
      "/" +
      ajouterZeroDevant(dateDebut.getMonth() + 1);
    const texte =
      texteJour +
      " " +
      modele.debut +
      "–" +
      modele.fin +
      " • " +
      texteSemaine +
      " • " +
      modele.lieu;

    creneaux.push({
      texte: texte,
      debut: dateDebut,
      fin: dateFin,
    });
  }
  return creneaux;
}

// Calcule la date et l'heure pour un jour donné de la semaine
function obtenirDateEtHeure(lundiDeLaSemaine, jourSemaine, heureTexte) {
  const date = new Date(lundiDeLaSemaine);
  const parties = heureTexte.split(":");
  const heures = parseInt(parties[0]);
  const minutes = parseInt(parties[1]);

  date.setDate(date.getDate() + (jourSemaine - 1)); // Ajouter les jours depuis lundi
  date.setHours(heures, minutes, 0, 0);
  return date;
}

// Trouve le lundi de la semaine qui contient la date donnée
function obtenirLundiDeLaSemaine(date) {
  const nouvelleDate = new Date(date);
  const jourSemaine = nouvelleDate.getDay(); // 0 = dimanche, 1 = lundi, etc.
  const joursAReculer = jourSemaine === 0 ? -6 : 1 - jourSemaine; // Revenir au lundi
  nouvelleDate.setDate(nouvelleDate.getDate() + joursAReculer);
  nouvelleDate.setHours(0, 0, 0, 0);
  return nouvelleDate;
}

// Calcule le numéro de semaine selon la norme ISO
function calculerNumeroSemaine(date) {
  const dateUTC = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const jourSemaine = (dateUTC.getUTCDay() + 6) % 7; // 0 = lundi, 1 = mardi, etc.
  dateUTC.setUTCDate(dateUTC.getUTCDate() - jourSemaine + 3); // Aller au jeudi de cette semaine
  const premierJeudi = new Date(Date.UTC(dateUTC.getUTCFullYear(), 0, 4)); // Premier jeudi de l'année
  const difference = (dateUTC - premierJeudi) / 86400000; // Différence en jours
  const semaine = 1 + Math.floor(difference / 7);
  const annee = dateUTC.getUTCFullYear();
  return { annee: annee, semaine: semaine };
}

// Ajoute des jours à une date
function ajouterJours(date, nombreJours) {
  const nouvelleDate = new Date(date);
  nouvelleDate.setDate(nouvelleDate.getDate() + nombreJours);
  return nouvelleDate;
}

// Ajoute un zéro devant les nombres < 10
function ajouterZeroDevant(nombre) {
  return (nombre < 10 ? "0" : "") + nombre;
}

// Convertit un numéro de jour JavaScript en nom français
function obtenirNomJour(numeroJour) {
  const noms = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ];
  return noms[numeroJour];
}

// Trouve l'index de la colonne email  français/anglais
function trouverColonneEmail(entetes) {
  const candidats = ["Adresse e-mail", "Email Address", "Adresse email"];
  for (let i = 0; i < candidats.length; i++) {
    const index = entetes.indexOf(candidats[i]);
    if (index >= 0) return index;
  }
  return -1;
}

// Trouve l'index de la colonne timestamp français/anglais
function trouverColonneDate(entetes) {
  const candidats = ["Horodatage", "Timestamp"];
  for (let i = 0; i < candidats.length; i++) {
    const index = entetes.indexOf(candidats[i]);
    if (index >= 0) return index;
  }
  return 0; // Par défaut, première colonne
}

// Extrait les réponses à choix multiples (cases à cocher séparées par des virgules)
function extraireChoixMultiples(ligne, entetes, titreQuestion) {
  const indexColonne = entetes.indexOf(titreQuestion);
  if (indexColonne === -1) {
    return [];
  }
  const valeur = String(ligne[indexColonne] || "").trim();
  if (!valeur) {
    return [];
  }
  return valeur
    .split(",")
    .map(function (choix) {
      return choix.trim();
    })
    .filter(function (choix) {
      return choix !== "";
    });
}

// ====== SUIVI: Colonnes Version / Dernière mise à jour ======
function assurerColonnesSuivi_(ongletReponses) {
  const sheet = ongletReponses;
  const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  let colVersion = header.indexOf("Version") + 1; // 1-based si trouvé
  let colMaj = header.indexOf("Dernière mise à jour") + 1;

  let lastCol = sheet.getLastColumn();
  if (colVersion === 0) {
    lastCol += 1;
    sheet.getRange(1, lastCol).setValue("Version");
    colVersion = lastCol;
  }
  if (colMaj === 0) {
    lastCol += 1;
    sheet.getRange(1, lastCol).setValue("Dernière mise à jour");
    colMaj = lastCol;
  }
  return { colVersion, colMaj };
}

// ====== AUDIT: journaliser chaque envoi / remplacement ======
function ecrireAudit_(feuille, payload) {
  const sheetAudit =
    feuille.getSheetByName("AUDIT") || feuille.insertSheet("AUDIT");
  const now = new Date();
  const row = [
    now,
    payload.email || "",
    payload.semaine || "",
    payload.action || "",
    payload.ligneConservee || "",
    payload.lignesSupprimees || "",
    payload.ip || "N/A",
  ];
  sheetAudit.appendRow(row);
}

// ====== IP: récupération impossible via Apps Script "a implémenter via routage depuis un serveur web" ======
function obtenirIP_(evenement) {
  // Renvoie "N/A" par défaut le temps d'implémenter une solution.

  return "N/A";
}
