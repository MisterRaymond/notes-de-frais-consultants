---
name: implement-jira-ticket
description: Implémente une fonctionnalité à partir d'un ticket Jira exporté en Markdown dans le dossier jira/. À utiliser quand on demande de développer un ticket ou une carte Jira.
---

# Procédure — Implémenter un ticket Jira

## Étapes obligatoires
1. Lire le ticket indiqué (par défaut, le fichier le plus récent du dossier `jira/`) et extraire son titre, sa description et ses critères d'acceptation.
2. Vérifier la cohérence du ticket avec le cahier des charges existant (skill `build-expense-tracker`) ; signaler tout conflit avant de coder.
3. Implémenter la fonctionnalité en respectant la stack et les conventions du projet (Next.js + MUI, format € et dates français).
4. Ajouter les tests correspondants en suivant le skill `write-tests`.
5. Terminer par une checklist reliant chaque critère d'acceptation du ticket à ce qui a été livré.

## Format de restitution
- La checklist finale liste chaque critère d'acceptation avec ✅ ou ❌ (et pourquoi, si ❌).
- Message de commit suggéré au format : `feat: <résumé court> (JIRA-XXX)`.
