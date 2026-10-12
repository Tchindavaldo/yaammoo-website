# SEO — vitrine (`apps/site`) et dashboard (`apps/dashboard`)

La vitrine `https://yaammoo.rauval.com` est entierement indexable : chaque route
est **prerendue en HTML statique au build** (contenu reel + balises `<head>`
propres a la route), sans navigateur. Le dashboard
`https://dashboard.yaammoo.rauval.com` est prive et **jamais indexe**.

---

## Ou vit quoi (vitrine)

| Fichier | Role |
|---|---|
| `src/seo/pages.js` | **Source unique** : `SITE_URL`, `OG_IMAGE`, table `PAGES` (title, description, path, `schemaType`, `noindex`) et `PRERENDER_PAGES` |
| `src/seo/head.js` | Liste des balises gerees par route ; `renderHead(page)` (chaine HTML, build) et `applyHead(page)` (DOM, navigation) |
| `src/seo/jsonld.js` | Graphe schema.org : WebSite, Organization Yaammoo, Organization Rauval, MobileApplication + noeud de la page (WebPage / FAQPage) |
| `src/seo/useSeo.js` | Hook appele en tete de chaque page : `useSeo(PAGES.support)` |
| `src/content/contact.js` | E-mail support, WhatsApp, horaires, lien App Store (pages + JSON-LD) |
| `src/content/faqs.js` | FAQ de `/support`, reprise a l'identique dans le JSON-LD FAQPage |
| `src/entry-server.jsx` | Rendu serveur (`renderToString` + `StaticRouter`), utilise au build seulement |
| `scripts/prerender.mjs` | Ecrit `dist/<route>.html` pour chaque route de `PRERENDER_PAGES` |
| `index.html` | Gabarit : balises communes (icones, manifest, theme-color) + marqueur `<!--seo-head-->` |
| `public/robots.txt`, `sitemap.xml`, `llms.txt`, `site.webmanifest`, `_headers` | Fichiers servis tels quels (voir plus bas) |

> Les balises propres a une route (title, description, robots, canonical,
> hreflang, Open Graph, Twitter, JSON-LD) ne s'ecrivent **jamais** dans
> `index.html` : elles viennent de `src/seo/`.

## Routes et metadonnees

| Route | Fichier servi | Title | Indexee |
|---|---|---|---|
| `/` | `dist/index.html` | Yaammoo — Livraison de repas et produits au Cameroun | oui |
| `/support` | `dist/support.html` | Centre d'aide et contact — Yaammoo | oui (JSON-LD FAQPage) |
| `/privacy` | `dist/privacy.html` | Politique de confidentialité — Yaammoo | oui |
| `/delete-account` | `dist/delete-account.html` | Suppression de compte — Yaammoo | oui |
| toute autre URL | `dist/index.html` (repli SPA) | Page introuvable — Yaammoo | **non** (`noindex`, pas de canonical) |

Balises posees sur chaque page indexable : `<title>`, `description`,
`robots: index, follow, max-image-preview:large`, `canonical` absolu,
`hreflang` `fr` et `x-default` (vers la page elle-meme), `og:type`,
`og:site_name`, `og:locale` (`fr_FR`), `og:title`, `og:description`, `og:url`,
`og:image` (+ largeur, hauteur, type, alt), `twitter:card`
(`summary_large_image`), `twitter:title`, `twitter:description`,
`twitter:image`, et un script `application/ld+json` (`id="seo-jsonld"`).

Longueurs visees : title ~60 caracteres, description 160 maximum.

## Prerendu au build (sans navigateur)

Le build Cloudflare n'a pas de navigateur : pas de Playwright ni de Chromium.
Le prerendu utilise donc `react-dom/server`.

`npm run build` (dans `apps/site`, lance par `npm run build:site`) enchaine :

1. `build:client` — `vite build` : bundle client dans `dist/`, `dist/index.html`
   contient encore le marqueur `<!--seo-head-->` et `<div id="root"></div>`.
