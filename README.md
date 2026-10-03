# yaammoo-website

Monorepo des deux applications web Yaammoo.

| App | Domaine | Role |
|---|---|---|
| [`apps/site`](./apps/site) | `yaammoo.rauval.com` | Site vitrine + pages legales |
| [`apps/dashboard`](./apps/dashboard) | `dashboard.yaammoo.rauval.com` | Gestion fastfood, caisse/facturation, administration |

Code commun dans [`packages/shared`](./packages/shared) (config, client API,
socket, logique de commandes) — porte depuis l'app mobile.

## Developpement

```bash
npm install              # a la racine

npm run dev:site         # http://localhost:5173
npm run dev:dashboard    # http://localhost:5174

npm run build:site
npm run build:dashboard
```

## Documentation

Voir [`architecture/`](./architecture/README.md) :

- [monorepo.md](./architecture/monorepo.md) — structure, workspaces, deploiement Vercel, sous-domaine DNS
- [dashboard.md](./architecture/dashboard.md) — ecrans, contextes, roles
- [shared.md](./architecture/shared.md) — package partage

## Deploiement

Deux projets Vercel sur **le meme repo et la meme branche `main`**, distingues
par leur *Root Directory* (`apps/site` / `apps/dashboard`).
Details et reglages DNS : [architecture/monorepo.md](./architecture/monorepo.md).
