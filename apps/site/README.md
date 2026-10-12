# @yaammoo/site

Site vitrine + pages légales de Yaammoo (React + Vite + React Router), servi sur
`https://yaammoo.rauval.com` par un Worker Cloudflare (voir `architecture/monorepo.md`).

## Pages

| Route | Page |
|---|---|
| `/` | Accueil (hero, étapes, avantages, liens App Store et Google Play) |
| `/support` | Centre d'aide + FAQ |
| `/privacy` | Politique de confidentialité |
| `/delete-account` | Suppression de compte |

> Paiement **à la livraison uniquement** (espèces, aucune carte) — reflété dans les pages accueil, support et privacy.

## Développement

```bash
npm install          # à la racine du monorepo
npm run dev:site     # http://localhost:5173
npm run build:site   # dist/ : build client + prérendu HTML de chaque route
```

Le build prérend chaque route en HTML statique (`dist/index.html`,
`dist/support.html`...) avec ses propres balises SEO, sans navigateur.
Titres, descriptions et ajout d'une page : voir `architecture/seo.md`.
