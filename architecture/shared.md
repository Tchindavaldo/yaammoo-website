# Package `@yaammoo/shared`

Code commun aux deux apps web. **Aucun rendu** : uniquement config, appels
reseau et logique metier pure — conforme a R16 (les services purs se
partagent, les composants se dupliquent).

```
packages/shared/src/
├── config.js          # apiUrl, socketUrl, Firebase, Google Web Client ID
├── firebase.js        # instance Firebase web unique (getApps() garde)
├── api/
│   ├── http.js        # axios + Bearer token Firebase automatique
│   ├── merchantService.js
│   └── adminService.js
├── orders/
│   ├── orderGroupKey.js
│   ├── orderStatus.js
│   └── groupOrders.js
├── socket.js          # singleton socket.io + ORDER_EVENTS
└── format.js          # XAF, dates FR, numero de facture
```

---

## config.js

Valeurs alignees sur `yaammoo/src/api/config.ts` (app RN) : meme backend, meme
projet Firebase. Le web utilise le **Web Client ID** Google.

| Cle | Valeur |
|---|---|
| `apiUrl` | `VITE_API_URL` si defini, sinon `https://yaammoo-backend.fly.dev` |
| `socketUrl` | idem |
| `firebaseConfig` | projet `yaammoo-d9de1` |
| `googleWebClientId` | Web Client ID (type "Web application") |

## api/http.js

Client axios partage. Deux intercepteurs :

1. **Requete** : si un utilisateur Firebase est connecte, pose
   `Authorization: Bearer <idToken>`. Cote RN le token etait ajoute appel par
   appel ; ici c'est automatique.
2. **Reponse** : normalise les erreurs backend en `Error` avec un message
   lisible (`response.data.message` → `error` → `message`).

## api/merchantService.js

Portage de `yaammoo/src/features/merchant/services/merchantService.ts`.
**Memes endpoints, memes contrats.**

| Methode | Endpoint |
|---|---|
| `getOrders(fastFoodId)` | `GET /order/all/:fastFoodId` |
| `updateOrderStatus(id, status)` | `PUT /order` `{ id, status }` |
| `delegateOrder(id, driverId)` | `PUT /order` `{ id, driverId }` |
| `getMenus(fastFoodId)` | `GET /menu/:fastFoodId` |
| `addMenu(fastFoodId, menu)` | `POST /menu` |
| `getTransactions(userId)` | `GET /transaction/:userId` |
| `getWalletStats(period)` | `GET /wallet/stats?groupBy=day&period=` |
| `createOrder(payload)` | `POST /order` — utilise par la caisse |
| `getUser(uid)` | `GET /user/:uid` |
| `getFastFood(id)` | `GET /fastfood/:id` |

> `delegateOrder` pose `driverId` **sans changer le statut** : la commande reste
> `finished` (en attente de livraison) mais assignee. Comportement identique a
> l'app RN.

## api/adminService.js

Vue transverse plateforme. Le backend n'expose pas d'endpoint global de
commandes : `getAllOrders()` **parallelise par boutique** avec
`Promise.allSettled` (une boutique en erreur ne casse pas la vue).

| Methode | Source |
|---|---|
| `getFastFoods()` | `GET /fastfood/all` |
| `getBanners()` | `GET /fastfood/all` → `banners[]` |
| `getOrdersOf(id)` | `GET /order/all/:id` |
| `getAllOrders(ids)` | agregation client |

## orders/orderGroupKey.js

**Portage a l'identique** de `yaammoo/src/features/merchant/utils/orderGroupKey.ts`.
Regle unique de groupage — deux commandes se groupent si elles partagent le
meme client, la **meme date** et :

| Type de livraison | Cle |
|---|---|
| Programmee (`status === true`, `type !== 'express'`, `time`) | `userId` + date + `time` + zone |
| Express (`status === true`, `type === 'express'`) | `userId` + date + zone |
| Sur place (`status !== true`) | `userId` + date |

> ⚠️ La **date fait partie de la cle**. Sans elle, un meme client verrait ses
> commandes de jours differents fusionner en un seul groupe.

`orderPeriodKey()` (ajout web) derive la periode d'une commande :
`surplace` | `express` | creneau horaire — utilisee par les chips de filtre.

## orders/orderStatus.js

| Onglet | Label | Statuts Firestore |
|---|---|---|
| `pending` | En attente | `pending` |
| `proccess` | En cours | `processing`, `active`, `in_progress` |
| `finish` | Terminees | `completed`, `finished`, `done`, `delivering`, `delivered` |

`nextStatus(status)` donne l'etape suivante du cycle marchand :
`pending → processing → finished → delivering → delivered`.

## orders/groupOrders.js

Portage de la logique `groupBySlot` d'`OrderManagePanel`.

| Fonction | Role |
|---|---|
| `sortByRank(orders)` | tri `rank ASC` ; sans rank → dernier (`Infinity`) |
| `groupBySlot(orders)` | `[{ head, group }]` — `head` = commande la mieux classee du groupe, la ligne prend sa position |
| `filterOrders(orders, {statusKey, date, periods})` | filtre statut + date + periodes (vide = toutes) |
| `availableDates(orders)` | dates distinctes triees |
| `untreatedCounts(orders, currentDate)` | `{past, future}` — compteurs **globaux** de commandes non traitees sur les AUTRES dates, independants de l'onglet actif |
| `groupTotal(group)` | somme d'un groupe (onglet Montant) |

## socket.js

Singleton socket.io (`transports: ["websocket"]`, reconnexion auto).
`socketService.on()` renvoie une **fonction de desabonnement** — les effets
React nettoient proprement.

Evenements ecoutes par le dashboard (`ORDER_EVENTS`) :

| Cle | Evenement backend |
|---|---|
| `newOrder` / `orderUpdated` | `newFastFoodOrder` / `fastFoodOrderUpdated` |
| `newOrders` / `ordersUpdated` | `newFastFoodOrders` / `fastFoodOrdersUpdated` |
| `ranksUpdated` | `ordersRankUpdated` |
| `menuCreated` / `menuUpdated` / `menuDeleted` | `newFastFoodMenu` / `fastFoodMenuUpdated` / `fastFoodMenuDeleted` |

## format.js

`formatXAF`, `formatDayMonth`, `formatFullDate`, `formatTime`, `todayISO`, et
`invoiceNumber(orderId, createdAt)` → `YAM-202608-A1B2C3` pour la facture.
