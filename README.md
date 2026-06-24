# yaammoo-website

Site vitrine + pages légales de Yaammoo (React + Vite + React Router), déployable sur Vercel.

## Pages

| Route | Page |
|---|---|
| `/` | Accueil (hero, étapes, features, liens stores) |
| `/support` | Centre d'aide + FAQ |
| `/privacy` | Politique de confidentialité |
| `/accessibility` | Déclaration d'accessibilité |

> Paiement **à la livraison uniquement** (espèces, aucune carte) — reflété dans les pages accueil, support et privacy.

## Développement

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # génère dist/
npm run preview  # prévisualise le build
```

## Déploiement Vercel

Import du dossier dans Vercel — détection auto Vite.

- **Build command** : `npm run build`
- **Output directory** : `dist`
- `vercel.json` réécrit toutes les routes vers `index.html` (SPA) → pas de 404 sur `/privacy`, `/support`, etc.

Tous les liens internes sont relatifs (`react-router-dom`), donc le site fonctionne quel que soit le domaine (`yaammoo.rauval.com`, preview Vercel, etc.).
