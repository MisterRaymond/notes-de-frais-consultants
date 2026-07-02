---
name: setup-ci
description: Met en place l'intégration continue GitHub Actions (lint, tests, build) pour le projet. À utiliser dès qu'on demande de configurer ou d'automatiser la CI.
---

# Procédure — Intégration continue

## Objectif
Créer le workflow `.github/workflows/ci.yml`, déclenché sur chaque push et pull request vers `main`.

## Étapes du pipeline
1. Installation des dépendances (`npm ci`).
2. Lint (`npm run lint`).
3. Tests (`npm test`).
4. Build (`npm run build`).

## Contraintes
- Utiliser une version de Node.js en LTS (18 ou 20).
- Le pipeline doit échouer si le lint, les tests ou le build échouent.
- Ne pas ajouter de déploiement automatique : la CI se limite à la vérification.
