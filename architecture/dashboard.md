# Dashboard — `apps/dashboard`

Version web de la gestion fastfood (portage de la partie marchand de l'app RN),
plus la **caisse/facturation** et l'**administration plateforme**.

```
apps/dashboard/src/
├── App.jsx                       # Router + garde d'acces (Gate)
├── main.jsx
├── styles.css                    # point d'entree -> styles/ (voir design-system.md)
├── styles/                       # tokens, base, controls, surfaces, feedback,
│                                 # layout, menus, screens, analytics, print
├── components/
│   ├── DashboardLayout.jsx       # coque : rail lateral + topbar + <Outlet/>
│   ├── ui.jsx                    # primitives (Btn, Kpi, StatusPill, Timer, Modal…)
│   ├── icons.jsx                 # jeu d'icones SVG inline, sans dependance
│   ├── Toast.jsx                 # retours d'action non bloquants
│   ├── boutique/                 # blocs de l'ecran Boutique
│   └── analytics/                # blocs de l'ecran Analytics
├── features/
│   ├── auth/AuthContext.jsx      # Firebase Auth + profil backend + roles
│   ├── merchant/MerchantContext.jsx  # commandes, menus, transactions, socket
│   └── menus/                    # formulaire de menu
└── pages/
    ├── Login.jsx
    ├── Menus.jsx
    ├── Overview.jsx
    ├── Boutique.jsx
    └── Analytics.jsx
```

---

## Routing et roles

| Route | Ecran | Acces |
|---|---|---|
| `/`, `/menus` | Catalogue | marchand + admin |
| `/overview` | Vue d'ensemble | marchand + admin |
| `/boutique` | Boutique | marchand + admin |
| `/analytics` | Statistiques d'usage de l'app | admin (item du rail masque sinon) |

> ⚠️ Les sections Orders, Pos, InvoiceModal, Wallet et Admin* plus bas decrivent
> des ecrans **absents du code actuel** (pas de route, pas de fichier). A
> reprendre ou retirer quand ils seront (re)construits.

**Garde d'acces** (`Gate` dans `App.jsx`) :

```
loading            → ecran de verification
!isSignedIn        → <Login/>
!isMerchant &&
  !isAdmin         → "Acces reserve" + deconnexion
sinon              → MerchantProvider + routes
```

Les routes admin ne sont **montees que si `isAdmin`** — un marchand ne peut pas
y acceder en tapant l'URL.

## AuthContext

Firebase Auth donne l'identite ; `GET /user/:uid` donne le profil et le role.

| Champ | Derivation |
|---|---|
| `isSignedIn` | `user && userData` |
| `isMerchant` | `userData.fastFoodId` present |
| `isAdmin` | `userData.isAdmin` |
| `fastFoodId` | `userData.fastFoodId` |

Connexion : email/password ou **Google popup** (`signInWithPopup` — la version
web du Google Sign-In de l'app RN).

> **Prerequis backend** : le flag `isAdmin` doit exister sur le document
> utilisateur pour ouvrir la partie administration. Sans lui, le compte entre en
> mode marchand seul. Aucun autre changement backend n'est necessaire.

## MerchantContext

Portage de `MerchantContext.tsx` (app RN) : memes donnees, memes upserts socket.

- Charge en parallele commandes, menus, boutique, puis transactions.
- **Temps reel** : rejoint la room `fastfood:<id>` et branche les huit
  evenements `ORDER_EVENTS`. Les payloads sont injectes directement dans le
  state (`upsertOrder`, `upsertOrders`, `upsertMenu`, `removeMenu`) — **pas de
  refetch**, exactement comme l'app mobile.
- `updateStatus` et `delegateOrder` patchent le state local apres succes.
- **`setOverrideFastFoodId(id)`** : specifique au web. Permet a un admin de
  piloter une autre boutique que la sienne ; tous les ecrans marchand basculent
  alors sur cette boutique.

## Orders.jsx — board de commandes

Portage d'`OrderManagePanel` **pour la logique**, mais pas pour la forme : les
onglets de statut du mobile deviennent **trois colonnes cote a cote**. Le
marchand voit d'un coup ce qui attend, ce qui est en cuisine et ce qui est pret,
sans changer d'onglet — c'est un plan de travail, pas un journal.

| Colonne | Statuts (`STATUS_MAP`) |
|---|---|
| A traiter | `pending` |
| En preparation | `processing`, `active`, `in_progress` |
| Prete / livree | `completed`, `finished`, `done`, `delivering`, `delivered` |

Chaque colonne est filtree par `filterOrders` puis groupee par `groupBySlot` —
memes fonctions partagees que le mobile.

**La carte-ticket** (`features/orders/OrderTicket.jsx`) porte, dans cet ordre :
rang de service (le rang 1 en accent), initiales et identite du client,
**chrono d'attente**, les trois premieres lignes de la commande, les etiquettes
livraison, le montant du groupe et le bouton d'avancement.

> Le **chrono** (`Timer`) n'existe pas sur mobile : il affiche le temps ecoule
> depuis `createdAt` et vire a l'orange a 15 min, au rouge a 30 min. C'est le
> signal le plus utile au comptoir.

Filtres conserves : **date** (fleches jour precedent / suivant, saisie directe,
retour a aujourd'hui) et **periodes** multi-cochables derivees de la date active.

**Avancement de statut a deux portees**, comme sur mobile :

- bouton de la **carte** → avance **tout le groupe** (`Promise.all`), avec toast
  de confirmation ;
- bouton du **detail** → avance **la seule commande affichee**.

Les cartes passe / futur (`untreatedCounts`) sont cliquables : elles amenent
directement a la date non traitee la plus proche.

## OrderDetailModal — detail d'une commande

Portage de `MerchantOrderBottomSheet`, memes trois onglets :

| Onglet | Contenu |
|---|---|
| **Commande** | menu, quantite, extras, boissons, total |
| **Livraison** | type, date, creneau, zone, adresse, telephone, note, frais |
| **Montant** | recap par commande du groupe + total du groupe |

Navigation **Precedente / Suivante** quand la ligne est groupee, plus un bouton
**Facture** qui ouvre `InvoiceModal` sur tout le groupe.

## Pos.jsx — caisse (nouveau, absent de l'app mobile)

Trois volets, dans le sens de la manipulation : **rail de categories →
tuiles de menus → ticket**. Cibles larges et prix lisibles de loin : c'est un
poste debout, souvent tactile.

Le rail suit les categories du catalogue (`categorie` / `category` / `type`)
quand elles existent ; sinon il retombe sur disponible / en rupture — il y a
toujours quelque chose d'utile a filtrer.

1. Touche sur une tuile → ajout au ticket. La tuile porte alors un badge de
   quantite et un lisere accent ; un menu indisponible est desactive.
2. Saisie du client (nom, telephone) et du mode : **sur place** ou
   **livraison** (adresse + frais).
3. « Valider et imprimer » → **une commande par ligne** via `POST /order` (le
   backend modelise une commande = un menu, comme cote client), avec
   `source: "pos"`.
4. `InvoiceModal` s'ouvre sur les commandes creees ; un toast confirme.

Le **total** est le seul chiffre lisible a un metre : il domine le panneau.

## InvoiceModal — facture / bon de caisse

Document imprimable : en-tete boutique, numero `YAM-AAAAMM-XXXXXX`, client,
lignes (designation / qte / P.U. / total), sous-total, livraison, total.

L'impression passe par `window.print()` ; `styles/print.css` masque la coque et
tout ce qui porte `.no-print` pour ne laisser que la facture.

## Autres ecrans

| Ecran | Forme | Pourquoi |
|---|---|---|
| **Overview** | Bandeau KPI + file d'attente en cartes-tickets + histogramme 7 jours | Ce qu'il faut savoir en entrant : la recette, ce qui attend, la tendance |
| **Menus** | Grille de vignettes (image, prix, disponibilite) | On reconnait un plat a son image, pas a une ligne de tableau |
| **Wallet** | Bandeau KPI + histogramme des gains + tableaux | Le graphe donne la forme, le tableau reste exhaustif |
| **AdminShops** | Grille de cartes-boutiques, bouton **Piloter** | Une boutique est une entite, pas une ligne |
| **AdminOrders** | Bandeau KPI + filtres + tableau | C'est un journal : on y lit vraiment en colonnes. Plafond 300 lignes |
| **AdminUsers** | Bandeau KPI + recherche + tableau | Idem. Comptes derives des boutiques et des commandes |

> **AdminUsers** : un endpoint backend de listing des comptes donnerait une vue
> exhaustive, utilisateurs sans commande compris.

## Analytics.jsx — statistiques d'usage (admin)

Un seul item du rail (« Analytics », groupe PILOTAGE, `adminOnly`) ouvre une
seule page, organisee comme Menus / Boutique (barre haute partagee, colonnes
qui defilent chacune). Service : `analyticsService` (`packages/shared/src/api/`),
routes backend `/analytics/*` (doc backend `architecture/analytics.md`). Les
lignes portent `user { name, email, phone }`.

Barre de mode : chips « Par utilisateur » / « Vue globale » (`?vue=globale`),
pastille de periode, Actualiser. Rien ne defile : chaque carte est un resume,
« Tout voir » ouvre le detail dans le panneau droit (`.mpanel`,
`AnalyticsPanel.jsx` : parcours, boutiques, recherches, bannieres, historique
d'un utilisateur).

**Vue globale** (`AnalyticsGlobal`, langage de la Vue d'ensemble) : heros
« Utilisateurs actifs » (courbe par jour) + 8 tuiles KPI avec mini-graphe et
evolution (2e moitie vs 1re de la periode), puis parcours en colonnes,
boutiques en barres, recherches. Source principale `/daily`.

**Vue par utilisateur** :

| Colonne | Contenu | Source |
|---|---|---|
| Gauche — `AnalyticsUsersPane` | liste `menu-row` des utilisateurs : chips Actifs / En ligne, tri (recents, connexions, temps, boutiques vues), Actualiser | fusion `/connections/stats` + `/sessions/stats` + `/home-scroll` + `/online` par `userId` |
| Centre — `AnalyticsCards` | Audience (pastille de periode, chiffres, barres empilees par jour), Navigation du home, Parcours de commande, Boutiques les plus vues (vignettes photo), Recherches, Bannieres | `/daily`, `/sessions/stats`, `/home-scroll`, `/funnel`, `/shops`, `/searches`, `/banners` + noms/photos via `adminService` |
| Droite — `AnalyticsUserFiche` | fiche de l'utilisateur selectionne : bandeau, stats, scroll du home, repartition de l'activite, sessions, derniers evenements | `/users/:userId` |

En ligne : rafraichi toutes les 30 s. Sous 1280 px la fiche est masquee.

## Coque

`DashboardLayout` : barre laterale **repliable** (etat garde dans
`localStorage`, tiroir avec voile en dessous de 1020px), selecteur de boutique,
barre haute avec temoin temps reel et actualisation.

Quand un admin pilote une autre boutique, un **bandeau de pilotage** le rappelle
en permanence avec un retour direct a sa boutique.

## Design system

Voir **[design-system.md](./design-system.md)** : tokens, primitives, icones,
regles de graphes et de rendu.

Conforme a R15 : aucun emoji decoratif ; les icones passent par `<Icon>`.
