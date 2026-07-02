# Démo 1 — Notes de frais consultants (cycle de dev complet)

## Objectif de la démo
Montrer, sur un seul projet Next.js + MUI, un cycle de développement complet piloté par des skills identiques sur les 3 outils :
1. Construire l'application à partir d'un cahier des charges.
2. Transformer un ticket Jira en fonctionnalité.
3. Écrire les tests unitaires et d'intégration.
4. Automatiser la CI (GitHub Actions).

**Ce dossier ne contient volontairement aucun code d'application** — seulement les cahiers des charges/skills et le ticket Jira. Tout le code est généré en direct pendant la démo.

## Fichiers de configuration
- `jira/JIRA-102.md` — le ticket à utiliser pour la phase 2.
- `CLAUDE.md` / `AGENTS.md` / `.github/copilot-instructions.md` — instructions permanentes du projet.
- 4 skills, configurés à l'identique pour les 3 outils (`build-expense-tracker`, `implement-jira-ticket`, `write-tests`, `setup-ci`), déclinés en :
  - `.claude/skills/<nom>/SKILL.md`
  - `.agents/skills/<nom>/SKILL.md`
  - `.github/prompts/<nom>.prompt.md`

## Déroulé en 4 phases

### Phase 1 — Construire l'app (~10 min)
> "Crée l'application de notes de frais."

Déclenche `build-expense-tracker`. Une fois généré : `npm install && npm run dev`, puis ouvrir `http://localhost:3000`.

### Phase 2 — Transformer un ticket Jira en fonctionnalité (~5-8 min)
> "Implémente le ticket jira/JIRA-102.md."

Déclenche `implement-jira-ticket`. Observez la checklist finale reliant chaque critère d'acceptation du ticket au code livré.

### Phase 3 — Tests unitaires et d'intégration (~5 min)
> "Écris les tests unitaires et d'intégration du projet."

Déclenche `write-tests`. Lancer `npm test` pour vérifier que tout passe.

### Phase 4 — Automatiser la CI (~3-5 min)
> "Mets en place la CI."

Déclenche `setup-ci`. Vérifier le contenu de `.github/workflows/ci.yml` généré. Pour aller plus loin (optionnel, si un dépôt GitHub est prêt) : pousser le dossier pour voir le pipeline s'exécuter réellement.

## Comment lancer chaque phase
- Claude Code : `/nom-du-skill` ou déclenchement automatique selon la demande.
- Codex CLI : `/nom-du-skill`, `$nom-du-skill`, ou déclenchement automatique.
- GitHub Copilot : taper `/nom-du-skill` dans Copilot Chat (mode agent).

## Ce qu'il faut observer
- Phase 1 : respect de la stack (Next.js + MUI) et des 2 modules métier (notes de frais, refacturation régie/forfait).
- Phase 2 : le ticket est-il traduit fidèlement, sans fonctionnalité inventée en plus ?
- Phase 3 : les tests couvrent-ils vraiment la logique métier (régie/forfait), ou juste des détails superficiels ?
- Phase 4 : le pipeline généré est-il correct et complet (lint + tests + build) ?