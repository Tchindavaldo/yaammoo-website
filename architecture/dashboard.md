# Dashboard — `apps/dashboard`

Version web de la gestion fastfood (portage de la partie marchand de l'app RN),
plus la **caisse/facturation** et l'**administration plateforme**.

```
apps/dashboard/src/
├── App.jsx                       # Router + garde d'acces (Gate)
├── main.jsx
├── styles.css                    # design system dashboard
├── components/
│   ├── DashboardLayout.jsx       # sidebar + topbar + <Outlet/>
│   └── ui.jsx                    # Stat, StatusPill, Chip, Empty, Loading, Modal, Field
├── features/
│   ├── auth/AuthContext.jsx      # Firebase Auth + profil backend + roles
│   ├── merchant/MerchantContext.jsx  # commandes, menus, transactions, socket
│   ├── orders/OrderDetailModal.jsx   # detail 3 onglets
│   └── pos/InvoiceModal.jsx      # facture imprimable
└── pages/
    ├── Login.jsx
    ├── Overview.jsx
    ├── Orders.jsx
    ├── Pos.jsx
    ├── Menus.jsx
    ├── Wallet.jsx
    └── admin/
        ├── AdminShops.jsx
        ├── AdminOrders.jsx
        └── AdminUsers.jsx
```

---

## Routing et roles

| Route | Ecran | Acces |
|---|---|---|
| `/` | Vue d'ensemble | marchand + admin |
| `/commandes` | Gestion des commandes | marchand + admin |
| `/caisse` | Caisse (POS) + facture | marchand + admin |
| `/menus` | Catalogue | marchand + admin |
| `/portefeuille` | Solde, gains, transactions | marchand + admin |
| `/admin/boutiques` | Toutes les boutiques | admin |
| `/admin/commandes` | Toutes les commandes | admin |
| `/admin/utilisateurs` | Comptes | admin |

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

## Orders.jsx — gestion des commandes

Portage d'`OrderManagePanel`. Le tableau web remplace la `FlatList`, mais la
logique est celle du mobile :

- **Onglets de statut** avec compteurs (`STATUS_TABS`).
- **Filtre date** (input date + chips des dates disponibles) et
  **filtre periodes** multi-cochables, derivees de la date active.
- **Groupage** par `orderGroupKey` : une ligne par groupe, affichant la commande
  la mieux classee et son rang. Le badge « N commandes groupees » signale le
  regroupement.
- **Avancement de statut a deux portees**, comme sur mobile :
  - bouton de la **ligne** → avance **tout le groupe** (`Promise.all`) ;
  - bouton du **detail** → avance **la seule commande affichee**.
- **`OtherDatesNotice`** : les deux cartes passe (rouge) / futur (bleu) avec
  compteurs globaux de commandes non traitees sur les autres dates.

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

Le marchand encaisse un client au comptoir :

1. Clic sur les menus → constitution du ticket (quantites ajustables).
2. Saisie du client (nom, telephone) et du mode : **sur place** ou
   **livraison** (adresse + frais).
3. « Valider et editer la facture » → **une commande par ligne** via
   `POST /order` (le backend modelise une commande = un menu, comme cote
   client), avec `source: "pos"`.
4. `InvoiceModal` s'ouvre sur les commandes creees.

## InvoiceModal — facture / bon de caisse

Document imprimable : en-tete boutique, numero `YAM-AAAAMM-XXXXXX`, client,
lignes (designation / qte / P.U. / total), sous-total, livraison, total.

L'impression passe par `window.print()` ; le bloc `@media print` de
`styles.css` masque la sidebar, la topbar et les boutons (`.no-print`) pour ne
laisser que la facture.

## Ecrans admin

| Ecran | Contenu | Note |
|---|---|---|
| **AdminShops** | Toutes les boutiques, recherche, bouton **Piloter** (bascule le contexte marchand) | — |
| **AdminOrders** | Commandes de toutes les boutiques, filtres statut / boutique / date | Agregation client ; affichage plafonne a 300 lignes |
| **AdminUsers** | Comptes derives des proprietaires de boutiques et des clients vus dans les commandes | Un endpoint backend de listing donnerait une vue exhaustive |

## Design system

`styles.css` — variables CSS, dense et oriente donnees, **volontairement
distinct de la vitrine** : c'est un outil de travail, pas une page marketing.
Couleurs de statut alignees sur l'app mobile (attente orange, en cours bleu,
termine vert, retard rouge).

Conforme a R15 : aucun emoji decoratif ; seuls `⚠️` et `❌` (statut) sont
utilises, dans les messages d'erreur.
