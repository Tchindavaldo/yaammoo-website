# Écran Boutique (`apps/dashboard/src/pages/Boutique.jsx`)

Route `/boutique`, atteinte par l'item « Boutiques » de la sidebar.

## Origine du design

Portage de `Dashboard Boutique.html`, **branche `sc-if isOverview`** — celle que
le fichier affiche à l'ouverture (`state.page = 'overview'`). Le même fichier
contient une branche `isShop` (bandeau 6 KPI + tiroir fixe Boutique/Livraison)
qui n'est PAS celle portée ici : ce fichier verrouille la navigation
(`// page verrouillee sur 'shops'`), elle est donc inatteignable au clic.

Les styles inline viennent tels quels du fichier de référence (R13).

## Coque et défilement

**La page ne porte pas de header** : la barre haute de `DashboardLayout` est
globale (R10). Son libellé (« Boutique ») vient de la table `TITLES` du layout.
Le header de la maquette n'a donc pas été porté.

`/boutique` figure dans `isBare` : la coque passe en hauteur fixe et le
rembourrage de `.content` est neutralisé.

Montage (identique à `Overview.jsx`) :

```
racine        flex column, minHeight:0, height:100%   (pas de scroll)
└─ contenu    flex:1, minHeight:0, overflowY:auto      (défile sous la barre haute)
```

## Structure

Grille **2 colonnes** pour les marchands (`minmax(0,1.9fr) minmax(230px,1fr)`), **3 colonnes** pour les admins :
`minmax(220px,260px) minmax(0,1.9fr) minmax(230px,1fr)`.

**Colonne 1 (admin uniquement) — `AdminShopRail`** : liste scrollable de toutes
les boutiques via `adminService.getFastFoods()`. Chips de filtre, barre de recherche (filtre local
par nom/catégorie), compteur total. Clic sur une boutique => `setOverrideFastFoodId(id)` (R14).
Bouton « Quitter » quand un override est actif. Design identique à `menus-list-pane`
de Menus (reprise exacte de la structure et des classes CSS `menu-row`).

**Colonne 2 — 4 cartes empilées** : Encaissements · Nouvelles demandes ·
Commandes en retard · Plats à mettre en avant.

**Colonne 3 — Fiche boutique** : photo + badge catégorie ·
nom · 4 stats (Clients, Commandes, Plats, À venir) · barre d'objectif · barres
hebdomadaires L→D (sur place / livrées) · 4 états (Nouvelles, Ouvertes, En cours,
En retard) · équipe en service · 2 boutons d'action bas (Modifier / Supprimer).

## Données (R6)

Tout vient de `useMerchant()` et `useAuth()` ; aucun chiffre en dur.

| Bloc | Source |
|---|---|
| Stats boutique | `orders` (clients distincts via `userId`/`userData.email`), `menus.length`, `isUntreated` |
| États commandes | `tabOf(o.status)` + `isLate()` local |
| Encaissements | `orderTotal`, `o.delivery.fee`, `o.paid`/`o.paymentStatus`, formatés par `formatXAF` |
| Barres L→D | `o.delivery.date` ou `o.createdAt`, normalisées sur le pic |
| Commandes en retard | non traitées dont le créneau est passé, 3 premières |
| Nouvelles demandes | commandes portant `o.note` ou `o.comment`, 3 premières |
| Plats | `menus`, 4 premiers |
| Objectif | `boutique.monthlyGoal` (absent → « Objectif mensuel non defini ») |

Photos réelles (`boutique.image|photo|logo`, `menu.image|photo`) avec repli sur
le placeholder `ImageSlot` du design.

## Points ouverts

Champs devinés, à confirmer avec les payloads Firestore réels : `o.delivery.fee`,
`o.paid` / `o.paymentStatus`, `o.delivery.type`, `o.note`, `boutique.monthlyGoal`.
Les **pourboires** affichent 0 — aucun champ correspondant trouvé.

## Dette

914 lignes, au-dessus du plafond dur de 500 (R4) : à découper à la prochaine
retouche — les sous-blocs de la colonne droite sont les candidats naturels.
