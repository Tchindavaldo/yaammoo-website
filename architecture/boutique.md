# Écran Boutique (`apps/dashboard/src/pages/Boutique.jsx`)

Route `/boutique`, atteinte par l'item « Boutiques » de la sidebar.

## Origine du design

Portage de `Dashboard Boutique.html`, **branche `sc-if isOverview`** — celle que le fichier affiche à l'ouverture (`state.page = 'overview'`). Le même fichier contient une branche `isShop` (bandeau 6 KPI + tiroir fixe Boutique/Livraison) qui n'est PAS celle portée ici : ce fichier verrouille la navigation (`// page verrouillee sur 'shops'`), elle est donc inatteignable au clic.

Les styles inline viennent tels quels du fichier de référence (R13).

## Coque et défilement

**La page ne porte pas de header** : la barre haute de `DashboardLayout` est globale (R10). Son libellé (« Boutique ») vient de la table `TITLES` du layout. Le header de la maquette n'a donc pas été porté.

`/boutique` figure dans `isBare` : la coque passe en hauteur fixe et le rembourrage de `.content` est neutralisé.

Montage (identique à `Overview.jsx`) :

```
racine        flex column, minHeight:0, height:100%   (pas de scroll)
└─ contenu    flex:1, minHeight:0, overflowY:auto      (défile sous la barre haute)
```

## Structure & Composants Modulaires

Page découpée en sous-composants propres dans `apps/dashboard/src/components/boutique/` :

