---
name: write-tests
description: Écrit ou complète les tests unitaires et d'intégration de l'application de notes de frais. À utiliser dès qu'on demande d'ajouter, compléter ou vérifier les tests.
---

# Procédure — Tests unitaires et d'intégration

## Stack de test imposée
- Vitest comme test runner.
- React Testing Library pour les tests de composants et d'intégration.
- Fichiers `*.test.ts` / `*.test.tsx` à côté du code testé.

## Tests unitaires attendus
- Fonctions de calcul pures : total par mission, total mensuel, formatage € et date, règle de refacturation régie/forfait.

## Tests d'intégration attendus
- Ajout d'une note de frais via le formulaire jusqu'à son apparition dans le tableau et dans les totaux.
- Une note de frais incomplète (sans montant, catégorie ou mission) est rejetée avec un message visible.
- Changement du statut de refacturation d'une note de frais et répercussion immédiate sur le tableau de bord.

## Critères d'acceptation
- `npm test` lance toute la suite et se termine sans erreur.
- Toute fonctionnalité livrée par le skill `implement-jira-ticket` s'accompagne d'au moins un test unitaire et un test d'intégration.
