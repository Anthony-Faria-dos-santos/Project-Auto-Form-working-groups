# Project-Auto-Form-working-groups

Projet destiné à automatiser la formation des groupes de travail hebdomadaires au sein de ma promotion à l'ESIEE-IT.
Génère et envoie des formulaires de volontariat chaque dimanche
Forme des groupes selon les matières choisies, les disponibilités et le niveau de maîtrise des modules travaillés.
Génère un .ics automatique pour tous les participants afin de compléter automatiquement leur agenda.

## Note de conception initiale :

## GOOGLE SCRIPT

setupInitial() :
Trouver l'agenda "Groupe de Travail", SI NON le créer.

Créer un formulaire pour la semaine suivante (nommé Groupe d'étude – Semaine YYYY-WWW).
Créer un trigger hebdomadaire le dimanche 09:00 pour générer le formulaire de la semaine suivante.
Créer un trigger onFormSubmit sur le formulaire.

onFormSubmit(e) :
= Collecte des e-mails.

SI soumission de plus d'une fois dans la même semaine ISO via même email ALORS la dernière réponse est supprimée, ET un mail d'information est envoyé (Voir autorisation MailApp).
SINON, la réponse est comptabilisée et on synchronise le calendrier.

Créneaux datés :
= Les libellés incluent la date (jour/mois), le créneau, le support (Campus/Discord), et la Semaine ISO.

= Création d'Une feuille SLOTS dans le Google Sheets des réponses --> mapper Label → Start/End ISO.

Agenda :
= Event créé ou mis à jour par couple (créneau daté, matière) avec la liste des participants dans la description.



TODO :

- Mapping NOTION (base de données) avec TALLY.SO (form generator)
- Affiner le script selon les retours de l'enquête satisfaction.
- Approfondir la sécurisation et le périmètre d'accès au formulaire.
- Permettre à chaque volontaire de laisser un commentaire.
- Définir une charte de conduite dans le cadre des événements liés aux groupes de travail.
- Permettre à chaque membre de connaître les informations collectées sur lui et d'y avoir accès (conformité réglementaire)
- Améliorer le formulaire "Esthétique, Logique, Interactivité"
- Intégrer la génération d'un QR code unique à chaque nouveau formulaire.
- Associer un système de mailing list afin de cibler uniquement les volontaires (voir définition du périmètre d'accès au formulaire)
- Générer un rappel automatique ciblé par mail (en PM Discord ?) à 10h30 le jour de chaque session planifiée avec la matière, l'heure, le support et les participants à jour.
