# Project-Auto-Form-working-groups

Automatisation des groupes de travail hebdomadaires pour ma promo à l'ESIEE-IT.

- Chaque dimanche, un nouveau formulaire Google est généré pour la semaine suivante
- Les étudiant·e·s choisissent leurs matières, indiquent leur niveau et leurs disponibilités
- Les événements correspondants sont créés/mis à jour dans Google Calendar
- Une même personne peut renvoyer le formulaire dans la semaine: seule la dernière réponse est conservée

## Démarrage rapide (Google Apps Script)

1. Aller sur <https://script.google.com/> et créer un nouveau projet
2. Coller le contenu du fichier `apps script/code.gs`
3. Exécuter la fonction `demarrerScript()` une seule fois (autorisez les services si demandé)

- Crée (ou trouve) l’agenda Google "Groupe de Travail"
- Génère immédiatement le formulaire pour la semaine prochaine (titre: `Groupe d'étude – Semaine YYYY-WWW`)
- Programme un déclencheur automatique chaque dimanche à 09:00 pour les prochaines semaines
- Installe le déclencheur `onFormSubmit` (ici `quelquunARepondu`) pour traiter les réponses

## Ce que le script fait concrètement

### Politique de réponse (anti-doublon intelligent)

- Collecte l’email des répondants
- Si la même personne renvoie le formulaire dans la même semaine ISO:
  - Les anciennes réponses de la semaine sont supprimées
  - La dernière réponse est conservée et prise en compte (mise à jour du calendrier)
  - Un email d’information est envoyé pour confirmer la mise à jour
- Dans la feuille de réponses, deux colonnes sont ajoutées automatiquement:
  - `Version`: le numéro de révision de la réponse cette semaine (1, 2, ...)
  - `Dernière mise à jour`: date/heure de la dernière modification

### Feuilles générées dans Google Sheets

- Onglet `CRENEAUX` (template des créneaux):
  - Colonnes: `Texte`, `Début`, `Fin`, `Semaine`, `Créé le`
  - Sert de source de vérité pour créer les événements datés
- Onglet `AUDIT` (journal des actions):
  - Colonnes: `Horodatage`, `Email`, `Semaine`, `Action` (SUBMIT|REPLACE), `LigneConservee`, `LignesSupprimees`, `IP`
  - Remarque: l’IP n’est pas fournie par Google Forms; la valeur est `N/A` par défaut.

### Agenda Google (synchronisation)

- Un événement est créé/mis à jour pour chaque couple `(créneau daté, matière)`
- Le titre suit le format: `Groupe <matière> — <libellé de créneau>`
- La description contient la liste des participants (nom + pseudo Discord éventuel + niveau)

### Créneaux datés (affichage lisible)

- Les libellés montrent: `Jour JJ/MM HH:MM–HH:MM • Semaine YYYY-WWW • Lieu`
- Exemple: `Jeudi 12/10 13:00–17:00 • Semaine 2025-W41 • Campus`

## Paramètres ajustables

- `NOM_AGENDA`: nom de l’agenda Google Calendar cible
- `DEBUT_TITRE_FORM`: préfixe du titre du formulaire (la semaine ISO est ajoutée automatiquement)
- `MATIERES`: liste des matières proposées
- `CRENEAUX_DISPONIBLES`: modèle de créneaux projetés sur la semaine (1=lundi … 7=dimanche)
- `NIVEAUX_AIDE`: échelle de niveau pour la grille

## Limites et évolutions possibles

- IP du répondant: non fournie par Google Forms/Apps Script en `onFormSubmit`. Valeur `N/A` (peut être alimentée via un proxy ou un serveur web avec une redirection) [A implémenter].
- Collecte d’emails: indispensable pour la règle “une réponse par semaine (écrasable)”.
- Permissions: l’envoi d’emails (`MailApp`) nécessite l’autorisation lors du premier démarrage.

## Roadmap / TODO

- Mapping Notion (base de données) avec Tally.so
- Affiner le script selon les retours de l’enquête satisfaction
- Sécurisation et périmètre d’accès au formulaire
- Charte de conduite associée aux événements
- Transparence RGPD: informations accessibles aux volontaires
- Améliorer le formulaire (esthétique, logique, interactivité)
- Générer un QR code unique à chaque nouveau formulaire
- Mailing list pour cibler uniquement les volontaires
- Rappel automatique ciblé (mail/Discord) le jour des sessions avec infos à jour
