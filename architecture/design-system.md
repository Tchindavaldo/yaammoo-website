# Design system — dashboard

Le dashboard est un **outil de travail de comptoir**, pas une page marketing.
Chaque ecran prend la forme de l'objet qu'il manipule : un ticket est une carte,
un menu est une vignette, un journal est un tableau. On ne met un tableau que
la ou on lit vraiment en colonnes.

## Fichiers

`src/styles.css` n'est qu'un point d'entree : il importe les fichiers ci-dessous
dans cet ordre. Ne rien ecrire dedans — editer le fichier concerne.

| Fichier | Responsabilite |
|---|---|
| `styles/tokens.css` | Variables : couleurs, rayons, ombres, mouvement, typo |
| `styles/base.css` | Reset, typographie, utilitaires (`row`, `stacked`, `num`, `truncate`…) |
| `styles/controls.css` | Boutons, controle segmente, chips, stepper, champs |
| `styles/surfaces.css` | Cartes, bandeau KPI, badges, pastilles de statut, tableaux |
| `styles/feedback.css` | Etats vides, squelettes, alertes, modales, toasts |
| `styles/layout.css` | Coque : barre laterale, barre haute, tiroir mobile |
| `styles/board.css` | Board de commandes : colonnes, cartes-tickets, chrono |
| `styles/pos.css` | Caisse : rail, tuiles, panneau ticket |
| `styles/screens.css` | Barres d'outils, catalogue, connexion, graphes, facture |
| `styles/print.css` | Impression du bon de caisse |

**R4** : aucun de ces fichiers ne depasse 500 lignes. Si l'un grossit, on le
scinde plutot que de l'etirer.

## Couleurs

La marque est celle de l'app mobile : **`#ec4913`**, reprise telle quelle de
`src/theme/index.ts`. Les neutres suivent la meme echelle slate que les ecrans
marchand mobiles.

Les tokens sont definis en clair sur `:root` puis redefinis sous
`:root[data-theme="dark"]`. **Aucune couleur n'existe dans un seul mode.**

| Role | Token | Regle |
|---|---|---|
| Accent | `--accent` | Action principale, element actif, rang 1 |
| Statut | `--pending` `--process` `--done` `--danger` | **Reserves.** Jamais reutilises comme couleur de serie |
| Series | `--series-1` … `--series-5` | Graphes uniquement |

Les pas sombres des series ne sont pas une inversion des pas clairs : ils ont
ete choisis contre la surface sombre et **valides** (bande de clarte,
separation daltonisme, contraste >= 3:1).

Un statut ne passe **jamais** par la couleur seule : `.pill` porte un point
colore **et** un libelle.

## Typographie et chiffres

Inter (chargee dans `index.html`, repli police systeme). Tout montant, compteur
ou duree porte `.num` ou `.mono` — `font-variant-numeric: tabular-nums` aligne
les colonnes de chiffres.

## Composants (`components/ui.jsx`)

| Composant | Role |
|---|---|
| `Btn` / `IconBtn` | Boutons, variantes `primary` / `ghost` / `danger`, tailles `sm` / `lg` |
| `KpiBand` / `Kpi` | Bandeau de mesures : la premiere domine, les autres appuient |
| `StatusPill` / `Tag` | Etat d'une commande, etiquettes secondaires |
| `Avatar` | Initiales — jamais d'avatar vide |
| `Timer` | Temps ecoule depuis la prise de commande, vire orange puis rouge |
| `Segmented` / `Chip` | Filtres exclusifs / multiples |
| `Field` / `Search` / `Stepper` | Saisie |
| `Empty` / `Alert` | Etats vides et erreurs |
| `Sk` / `SkBoard` / `SkCards` / `SkTable` | Squelettes de chargement |
| `Modal` | Fenetre modale, fermeture par `Echap` et clic exterieur |

`components/icons.jsx` : jeu d'icones **SVG inline**, aucune dependance.
Grille 24, contour 1.75, couleur heritee. `<Icon name="orders" size={18} />`.

`components/Toast.jsx` : `useToast().ok(titre, msg)` / `.err(...)` — confirme
une action sans interrompre le travail.

## Graphes (`components/Chart.jsx`)

`BarChart` — **serie unique, un seul axe**. Regles appliquees :

- Jamais de double axe. Deux mesures d'echelles differentes = deux graphes.
- Pas de legende pour une serie : le titre la nomme.
- Grille recessive, barres fines, 2px de respiration entre les fills.
- Couche de survol par defaut (cible plus large que la barre).
- Le tableau qui accompagne le graphe reste la vue exhaustive.

## Regles de rendu

- **Elevation** : `box-shadow: inset 0 0 0 1px var(--border), var(--sh-N)` —
  le trait et l'ombre ensemble, jamais l'ombre seule.
- **Focus** : `:focus-visible` porte un anneau `--accent`. Ne jamais le
  supprimer sans remplacement.
- **Chargement** : squelette a la forme du contenu attendu, pas un sablier —
  l'ecran ne saute pas quand les donnees arrivent.
- **Mouvement** : `--fast` (130ms) pour les etats, `--slow` (260ms) pour la
  coque. Tout est neutralise sous `prefers-reduced-motion`.
- **Pas de style inline** pour ce qui se repete : creer une classe.
- **R15** : aucun emoji decoratif. Les icones passent par `<Icon>`.
