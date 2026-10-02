# Consignes projet — yaammoo-website (React / Vite, monorepo npm workspaces)

Ce fichier est **versionné** : ses règles s'appliquent automatiquement sur tout
PC où le projet est cloné/pull, dans n'importe quelle session Claude Code.

> **18 règles numérotées R1 → R18.** Toute nouvelle règle ajoutée à ce fichier
> DOIT recevoir le numéro suivant (R19, R20, …) et le total ci-dessus doit être
> mis à jour. On cite une règle par son numéro (ex. « R1 » pour le style de réponse).
>
> Ce fichier est l'adaptation de `../Y0/yaammoo/CLAUDE.md` (app React Native) au
> présent dépôt web. Les règles transverses (style, modularité, branches, emojis,
> duplication) sont identiques et portent le MÊME numéro dans les deux projets,
> pour qu'on puisse dire « R5 » sans préciser lequel. Seules R2, R6, R10→R14
> diffèrent : elles décrivent une stack web, pas Expo.

## R1 — Style de réponse (OBLIGATOIRE)

**Réponses COURTES.** Aller droit au but : le résultat, pas le cheminement.

- Pas de récapitulatif exhaustif des fichiers modifiés ni de tableaux explicatifs
  si l'utilisateur ne les demande pas. Quelques lignes suffisent.
- Ne pas reformuler la demande, ne pas annoncer ce qu'on va faire : le faire.
- Signaler un problème réel en 1 phrase, sans développer les alternatives.
- Répondre à une question posée = la réponse seule, sans contexte superflu.

**Plafonds DURS** (non négociables, y compris après un gros travail) :

| Type de message | Plafond |
|---|---|
| Question fermée (oui/non, « as-tu touché à X ? ») | **1 à 2 phrases**, la réponse et rien d'autre |
| Compte rendu après modif de code | **3 lignes MAX** |
| Explication demandée explicitement | **10 lignes MAX** |

**INTERDIT sauf demande explicite** :
- Lister les fichiers modifiés avec liens et numéros de ligne — l'utilisateur a le diff.
- Citer des extraits de code déjà écrits, ou expliquer *comment* on a codé.
- Les sections « Conséquences », « À valider », « Note », « Ce que je n'ai pas fait ».
- Proposer la suite du travail (« Tu veux que je… ? ») : s'arrêter après le résultat.
- Les puces qui détaillent chaque changement une par une.

> ⚠️ Après une modification, la réponse par défaut est **une seule phrase** disant
> ce qui marche maintenant. Rien de plus. Si un vrai blocage existe, l'ajouter en
> 1 phrase. Un travail long ne justifie JAMAIS une réponse longue.

## R2 — Périmètre : NE JAMAIS sortir de ce dépôt sans permission (OBLIGATOIRE)

**Interdit d'ouvrir, lire, explorer ou modifier les autres projets yaammoo
(`../Y0/yaammoo/` app mobile, `../Y0/BACKEND/`) sans demande ou autorisation
EXPLICITE de l'utilisateur.** Pas de `Read`, pas de `grep`, pas d'agent, même
« juste pour comprendre » ou « pour vérifier un contrat d'API ».

- Le travail par défaut se fait UNIQUEMENT dans `yaammoo-website/`.
- Si un contrat backend est nécessaire, l'utilisateur le fournit. À défaut,
  faire un `curl` sur l'endpoint — jamais lire le code source du backend.
- Exception permanente : ce `CLAUDE.md` et `.claude/hooks/` sont dérivés de
  `../Y0/yaammoo/` ; on peut les relire pour les resynchroniser.
- En cas de doute réel et bloquant : demander la permission, puis attendre.

## R3 — À lire en DÉBUT de session (OBLIGATOIRE)

> **AU TOUT PREMIER MESSAGE de chaque conversation**, le hook
> `.claude/hooks/session-start-read.sh` (déclaré dans `.claude/settings.json`)
> injecte automatiquement **ce fichier** et `architecture/README.md` en entier.
> La lecture est garantie côté harness — rien à invoquer, aucun `Read` à faire.
>
> **Accusé obligatoire** : la toute première réponse de la session doit commencer
> par la ligne fournie par le hook, seule sur sa ligne :
> `✅ CLAUDE.md lu en entier (N l., 17 règles R1→R17) + architecture/README.md (M l.)`
> Absence de cette ligne = hook non déclenché : le signaler et le réparer.

Lis **`architecture/README.md`** (à la racine) avant de travailler : il donne une vision
360 du projet (workspaces, apps, pages, contextes, services partagés).

