# Tally — Blueprint « Inscription hebdomadaire – Groupe d'étude »

> Aligné avec ton Google Form automatique. Si tu utilises Tally à la place,
> mets à jour la liste des créneaux **chaque semaine** (copier/coller depuis l’onglet CRENEAUX du Google Sheet).

## Page 1 — Qui es-tu ?
- **Short text (required)** → **Nom & Prénom**
- **Short text (optional)** → **Pseudo Discord**

## Page 2 — Quelles matières ? (max 2)
- **Checkboxes (required, Max selections = 2)** → **Sur quoi veux-tu travailler ? (choisis au maximum 2 matières)**
  - Mathématiques
  - Systèmes d'information et bases de données
  - Anglais / TOEIC exam
  - Cyberstructure de l'internet: réseaux et sécurité
  - Systèmes d'exploitation : Linux
  - Coding #Python

## Page 3 — Niveaux (logique conditionnelle)
Pour chaque matière cochée, afficher la question :
- **Multiple choice** → **Ton niveau en {Matière} ?**
  - ✅ Je viens pour aider
  - 🟡 Besoin de confirmer mes acquis
  - 🟠 Besoin d'aide
  - 🔴 Vraiment besoin d'aide
- **Logic** : *Show if* « {Matière} » est sélectionnée en Page 2.

## Page 4 — Disponibilités
- **Checkboxes (multi-select)** → **Choisis tous les créneaux où tu peux venir**
> Ces options changent chaque semaine. Copie/colle les valeurs de la colonne **Texte** de l’onglet **CRENEAUX**.

## Page 5 — Commentaires
- **Long text (optional)** → **Un commentaire ? (optionnel)**

---

### Règles & bonnes pratiques
- Précise « 1 réponse par personne et par semaine — la dernière remplace les précédentes ».
- Si besoin d’anti‑abus, privilégie l’authentification (Google/Discord) plutôt que l’IP.
- Intégrations possibles : Google Sheets, Notion, Make/n8n.