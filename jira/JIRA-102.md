# JIRA-102 — Export CSV des notes de frais validées

**Type** : Story
**Priorité** : Moyenne
**Sprint** : Sprint 14
**Labels** : notes-de-frais, export, comptabilité

## Description
En tant que responsable comptable, je veux exporter les notes de frais au statut "Validé" au format CSV, avec leur statut de refacturation, afin de les intégrer dans notre outil de comptabilité.

## Critères d'acceptation
- Un bouton "Exporter CSV" est visible sur l'écran des notes de frais.
- L'export ne contient que les notes de frais au statut "Validé".
- Si un filtre par mission est actif, l'export ne contient que les notes de frais de cette mission.
- Le fichier généré contient les colonnes : Date, Mission, Client, Catégorie, Montant, Statut de refacturation.
- Le nom du fichier suit le format : export-notes-de-frais-JJMMAAAA.csv.
