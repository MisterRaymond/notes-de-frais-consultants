---
description: Construit ou fait évoluer l'application de notes de frais consultants (Next.js + MUI) selon le cahier des charges de l'entreprise.
mode: agent
---

# Cahier des charges — Notes de frais consultants

## Contexte métier
L'entreprise place des consultants chez des clients, selon deux modes de contrat :
- **Régie** : facturation au temps passé (jour/homme).
- **Forfait** : facturation à prix fixe pour une mission.

Chaque note de frais est rattachée à une mission, elle-même rattachée à un client et à un type de contrat (Régie ou Forfait).

## Stack imposée
- Next.js (App Router) + TypeScript.
- MUI (Material UI) pour tous les composants d'interface (Table ou DataGrid, TextField, Select, Chip, Tabs, Card, Alert).
- Pas de backend externe : les données sont stockées côté client via `localStorage` (clé `notes-de-frais-v1`).
- Un seul projet Next.js, lancé avec `npm run dev`.

## Module 1 — Notes de frais
1. Écran de gestion des missions : nom du client, type de contrat (Régie ou Forfait), taux journalier (optionnel).
2. Formulaire d'ajout d'une note de frais : date, mission (sélection parmi les missions existantes), catégorie (Transport, Repas, Hébergement, Autre), montant en euros, statut (Brouillon, Soumis, Validé, Rejeté).
3. Liste des notes de frais sous forme de tableau, triable et filtrable par mission et par statut, avec modification et suppression d'une ligne.
4. Total du mois en cours et total par mission affichés en évidence (MUI Card).

## Module 2 — Refacturation client
1. Règle métier par défaut : une note de frais rattachée à une mission en **Régie** est automatiquement marquée "Refacturable au client" ; une mission au **Forfait** est marquée "À la charge de l'entreprise". L'utilisateur peut forcer manuellement le statut de refacturation sur une note de frais donnée.
2. Un badge (MUI Chip, couleur différente selon le statut) sur chaque ligne de note de frais indique son statut de refacturation.
3. Tableau de bord dédié affichant, par mission puis en cumulé sur le mois : le montant refacturable aux clients vs le montant à la charge de l'entreprise.

## Conventions de l'entreprise
- Montants affichés au format français : `1 234,56 €`.
- Dates affichées au format `JJ/MM/AAAA`.
- Thème MUI avec une seule couleur d'accent (#2563EB), pas de dégradés.
- Toute note de frais sans montant, catégorie ou mission doit être rejetée avec un message d'erreur visible (MUI Alert), pas une alerte JS native.

## Critères d'acceptation
- `npm install && npm run dev` suffit pour lancer l'app localement, sans configuration supplémentaire.
- Recharger la page conserve les missions et les notes de frais saisies.
- Le tableau de bord de refacturation se met à jour immédiatement après ajout, modification ou suppression d'une note de frais.