**⚠️ INTERDIT : lancer un agent Explore pour "découvrir" le projet.** `architecture/README.md`
et les fichiers `.md` par feature ont été rédigés précisément pour éviter cette perte de temps.
Lis avec `Read` direct (1 seul appel outil) — c'est suffisant. Ne lance un agent Explore ou
`grep`/`find` supplémentaire QUE si tu cherches quelque chose d'ultra-précis introuvable dans
`architecture/` (ex. une signature de fonction exacte). Pas pour "comprendre le projet".

**Tenir à jour** : dès qu'un travail modifie la structure (nouvelle page, composant,
contexte, service partagé) ou rend une description obsolète, **mets à jour**
`architecture/README.md` et les fichiers `.md` concernés avant de clore.

## R4 — Architecture & modularité (OBLIGATOIRE)

L'architecture doit rester **propre, moderne, modulaire**. Règles non négociables :

- **Taille de fichier : viser ~400 lignes, 500 = plafond DUR.** Au-delà de 500,
  découper obligatoirement. Un fichier doit se lire d'un coup (par un humain ET
  par l'agent qui doit le parcourir). Si un fichier que tu touches dépasse, scinde-le
  avant de clore.
- **Un fichier = une responsabilité claire.** On découpe en modules par domaine ;
  on n'empile jamais dans un gros fichier fourre-tout.
- **Monorepo npm workspaces** : `apps/dashboard` (console marchand), `apps/site`
  (site public), `packages/shared` (code commun aux deux). Tout ce qui sert aux
  deux apps va dans `packages/shared`, jamais dupliqué.
- **Features isolées sous `apps/<app>/src/features/`** : chaque feature (auth,
  merchant, menus…) vit dans son dossier avec ses hooks, composants et contexte.
- **Contextes React pour l'état partagé** : AuthContext, MerchantContext,
  ToastProvider. Pas de props drilling.
- **Pages sous `apps/<app>/src/pages/`**, composants transverses sous
  `apps/<app>/src/components/`.

## R5 — Convention de branches Git (OBLIGATOIRE)

> ⚠️ Cette section parle **exclusivement de branches Git** (`git checkout -b ...`).
> Elle n'a rien à voir avec l'organisation des dossiers/features dans le code.
> Quand on dit "isoler un travail", on parle de **l'isoler sur sa propre branche Git**.

**Règle d'or : tout travail de changement — moyen ou important — doit se faire sur
une NOUVELLE branche Git créée AVANT de toucher au code.** Ne jamais coder
directement sur `main`. Avant la moindre modification non triviale, créer la branche
avec le bon préfixe, puis travailler dessus.

Sont concernés (liste non exhaustive) : nouvelle feature, refacto, ajout/duplication
de composant, modification d'un flux, correction de bug. Seules les retouches
ultra-mineures (typo, commentaire, log) peuvent rester sur la branche courante.

Toujours préfixer les branches selon leur nature :

- `debug/<sujet>` — **investigation/résolution d'un bug précis**. Une branche par
  bug. Ex: `debug/dashboard-header-scroll`.
- `feature/<sujet>` — nouvelle fonctionnalité ou durcissement d'une feature.
  Ex: `feature/dashboard-ui`, `feature/boutique-screen`.
- `backup/<sujet>` — sauvegarde d'un état (ne pas y travailler).

Règles de création :
- **Tout travail de debug** commence sur une branche `debug/`, créée depuis la
  branche d'où vient le problème (pas depuis `main`).
- **Tout travail de feature / changement moyen ou important** commence sur une
  branche `feature/`, créée depuis `main` (sauf indication contraire).
- Une branche = un sujet. Ne pas mélanger plusieurs travaux sur la même branche.

## R6 — État & Contextes (OBLIGATOIRE)

**Les contextes React sont la source de vérité** pour l'état partagé. Règles :

- **AuthContext** (`apps/dashboard/src/features/auth/`) : user connecté, rôle
  (`isMerchant` / `isAdmin`), `fastFoodId`, logout.
- **MerchantContext** (`apps/dashboard/src/features/merchant/`) : `orders`,
  `menus`, `transactions`, `boutique`, `loading`, upserts socket, override admin.
- **ToastProvider** (`apps/dashboard/src/components/Toast.jsx`) : retours utilisateur.

**Ne JAMAIS** :
- Stocker l'état partagé en dehors des contextes (pas de singletons globaux, pas
  de Redux sans raison).
- Refetch complet quand un upsert socket suffit (`upsertOrder` / `upsertOrders`).
- Props drilling sur plus de 2 niveaux — utiliser un contexte.
- Appeler `merchantService` directement depuis une page : passer par le contexte.

## R7 — Tests & Validation (RECOMMANDÉ)

- `npm run build:dashboard` doit passer avant de clore — c'est le filet minimal.
- Vérifier le rendu aux deux largeurs : desktop large et ~1280px (le dashboard
  est en coque fixe, les débordements ne se voient qu'à l'étroit).
