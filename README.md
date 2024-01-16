# Système d'Organisation Automatique de Groupes de Travail

Un système complet d'automatisation pour organiser des groupes de travail hebdomadaires dans un établissement d'enseignement. Le système génère automatiquement des formulaires d'inscription chaque dimanche à 9h pour la semaine suivante. Tout est paramettrable dans les variables de configuration situées lignes 43 à 222. Chaque jour ouvré à 12h00 sera généré un ou plusieurs groupes de 2 à 4 personnes (selon ses dispo, ses chiox de matière et le nombre de personne positionnées sur ce même créneaux/support). Ils recoivent chacun une invitation avec les événements calendrier crée et les collègues de son groupe.

## Vue d'ensemble

Ce projet automatise la gestion des groupes de travail en permettant aux étudiants de s'inscrire à des sessions de travail collaboratif. Le système :

- Génère automatiquement un nouveau formulaire chaque dimanche pour la semaine suivante
- Permet aux étudiants de choisir leurs matières, niveaux et créneaux de disponibilité
- Forme automatiquement des groupes basés sur les matières communes et disponibilités
- Crée des événements Google Calendar avec invitations automatiques
- Gère les inscriptions multiples (remplacement des anciennes réponses)

## Fonctionnalités principales

### Pour les étudiants
- Inscription simple via formulaire Google
- Choix de 4 matières maximum avec niveau d'accompagnement
- Sélection de créneaux de disponibilité (campus et Discord)
- Remplacement facile des inscriptions précédentes
- Notifications automatiques par email

### Pour les administrateurs
- Génération automatique des formulaires hebdomadaires
- Formation automatique des groupes à 12h00 chaque jour
- Gestion des invitations calendrier
- Rapports hebdomadaires automatiques
- Système d'audit complet

## Installation et déploiement

### Prérequis
- Compte Google avec accès à Google Apps Script
- Permissions pour créer des formulaires et calendriers
- Accès à Google Sheets et Gmail

### Déploiement étape par étape

1. **Cloner le projet**
   ```bash
   git clone https://github.com/Anthony-Faria-dos-santos/Project-Auto-Form-working-groups.git
   cd Project-Auto-Form-working-groups
   ```

