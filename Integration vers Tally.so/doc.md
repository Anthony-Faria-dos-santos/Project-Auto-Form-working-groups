# Kit CSV + Blueprint — Compatible avec ton script hebdomadaire

Ton script (fonction `demarrerScript()`) :
- crée **chaque dimanche 09:00** un **nouveau formulaire** pour la **semaine suivante** ;
- collecte l’e‑mail et limite à **1 réponse/semaine** (la dernière remplace les précédentes) ;
- crée/actualise les **événements Google Calendar** par **créneau daté** × **matière** ;
- remplit les onglets **CRENEAUX** et **AUDIT** dans le Google Sheet des réponses.

## Ce que contiennent ces fichiers

- **Reponses_template.csv** : structure des colonnes attendues côté « Réponses » (utile pour tests/interop).
- **CRENEAUX.csv** : structure de l’onglet « CRENEAUX » (Texte → Début/Fin/Semaine).
- **AUDIT.csv** : structure de l’onglet « AUDIT » (journal des SUBMIT/REPLACE). 
- **Tally_Blueprint.md** : modèle pour créer un formulaire Tally équivalent.

## Notes d’usage

- Tu n’as **rien à importer** pour Google Forms : le script crée tout tout seul.
- Si tu utilises **Tally** : mets à jour **chaque semaine** la liste des créneaux (copie la colonne « Texte » depuis CRENEAUX).
- Pour Notion, tu peux importer `Reponses_template.csv` et convertir certaines colonnes en **multi‑select**.

## Champs clés (rappel)
- Question matières : **Sur quoi veux-tu travailler ? (choisis au maximum 2 matières)**
- Grille niveaux : **Pour chaque matière que tu as choisie, indique ton niveau (laisse vide les autres) [Matière]**
- Disponibilités : **Choisis tous les créneaux où tu peux venir**
- Commentaire : **Un commentaire ? (optionnel)**

## RGPD
- L’adresse IP n’est pas collectée par défaut via Google Forms/Apps Script.
- Informe les participants (finalité, durée de conservation, droits).