- **`AdminShopRail.jsx`** : Colonne 1 (admin uniquement) — Liste scrollable, barre de recherche, compteur. **Deux onglets** en tête :
  - **Boutiques actives** (`adminService.getFastFoods()`) — clic sur une ligne => `setOverrideFastFoodId(id)`. Le bouton « Quitter » (sortie de l'override) est passé dans la ligne du compteur.
  - **Boutiques supprimées** (`adminService.getDeletedFastFoods()`) — lignes non sélectionnables, portant un **unique bouton « Restaurer »** (`restoreFastFood`), sans Modifier ni Supprimer. La ligne affiche la date de suppression et disparaît après restauration.
- **`BoutiqueCardsCol.jsx`** : Colonne 2 — 4 cartes empilées : Encaissements · Nouvelles demandes · Commandes en retard · Plats à mettre en avant.
- **`BoutiqueDetailCol.jsx`** : Colonne 3 — Fiche boutique : photo + badge catégorie, nom, 4 stats (Clients, Commandes, Plats, À venir), barre d'objectif, barres hebdomadaires L→D (sur place / livrées), 4 états commandes, section Équipe en service et 2 boutons d'action (Modifier / Supprimer).
- **`BoutiqueEditForm.jsx`** (237 l.) : Coque du tiroir / panneau latéral d'édition (`mpanel` + `mpanel-scrim` flouté) déclenché au clic sur « Modifier ». Porte l'état, l'enregistrement et la bascule d'onglets ; le rendu de chaque onglet vit dans son propre fichier (R4) :
  - **`BoutiqueTab.jsx`** — **Onglet Boutique** : Photo (upload au clic sur l'avatar), Nom, Ouverture/Fermeture, Jours d'ouverture, Contacts & Paiement (Téléphone, Mobile Money, WhatsApp), Règles de commande (délai de livraison, jours réservables).
  - **`LivraisonTab.jsx`** (377 l.) — **Onglet Livraison** :
    - **Localisations & Tarifs** : Gestion dynamique des zones de livraison avec Ville, Zone/Quartier, Frais FCFA et Délai (min).
    - **Vos créneaux de livraison** : créneaux **réels** issus du backend (voir ci-dessous). Plus aucune valeur en dur.
  - **`editFormStyles.js`** : styles inline partagés par les deux onglets (`fieldCard`, `labelStyle`, `inputStyle`, `sectionLabel`).
- **`deliveryHoursAdapter.js`** : conversion entre le contrat backend et le formulaire (voir « Créneaux de livraison »).

## Créneaux de livraison (`deliveryHours`)

Le backend expose les créneaux dans `fastfood.deliveryHours` : une liste d'**heures**, chacune portant ses zones et leurs prix.

```js
[{ hour: "08:00", express: true, periodic: true,
   expressZones:  [{ lieu: "Bonapriso", prix: "1200" }],
   periodicZones: [{ lieu: "Bonapriso", prix: "500" }] }]
```

Le formulaire raisonne à l'inverse (un onglet par **zone**, contenant ses heures). `components/boutique/deliveryHoursAdapter.js` fait la bascule dans les deux sens :

| Sens | Fonction |
|---|---|
| Backend → formulaire | `fromDeliveryHours(boutique.deliveryHours)` — regroupe par `lieu` |
| Formulaire → backend | `toDeliveryHours(zones)` — ré-inverse, prix en string |

Contraintes backend respectées à l'écriture (`utils/deliveryHoursSanitize.js`) : un créneau n'est conservé que s'il a au moins un mode (`express` | `periodic`) à la fois **actif** et pourvu d'au moins une zone valide (`lieu` non vide, `prix` numérique > 0). Les créneaux sans prix exploitable ne sont donc pas envoyés.

⚠️ **`APP_VERSION` doit rester >= 1.0.1** (`packages/shared/src/version.js`). En dessous, le backend rétrograde `deliveryHours` au format legacy (simples strings `"HH:mm"`, sans zone ni prix) via l'en-tête `x-app-version`, et les créneaux réels deviennent inaffichables.

Enregistrement : `updateBoutique(payload)` du `MerchantContext` (POST `/fastfood/:id`), jamais `merchantService` depuis la page (R6/R11). La réponse du backend — créneaux déjà purgés — remplace l'état local.

## Champs du formulaire → contrat backend (R18)

Le backend **ignore silencieusement** toute clé inconnue (200 OK, rien enregistré). Les noms ci-dessous sont ceux de `POST /fastfood/:fastFoodId`, vérifiés dans `BACKEND/architecture/merchants.md`, le swagger de la route et `src/interface/fastfoodFields.js`.

| Champ à l'écran | Clé backend |
|---|---|
| Nom | `name` |
| Photo | `image` (URL Supabase) |
| Ouverture / Fermeture | `openTime` / `closeTime` |
| Téléphone | `number` |
| Mobile Money | `momoNumber` |
| WhatsApp | `whatsappNumber` |
| Délai de livraison | `orderLeadTime` |
| Jours réservables | `advanceDays` |
| Retrait sur place | `pickupAllowed` |
| Localisations | `cities` (tableau de **noms de villes**) |
| Créneaux | `deliveryHours` |

⚠️ **Un seul numéro Mobile Money** côté backend (`momoNumber`, OM ou MoMo indifféremment) — d'où la fusion des anciens champs « Orange Money » et « MTN MoMo ».

⚠️ **`openDays` (jours d'ouverture) n'existe pas côté backend.** Le bloc reste affiché à la demande de l'utilisateur, mais il n'est pas enregistré tant que le champ n'est pas ajouté au contrat.

### Photo de la boutique

Le clic sur l'avatar ouvre le sélecteur de fichier. L'image part **immédiatement** sur `POST /image/upload` (multipart, champ `image`, réponse `{ data: "<url>" }`) via `merchantService.uploadImage()` ; l'URL obtenue est stockée dans l'état `image` et envoyée avec le reste du formulaire à l'enregistrement. Le bouton Enregistrer est désactivé pendant l'envoi.

> ⚠️ **À CORRIGER côté backend — `POST /image/upload` est une route PUBLIQUE.**
> `src/routes/imageRoutes.js` la déclare sans `firebaseAuth` :
> `router.post('/upload', upload.single('image'), handleUpload)`, alors que toutes
> les autres routes d'écriture sont protégées. N'importe qui peut donc téléverser
> dans le bucket Supabase sans compte — remplissage du storage, hébergement de
> contenu arbitraire sur le domaine. `DELETE /image` a le même défaut.
> Correctif attendu : ajouter `firebaseAuth` (et un plafond de taille/type dans
> la config multer). Le web n'a rien à changer : `http.js` envoie déjà le Bearer.

## Édition & suppression (admin)

| Action | Endpoint | Accès |
|---|---|---|
| Modifier | `POST /fastfood/:fastFoodId` via `updateBoutique()` du contexte | Propriétaire **ou** admin (le guard backend laisse passer l'admin sur n'importe quelle boutique) |
| Supprimer | `DELETE /fastfood/admin` via `adminService.deleteFastFoods([id], "all")` | **Admin uniquement** (R14) |

La suppression est un **soft delete** : la boutique reste restaurable pendant `retentionDays` jours avant la purge définitive. La restauration se fait depuis l'onglet « Boutiques supprimées » du rail admin. Le bouton passe par `ConfirmDialog` (R17 — jamais de `window.confirm`) et lève l'override admin après succès.

⚠️ `scopes` est **obligatoire** côté backend — pas de « tout » implicite. `"all"` couvre menus, orders, notifications, bonus, drivers, support, deliveries. Les scopes financiers (withdrawals, settlements, revenues, transactions) sont **refusés** par le backend. Une réponse 207 signale un lot partiellement appliqué (ids inconnus dans `skipped`).

### Grille à hauteur fixe & pagination

`components/boutique/zoneCards.js` (`buildZoneCards`) porte la méthode `zoneCardsData()` du design : la grille affiche **toujours 9 cartes**, quel que soit le nombre de créneaux.

| Position | Contenu |
|---|---|
| 1re carte | « Express » (page 0) · « ‹ Retour » (pages suivantes) |
| Suivantes | Créneaux de la page, triés par heure (prix `periodic` requis) |
| Remplissage | Cartes vides `--:-- / 000 F` si pas assez de créneaux |
| Dernière | « +N · Voir la suite » quand il en reste |

Capacité : 8 créneaux par page, ramenée à 7 quand une carte de navigation occupe la 8e place. Changer de zone remet la page à 0. Vérifié de 0 à 20 créneaux : la grille reste à 9 cartes et aucun créneau n'est perdu.

Grille **2 colonnes** pour les marchands (`minmax(0,1.9fr) minmax(230px,1fr)`), **3 colonnes** pour les admins :
`minmax(220px,260px) minmax(0,1.9fr) minmax(230px,1fr)`.

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
| Objectif | `boutique.monthlyGoal` (absent → « Objectif mensuel non défini ») |

Photos réelles (`boutique.image|photo|logo`, `menu.image|photo`) avec repli sur le placeholder `ImageSlot` du design.

## Dette résolue

Fichier initialement trop volumineux (>1500 lignes). Réduit à ~230 lignes grâce à la modularisation complète des sous-blocs dans `src/components/boutique/`.
