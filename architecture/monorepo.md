# Monorepo — structure, workspaces et deploiement Vercel

## Pourquoi un monorepo (et pas deux branches)

Le dashboard et la vitrine sont **deux produits differents** qui partagent du
code (types, client API, auth Firebase). Trois options ont ete examinees :

| Option | Verdict |
|---|---|
| Deux **branches** Git, un projet Vercel par branche | ❌ Rejete. Une branche est faite pour etre fusionnee. Deux branches permanentes qui ne mergent jamais divergent : le code partage existe en double, chaque correction demande un cherry-pick manuel, les conflits s'accumulent. |
| Une **seule app**, split par `window.location.hostname` | Possible, mais un seul bundle pour deux produits : le visiteur de la vitrine telecharge le code du dashboard. |
| **Monorepo, deux apps** ✅ | Retenu. Meme branche `main`, un dossier par app, code commun dans `packages/shared`. Builds et deps independants, une seule source de verite. |

> Regle : **branche = version temporaire du meme produit ; dossier = produit
> different.** Deux domaines permanents = deux dossiers, jamais deux branches.

## Workspaces npm

`package.json` racine :

```json
{
  "private": true,
  "workspaces": ["apps/*", "packages/*"]
}
```

Un seul `npm install` a la racine installe les trois packages et lie
`@yaammoo/shared` dans les deux apps (pas de publication npm).

Le dashboard consomme `@yaammoo/shared` **en source**, via un alias Vite :

```js
// apps/dashboard/vite.config.js
alias: {
  "@yaammoo/shared": path.resolve(here, "../../packages/shared/src"),
}
```

Pas d'etape de build intermediaire : Vite compile les sources partagees avec
l'app. Une modification dans `packages/shared` est prise en compte
immediatement en dev (HMR).

## Deploiement Cloudflare — deux Workers, un repo (actuel)

Depuis 2026-10, les deux apps sont hebergees sur **Cloudflare Workers** (fichiers
statiques), comme le site Rauval. Vercel Hobby interdit l'usage commercial.

| App | Worker | Config | Domaine |
|---|---|---|---|
| Vitrine | `yaammoo-site` | `apps/site/wrangler.jsonc` | `yaammoo.rauval.com` |
| Dashboard | `yaammoo-dashboard` | `apps/dashboard/wrangler.jsonc` | `dashboard.yaammoo.rauval.com` |

Reglages a la creation de chaque Worker (Workers & Pages → Create → Import a
repository → `Tchindavaldo/yaammoo-website`) :

| Reglage | Valeur |
|---|---|
| Project name | `yaammoo-site` / `yaammoo-dashboard` (doit egaler `name` du wrangler.jsonc) |
| Root directory (Advanced settings) | `apps/site` / `apps/dashboard` |
| Build command | vide (le build est dans `wrangler.jsonc` > `build.command`) |
| Deploy command | `npx wrangler deploy` |
| Preview builds | desactive (seul `main` deploie) |

- `build.command` installe les workspaces a la racine (`npm ci`) puis lance
  `npm run build:site` / `build:dashboard`. Teste avec `npx wrangler deploy --dry-run`.
- `assets.not_found_handling` : `"404-page"` pour la vitrine (toutes ses routes
  sont prerendues, une URL inconnue recoit `404.html` avec un statut 404, voir
  [seo.md](./seo.md)) ; `"single-page-application"` pour le dashboard (remplace
  le rewrite SPA de `vercel.json`).
- Domaines : declares dans `routes` (`custom_domain: true`) de chaque
  `wrangler.jsonc`. La zone `rauval.com` est sur Cloudflare (DNS, emails Zoho).
  Le certificat est emis automatiquement, y compris pour
  `dashboard.yaammoo.rauval.com` (sous-domaine a deux niveaux, gratuit).
- `workers_dev: false` : pas d'URL de test `*.workers.dev`.
- Watch paths : `yaammoo-site` ne rebuild que sur `apps/site/*` (+ `package*.json`),
  `yaammoo-dashboard` sur `apps/dashboard/*`, `packages/*` (+ `package*.json`).
- Limites (Workers Free) : fichiers statiques gratuits et illimites ; 3 000
  minutes de build par mois partagees par tous les Workers du compte.

## Deploiement Vercel (ancien, a supprimer apres la bascule)

**Les deux projets pointent sur le meme repo et la meme branche `main`.**
Seul le *Root Directory* change.

### Projet 1 — vitrine (existant, a modifier)

| Reglage | Valeur |
|---|---|
| Root Directory | `apps/site` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install --prefix ../..` (ou laisser Vercel detecter les workspaces) |
| Domaine | `yaammoo.rauval.com` (inchange) |

> Le domaine reste attache au meme projet : **aucune coupure DNS** pendant la
> migration.

### Projet 2 — dashboard (a creer)

| Reglage | Valeur |
|---|---|
| Repository | `Tchindavaldo/yaammoo-website` (le meme) |
| Root Directory | `apps/dashboard` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Production Branch | `main` (la meme) |
| Domaine | `dashboard.yaammoo.rauval.com` |

### DNS du sous-domaine

Chez le registrar du domaine `rauval.com`, ajouter :

```
Type    Nom                     Valeur
CNAME   dashboard.yaammoo       cname.vercel-dns.com
```

Vercel affiche la valeur exacte a utiliser dans **Settings → Domains** apres
avoir ajoute le domaine au projet 2. Le certificat HTTPS est emis
automatiquement.

> `yaammoo.rauval.com` etant deja pris par le projet 1, le sous-domaine
> `dashboard.yaammoo.rauval.com` est un **enregistrement DNS distinct** : les
> deux coexistent sans conflit.

### Rewrite SPA

Chaque app a son `vercel.json` avec le meme rewrite — sans lui, un acces direct
a `/commandes` renverrait un 404 :

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

## Variables d'environnement

Aucun secret cote frontend (R14 : la cle MobileWallet ne quitte jamais le
backend). La config publique (Firebase web, URL backend) vit dans
`packages/shared/src/config.js`.

Seule variable optionnelle, pour le dev local contre une API locale :

```bash
# apps/dashboard/.env.local
VITE_API_URL=http://localhost:5000
```

## Ce que la migration a touche

| Avant | Apres |
|---|---|
| `src/`, `index.html`, `vite.config.js`, `public/` a la racine | Deplaces dans `apps/site/` (`git mv`, historique conserve) |
| `package.json` = app vitrine | Racine = workspaces ; l'app vitrine est `apps/site/package.json`, renommee `@yaammoo/site` |
| `vercel.json` racine | `apps/site/vercel.json` (identique) |

Le code source de la vitrine (`src/pages/*.jsx`) n'a **pas ete modifie** : ses
imports sont tous relatifs, donc le deplacement est transparent.