- Socket : vérifier la reconnexion (couper le WiFi, puis reconnecter).
- Tester avec un compte marchand ET un compte admin (override boutique).

## R8 — Secrets & Configuration

`.env` est gitignoré et ne doit JAMAIS être commité. Ne pas hardcoder de secret
dans le code ; tout passe par `packages/shared/src/config.js`.

Configuration centralisée :
- `apiUrl` (backend REST)
- `socketUrl` (backend Socket.IO)
- `Firebase` (projectId, appId, messagingSenderId)

## R9 — Documentation

Après toute modif des features/pages/composants, **mettre à jour** :
- `architecture/README.md` : index, stack, structure des workspaces
- `architecture/<feature>.md` : si la feature change (hooks, props, flux)

## R10 — Routing & Navigation

- **React Router v6** (`BrowserRouter`) dans `apps/dashboard/src/App.jsx`.
- Layout partagé : `<Route element={<DashboardLayout />}>` + `<Outlet />`.
  La **sidebar** et la **barre haute** de `DashboardLayout` sont GLOBALES à
  toutes les pages — ne jamais les redéclarer dans une page.
- **Une page ne porte JAMAIS son propre header**, même si la maquette en montre
  un : ce header est déjà rendu globalement. Pour changer son libellé sur une
  route, ajouter une entrée à la table `TITLES` de `DashboardLayout`.
- Une page reprise d'un design en pleine hauteur déclare sa route dans `isBare`,
  qui bascule la coque en hauteur fixe (`shell-fixed`) et neutralise le
  rembourrage de `.content`. La barre haute, elle, reste affichée.
- Toute adresse inconnue retombe sur `/` via `<Navigate replace />`.

## R11 — Appels API

- Passer par `packages/shared/src/api/` (`merchantService`, `adminService`),
  jamais d'`axios`/`fetch` direct dans une page.
- `http.js` centralise la base URL et l'auth : ne pas la contourner.
- Gérer les erreurs : toast utilisateur + log console.
- Pas de `try-catch` sans gestion d'erreur (toujours afficher un feedback).

## R12 — Socket.IO

- `socketService` (`packages/shared/src/socket.js`), branché dans MerchantContext.
- Rejoindre la room de la boutique au montage, la quitter au démontage.
- Les événements (`ORDER_EVENTS`) font un **upsert local**, pas un refetch complet.
- Gérer la reconnexion automatiquement.

## R13 — Portage d'un design (IMPORTANT)

Les écrans viennent de maquettes `.dc.html` fournies par l'utilisateur.

**Ordre logique** :
1. **Identifier la bonne branche** du template (`sc-if isOverview`, `isShop`…).
   Un fichier de design s'ouvre sur une branche par défaut (`state.page`) : c'est
   celle-là que l'utilisateur voit et décrit, sauf mention contraire. **Demander
   en cas de doute** plutôt que de porter la mauvaise section.
2. **Reprendre les styles inline tels quels** : chaque taille, couleur, rayon et
   gap vient du fichier de référence. Ne pas « améliorer » la maquette.
3. **Ne porter que le contenu** : la sidebar et le header du design sont déjà
   fournis globalement par `DashboardLayout` (R10). Le header de la maquette se
   jette — on ne le recopie pas dans la page.
4. **Brancher les vraies données** via les contextes (R6) — une maquette livrée
   avec ses chiffres en dur n'est pas finie.
5. Vérifier le défilement : header figé hors du conteneur `overflow-y:auto`,
   contenu scrollable en dessous.

## R14 — Rôles & accès

- Le dashboard est réservé aux **marchands** et **admins** (`Gate` dans `App.jsx`).
- Un admin peut piloter une autre boutique (`overrideFastFoodId`) : le bandeau de
  pilotage doit rester visible tant que l'override est actif.
- Ne jamais afficher de données d'une boutique sans passer par `fastFoodId`
  résolu par le contexte.

## R15 — Emojis : statut SEULEMENT (OBLIGATOIRE)

**Aucun emoji décoratif**, nulle part : ni dans le code, ni dans les commentaires,
ni dans la doc, ni dans les logs, ni dans les messages de commit.

INTERDIT (décoratif) : `⭐` `📏` `🚨` `🎉` `🎬` `🎁` `🚀` `🔔` `🛵` `🍽` `🥤` `★` `➕`…
Pour mettre en avant, utiliser du **texte** (`IMPORTANT`, `NOTE`, `OBLIGATOIRE`)
ou le gras Markdown. Une icône d'interface passe par le composant `Icon`, jamais
par un caractère emoji.

AUTORISÉ (statut, valeur sémantique) : `⚠️` avertissement · `✅` / `✓` succès ·
`❌` erreur · `✕` fermeture. Ils portent une information lue d'un coup d'œil dans
les logs, les tableaux de doc et les encadrés — on les garde.