2. **Créer un nouveau projet Google Apps Script**
   - Aller sur [script.google.com](https://script.google.com)
   - Cliquer sur "Nouveau projet"
   - Remplacer le contenu par défaut par le code du fichier `apps script/code.gs`

3. **Configuration initiale**
   - Modifier la variable `CONFIG.EMAIL_ADMIN` avec l'email de l'administrateur
   - Ajuster les matières disponibles dans `CONFIG.MATIERES`
   - Personnaliser les créneaux dans `CONFIG.CRENEAUX`

4. **Premier déploiement**
   - Exécuter la fonction `CONFIG_INITIALE()` (autoriser les permissions demandées)
   - Exécuter `DEMARRER_SYSTEME()` pour initialiser le système
   - Tester avec `TEST_COMPLET()` pour vérifier le fonctionnement
   - Pour chaque test effectué, vous recevrez un email de confirmation avec le résultat du test sur le mail admin défini plus tôt.

5. **Configuration des triggers**
   - Le système programme automatiquement les triggers nécessaires
   - Trigger hebdomadaire : génération de formulaire chaque dimanche à 9h00
   - Trigger quotidien : formation des groupes chaque jour ouvré à 12h00
   - Trigger de soumission : traitement des réponses en temps réel

## Utilisation

### Pour les étudiants

1. **Inscription**
   - Recevoir le lien du formulaire (partagé chaque dimanche)
   - Remplir les informations personnelles
   - Sélectionner jusqu'à 4 matières avec niveau d'accompagnement
   - Choisir les créneaux de disponibilité
   - Ajouter un commentaire optionnel

2. **Modification d'inscription**
   - Renvoyer le formulaire avec la même adresse email
   - L'ancienne inscription sera automatiquement remplacée
   - Confirmation par email de la mise à jour

3. **Participation aux sessions**
   - Recevoir les invitations calendrier automatiquement
   - Consulter les détails des groupes formés
   - Participer aux sessions selon les créneaux choisis

### Pour les administrateurs

1. **Surveillance du système**
   - Vérifier les logs dans l'onglet AUDIT du spreadsheet
   - Surveiller les quotas d'emails avec `VERIFIER_QUOTA_EMAILS()`
   - Consulter les rapports hebdomadaires automatiques

2. **Maintenance**
   - Utiliser `TEST_SANS_EMAILS()` pour tester sans consommer le quota
   - Utiliser `MIGRER_STRUCTURE_SPREADSHEET_()` pour corriger les structures
   - Surveiller les erreurs dans les logs Apps Script

## Structure du projet

```
Project-Auto-Form-working-groups/
├── apps script/
│   └── code.gs                 # Script principal Google Apps Script
├── Doc/
│   └── Apps-Script-Book-V3.pdf # Documentation Apps Script
├── templates CSV/              # Templates de données
├── Jeux de données synthetiques/ # Données de test
└── Integration vers Tally.so/   # Documentation d'intégration
```

## Configuration avancée

### Personnalisation des matières
Modifier la liste `CONFIG.MATIERES` pour adapter aux matières de votre établissement.

### Personnalisation des créneaux
Ajuster `CONFIG.CRENEAUX` pour définir les créneaux disponibles (campus, Discord, horaires).

### Personnalisation des emails
Modifier les templates HTML dans les fonctions `GENERER_EMAIL_HEADER_()` et `GENERER_EMAIL_FOOTER_()`.

## Limites et considérations

### Quotas Google Apps Script
- Gmail gratuit : ~100 emails/jour
- Google Workspace : ~1500 emails/jour
- Surveiller avec `VERIFIER_QUOTA_EMAILS()`

### Permissions requises
- Accès aux services Google (Sheets, Calendar, Gmail, Forms)
- Autorisation d'envoi d'emails
- Création de formulaires et événements

### Maintenance
- Vérification régulière des logs
- Surveillance des quotas d'emails
- Tests périodiques du système

## Dépannage

### Problèmes courants
- **Quota emails épuisé** : Utiliser `TEST_SANS_EMAILS()` pour les tests
- **Colonnes décalées** : Exécuter `CORRIGER_ENTETES_REPONSES_()`
- **Erreurs de permissions** : Réautoriser les services dans Apps Script

### Fonctions de diagnostic
- `VERIFIER_QUOTA_EMAILS()` : Vérifier le quota d'emails
- `TEST_SANS_EMAILS()` : Tester la logique sans envoyer d'emails
- `MIGRER_STRUCTURE_SPREADSHEET_()` : Corriger la structure des feuilles

## Contribution

Les contributions sont les bienvenues. Pour contribuer :

1. Forker le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos modifications
4. Pousser vers votre fork
5. Ouvrir une Pull Request correctement documentée

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Consulter la documentation Apps Script
- Vérifier les logs dans l'éditeur Apps Script

## TODO

### Améliorations majeures prévues

- [ ] **Interface d'administration multi-instances**
  - Création d'un système de comptes administrateurs
  - Gestion de plusieurs instances persistantes par administrateur
  - Fourniture automatique des liens de formulaires pour chaque instance
  - Tableau de bord centralisé pour la gestion des projets

- [ ] **Plateforme web multi-projets**
  - Interface web permettant de gérer plusieurs projets simultanément
  - Configuration différenciée par projet (matières, créneaux, paramètres)
  - Déploiement automatisé de nouvelles instances
  - Monitoring centralisé des performances et quotas

- [ ] **Système de thèmes et templates**
  - Templates HTML personnalisables pour les emails
  - Thèmes visuels adaptables par projet
  - Éviter les modifications manuelles pour chaque déploiement
  - Bibliothèque de thèmes prédéfinis

### Fonctionnalités avancées

- [ ] **Intégration avec des systèmes externes**
  - Synchronisation avec des calendriers externes (Outlook, Apple Calendar)
  - Intégration avec des plateformes de communication (Slack, Teams)
  - API REST pour l'intégration avec d'autres systèmes

- [ ] **Amélioration de l'expérience utilisateur**
  - Interface mobile optimisée pour les formulaires
  - Notifications push pour les rappels de sessions
  - Système de feedback et d'évaluation des sessions
  - Historique des participations pour les étudiants

- [ ] **Analytics et reporting**
  - Tableaux de bord avec statistiques d'utilisation
  - Rapports de performance des groupes formés
  - Analyse des tendances d'inscription
  - Export des données pour analyse externe

- [ ] **Sécurité et conformité**
  - Chiffrement des données sensibles
  - Conformité RGPD renforcée
  - Audit trail complet des actions
  - Gestion des permissions granulaires

- [ ] **Optimisations techniques**
  - Cache intelligent pour réduire les appels API
  - Gestion avancée des quotas d'emails
  - Monitoring en temps réel des erreurs
  - Tests automatisés complets

### Améliorations mineures

- [ ] **Personnalisation avancée**
  - Langues multiples dans l'interface
  - Personnalisation des messages d'email
  - Configuration des couleurs et logos par projet
  - Templates de formulaires personnalisables

- [ ] **Fonctionnalités collaboratives**
  - Système de commentaires sur les sessions
  - Partage de documents entre participants
  - Évaluation des sessions par les participants
  - Recommandations de groupes basées sur l'historique

*Ouvert à toutes propositions d'amélioration. N'hésitez pas à ouvrir une issue pour suggérer de nouvelles fonctionnalités.*