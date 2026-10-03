# Architecture — yaammoo-website (monorepo)

Deux applications web deployees depuis **la meme branche `main`**, chacune sur
son propre domaine Vercel, avec un package de code partage.

> **Convention** : mettre a jour le fichier concerne des qu'un composant, un
> service ou un ecran est modifie. Meme regle que `architecture/` de l'app RN.

---

## Index

| Fichier | Contenu |
|---|---|
| [monorepo.md](./monorepo.md) | Structure du monorepo, workspaces, deploiement Vercel, sous-domaine |
| [dashboard.md](./dashboard.md) | Dashboard : ecrans, contextes, routing, roles |
| [design-system.md](./design-system.md) | Tokens, primitives, icones, graphes, regles de rendu |
| [shared.md](./shared.md) | Package `@yaammoo/shared` : config, API, socket, logique commandes |

---

## Les deux apps

| App | Domaine | Stack | Role |
|---|---|---|---|
| `apps/site` | `yaammoo.rauval.com` | React + Vite + React Router | Site vitrine + pages legales (accueil, support, privacy, suppression de compte) |
| `apps/dashboard` | `dashboard.yaammoo.rauval.com` | React + Vite + React Router | Gestion fastfood (web), caisse/facturation, administration plateforme |

Les deux consomment le **meme backend** que l'app mobile :
`https://yaammoo-backend.fly.dev`.

## Structure racine

```
yaammoo-website/
├── apps/
│   ├── site/                 # Vitrine (ex-racine du repo)
│   │   ├── src/pages/        # Home, Support, Privacy, DeleteAccount, NotFound
│   │   ├── index.html
│   │   ├── vite.config.js
│   │   └── vercel.json       # rewrite SPA
│   └── dashboard/
│       ├── src/
│       │   ├── features/     # auth, merchant, orders, pos
│       │   ├── pages/        # Overview, Orders, Pos, Menus, Wallet, admin/
│       │   ├── components/   # DashboardLayout, ui, icons, Chart, Toast
│       │   ├── styles/       # design system decoupe (voir design-system.md)
│       │   └── styles.css    # point d'entree des @import
│       ├── index.html
│       ├── vite.config.js
│       └── vercel.json       # rewrite SPA
│
├── packages/
│   └── shared/               # @yaammoo/shared — code commun
│       └── src/
│           ├── config.js     # apiUrl, Firebase, Google Web Client ID
│           ├── firebase.js   # instance Firebase web unique
│           ├── api/          # http (Bearer auto), merchantService, adminService
│           ├── orders/       # orderGroupKey, orderStatus, groupOrders
│           ├── socket.js     # singleton socket.io + ORDER_EVENTS
│           └── format.js     # XAF, dates FR, numero de facture
│
├── architecture/             # Ce dossier
└── package.json              # workspaces
```

## Rapport avec l'app mobile

Le dashboard est le **portage web de la partie marchand** de l'app RN
(`yaammoo/src/features/merchant/`). La logique metier est reprise a
l'identique — pas reinventee :

| Logique RN | Portage web |
|---|---|
| `utils/orderGroupKey.ts` | `packages/shared/src/orders/orderGroupKey.js` |
| `OrderManagePanel` (filtres, groupage, rank, statuts) | `apps/dashboard/src/pages/Orders.jsx` + `orders/groupOrders.js` |
| `MerchantOrderBottomSheet` (3 onglets) | `features/orders/OrderDetailModal.jsx` |
| `MerchantContext` (upserts socket) | `features/merchant/MerchantContext.jsx` |
| `merchantService.ts` | `packages/shared/src/api/merchantService.js` |
| `walletStatsService.ts` | `merchantService.getWalletStats()` |
| `OtherDatesNotice` | `untreatedCounts()` + bloc `.notice-row` |

> La **logique** est reprise a l'identique ; la **forme** ne l'est pas. Un ecran
> large ne se pilote pas comme un telephone : les onglets de statut du mobile
> deviennent un board a trois colonnes, la liste de menus devient une grille de
> vignettes, et la caisse gagne un rail de categories. Detail dans
> [dashboard.md](./dashboard.md).

**En plus de l'app mobile** : la **caisse (POS)** — le marchand cree une
commande pour un client au comptoir et edite la facture / le bon de caisse —
et les ecrans **administration plateforme**.

## Commandes

```bash
npm install              # a la racine, installe les 3 workspaces

npm run dev:site         # vitrine    → http://localhost:5173
npm run dev:dashboard    # dashboard  → http://localhost:5174

npm run build:site
npm run build:dashboard
```