2. `build:ssr` — `vite build --ssr src/entry-server.jsx --outDir dist-ssr` :
   l'application compilee pour Node.
3. `prerender` — `node scripts/prerender.mjs` : pour chaque route de
   `PRERENDER_PAGES`, rend l'app avec `StaticRouter`, remplace le marqueur par
   `renderHead(page)`, injecte le HTML dans `<div id="root" data-prerendered="/route">`
   et ecrit `dist/index.html` (pour `/`) ou `dist/<route>.html`. Supprime ensuite
   `dist-ssr/`.

Garde-fous (le build **echoue** avec un message clair) :

- marqueurs absents de `dist/index.html` (script lance sans `vite build`) ;
- `public/sitemap.xml` ne liste pas exactement les routes indexables de
  `PRERENDER_PAGES` (route manquante ou en trop) ;
- une page prerendue n'a pas exactement un `<h1>`.

### Cote client

`src/main.jsx` compare `data-prerendered` a l'URL courante :

- egal : `hydrateRoot` — React reprend le HTML existant sans le reconstruire ;
- different (URL inconnue servie par le repli SPA, qui renvoie l'Accueil) :
  `createRoot` — rendu client complet, la page 404 pose `noindex`.

A chaque navigation, `useSeo` met a jour title, meta, canonical et JSON-LD.

### Regles pour que le rendu serveur reste possible

- Aucun acces a `window`, `document`, `localStorage`... pendant le rendu :
  uniquement dans `useEffect` ou un gestionnaire d'evenement.
- L'arbre rendu dans `entry-server.jsx` doit rester identique a celui de
  `main.jsx` (meme `StrictMode`, meme `App`), sinon l'hydratation echoue.
- Pas de valeur qui change entre serveur et client au premier rendu (date du
  jour, nombre aleatoire) : la calculer dans un `useEffect`.

### URLs et Cloudflare

`assets.html_handling` vaut `auto-trailing-slash` (defaut) : `dist/support.html`
est servi a `/support` (l'URL utilisee dans les liens et le canonical) ;
`/support/` et `/support.html` redirigent vers `/support`.
`not_found_handling: "single-page-application"` est conserve : une URL inconnue
recoit `index.html` avec un statut 200, puis le client affiche la 404 en
`noindex`. Option si un vrai statut 404 devient necessaire : prerendre
`PAGES.notFound` dans `dist/404.html` et passer `not_found_handling` a
`"404-page"` (toutes les routes etant prerendues, le repli SPA n'est plus utile).

## Ajouter une page publique

1. Creer le composant dans `src/pages/` et sa route dans `src/App.jsx`.
2. Ajouter son entree dans `PAGES` (`src/seo/pages.js`) et dans `PRERENDER_PAGES`.
3. Appeler `useSeo(PAGES.maPage)` en tete du composant ; un seul `<h1>`.
4. Ajouter un bloc `<url>` dans `public/sitemap.xml` (`lastmod` = date du jour).
5. Ajouter la page dans `public/llms.txt`.
6. `npm run build:site` puis verifier `apps/site/dist/ma-page.html`
   (title, description, canonical, texte reel dans `#root`).

Quand le contenu d'une page change notablement, mettre a jour son `lastmod`.

## Donnees structurees (JSON-LD)

Uniquement des faits affiches sur le site. Volontairement absents :

- **note, avis, nombre de telechargements** : aucune donnee reelle ;
- **prix (`offers`)** : le site ne dit pas que l'application est gratuite. Si
  elle l'est, ajouter dans le noeud `MobileApplication` de `jsonld.js` :
  `offers: { "@type": "Offer", price: "0", priceCurrency: "XAF" }` ;
- **Android / Google Play** : aucun lien Play Store sur le site, donc
  `operatingSystem: "iOS"`. Ajouter le lien et `"Android"` le jour venu ;
- **reseaux sociaux (`sameAs`)** : aucun profil connu.

Rauval apparait comme `publisher` / `creator` (`@id`
`https://rauval.com/#organization`). Test : Rich Results Test de Google ou
validator.schema.org sur l'URL publiee.

## Fichiers publics

| Fichier | Contenu |
|---|---|
| `robots.txt` | Tout autorise, robots IA cites explicitement (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, Claude-SearchBot, PerplexityBot, Perplexity-User, Google-Extended) + ligne `Sitemap` |
| `sitemap.xml` | Les 4 routes indexables, controle au build |
| `llms.txt` | Resume de Yaammoo pour les assistants IA : service, pages, contact, editeur |
| `site.webmanifest` | Nom, couleurs, icones 192/512, lien App Store (`related_applications`) ; `display: browser` (pas de fausse app installable) |
| `_headers` | Securite sur `/*` (nosniff, Referrer-Policy, X-Frame-Options SAMEORIGIN, Permissions-Policy) ; `/assets/*` cache 1 an `immutable` ; images 1 jour + `stale-while-revalidate` |

`_headers` : une en-tete posee par deux regles qui matchent est concatenee par
Cloudflare, donc `Cache-Control` n'est jamais mis sur `/*`. Pas de CSP (risque
de casser l'app). Les pages HTML gardent le cache par defaut de Cloudflare
(revalidation a chaque visite).

### Images

| Fichier | Usage |
|---|---|
| `og-image.jpg` (1200x630) | Partage social (Open Graph, Twitter) |
| `favicon.ico` (16/32/48), `favicon-32x32.png` | Onglet, resultats Google |
| `apple-touch-icon.png` (180, fond blanc opaque) | Ecran d'accueil iOS |
| `icon-192.png`, `icon-512.png` | Manifest |
| `logo-256.png` | Logo affiche dans les pages (meme cadrage que `logo.png`, 18 Ko au lieu de 300) |
| `logo.png` | Logo d'origine, reference dans le JSON-LD Organization |

Generees une seule fois (hors build) avec `sharp` dans un dossier temporaire,
a partir de `logo.png`. Image OG : degrade `#FF5A1F` -> `#FF8C42` (celui du
hero), logo sur disque blanc a gauche, a droite le titre du hero en police
Inter, le sous-titre, « Disponible sur l'App Store » et `yaammoo.rauval.com`.
Pour la refaire, reproduire cette composition ; garder le nom de fichier ou
mettre a jour `OG_IMAGE` dans `src/seo/pages.js`.

## Dashboard : jamais indexe

- `apps/dashboard/index.html` : `<meta name="robots" content="noindex, nofollow">`.
- `apps/dashboard/public/_headers` : `X-Robots-Tag: noindex, nofollow` sur
  toutes les reponses, `X-Frame-Options: DENY`, memes en-tetes de securite,
  cache `immutable` sur `/assets/*`.
- `apps/dashboard/public/robots.txt` : `Disallow: /`.

NOTE : un robot qui respecte `Disallow` ne lit plus la page, donc ne voit pas
le `noindex`. Si une URL du dashboard apparait un jour dans Google (lien
externe), retirer temporairement le `Disallow` pour que le `noindex` soit lu,
ou utiliser l'outil de suppression de Search Console.

## Apres deploiement

1. Search Console (propriete de domaine `rauval.com`, couvre le sous-domaine) :
   soumettre `https://yaammoo.rauval.com/sitemap.xml`, puis inspecter `/` et
   `/support`.
2. Cloudflare, zone `rauval.com` : verifier que « Block AI bots » est desactive
   et que le robots.txt gere par Cloudflare (AI Crawl Control) ne remplace pas
   celui du site, sinon ChatGPT, Claude et Perplexity ne peuvent pas lire le site.
3. Controle rapide :

```bash
curl -s https://yaammoo.rauval.com/support | grep -E '<title>|canonical'
curl -sI https://yaammoo.rauval.com/assets/<fichier>.js | grep -i cache-control
curl -sI https://dashboard.yaammoo.rauval.com/ | grep -i x-robots-tag
```