> S'applique à l'identique à l'app mobile (`../Y0/yaammoo/CLAUDE.md`, R15) et au
> backend (`../Y0/BACKEND/CLAUDE.md`, R19).
> Un emoji décoratif croisé dans un fichier qu'on touche = le retirer avant de
> clore, même s'il était déjà là. Les emojis de statut, on n'y touche pas.

## R16 — Jamais de composant partagé entre écrans (OBLIGATOIRE)

**Ne JAMAIS modifier un composant utilisé par un autre écran pour les besoins
de l'écran courant. On DUPLIQUE, toujours.**

Quand un écran a besoin d'un composant qui existe déjà ailleurs (carte KPI,
tiroir, ligne de tableau…), on en fait une **copie dédiée** dans le dossier de
la feature courante, puis on l'adapte librement. On n'ajoute pas de prop
`variant`/`height`/`mode` à l'original pour couvrir les deux cas.

- Pourquoi : une prop ajoutée « juste pour ce cas » fait porter à l'original le
  risque de casser l'écran d'origine à chaque évolution. Deux écrans qui se
  ressemblent aujourd'hui divergent demain.
- Nommage : préfixer la copie par le domaine (`BoutiqueKpiCard` copié de
  `OverviewKpiCard`), et le dire en commentaire d'en-tête.
- La duplication vaut pour les **composants** (rendu/UI). Les **services purs**
  et utilitaires sans état (`formatXAF`, `groupOrders`, `orderStatus`…) restent
  partagés dans `packages/shared` : ils n'ont pas de rendu à faire diverger.
- Un fichier dupliqué reste soumis à R4 : s'il dépasse 500 lignes, le découper.

## R17 — Jamais de dialogue natif du navigateur (OBLIGATOIRE)

**Aucun `window.confirm`, `window.alert`, `window.prompt`.** Ces boîtes ne sont
pas stylables, bloquent le thread, ignorent totalement le design du dashboard et
s'affichent avec l'URL du site en titre. Tout retour ou toute demande à
l'utilisateur passe par un composant maison, soigné et cohérent avec l'écran.

| Besoin | À utiliser |
|---|---|
| Confirmer une action destructive | `components/ConfirmDialog.jsx` (voile flouté + carte centrée) |
| Informer d'un succès / d'une erreur | `ToastProvider` (`useToast()`, R6) |
| Demander une saisie | Un champ dans un tiroir `mpanel` ou une modale dédiée |

La modale doit gérer : fermeture par Échap, clic sur le voile, état `busy`
pendant l'appel réseau (boutons désactivés), et un libellé d'action explicite
(« Supprimer », pas « OK »).

> Un `confirm()` croisé dans un fichier qu'on touche = le remplacer avant de
> clore, même s'il était déjà là.

## R18 — Vérifier les champs backend AVANT d'écrire un appel API (OBLIGATOIRE)

**Toute création ou modification d'un appel backend (POST/PATCH/PUT/DELETE)
commence par vérifier le nom EXACT des champs attendus.** Ne jamais deviner une
clé à partir du nom affiché dans l'UI ou du state du formulaire.

Pourquoi : le backend **ignore silencieusement** les champs inconnus. Aucune
erreur, un `200 OK`, et rien n'est enregistré. Constaté le 2026-09-16 : le
formulaire boutique envoyait `whatsapp`, `deliveryDelay`, `bookingDays`,
`pickupEnabled`, `deliveryLocations` alors que le backend attend
`whatsappNumber`, `orderLeadTime`, `advanceDays`, `pickupAllowed`, `cities`.
Tout était perdu sans le moindre signal.

**Ordre de vérification** (s'arrêter dès qu'on a la réponse) :

1. `../Y0/BACKEND/architecture/<feature>.md` — la doc de la feature ;
2. le **Swagger** du backend (blocs `@swagger` dans `src/routes/*.js`) ;
3. si rien : le **service** et le **controller** de la route
   (`src/services/…`, `src/controllers/…`), et pour les fastfoods le contrat
   `src/interface/fastfoodFields.js`.

Cet accès au dépôt backend relève de R2 : il demande l'autorisation explicite de
l'utilisateur, et le hook `require-foreign-repo-read.sh` l'exige de toute façon.

**Après l'écriture**, vérifier que ça a réellement pris : un `curl` sur
`GET /<ressource>/:id` et un `updatedAt` qui bouge. Un `200` ne prouve rien.

> Un champ qui n'existe pas côté backend ne s'invente pas côté web : soit il est
> retiré du formulaire, soit on demande son ajout au backend. On ne laisse
> jamais un champ qui fait semblant d'être enregistré.
