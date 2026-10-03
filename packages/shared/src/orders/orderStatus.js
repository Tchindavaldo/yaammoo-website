// Mapping des statuts — portage de OrderManagePanel (onglets statut).
// Les libelles et regroupements Firestore sont ceux de l'app RN.

export const STATUS_TABS = [
  { key: "pending", label: "En attente", statuses: ["pending"] },
  {
    key: "proccess",
    label: "En cours",
    statuses: ["processing", "active", "in_progress"],
  },
  {
    key: "finish",
    label: "Terminees",
    statuses: ["completed", "finished", "done", "delivering", "delivered"],
  },
];

export const STATUS_MAP = STATUS_TABS.reduce((acc, t) => {
  acc[t.key] = t.statuses;
  return acc;
}, {});

/** Statut suivant dans le cycle marchand (bouton "avancer"). */
export function nextStatus(status) {
  switch (status) {
    case "pending":
      return "processing";
    case "processing":
    case "active":
    case "in_progress":
      return "finished";
    case "finished":
    case "completed":
    case "done":
      return "delivering";
    case "delivering":
      return "delivered";
    default:
      return null;
  }
}

export const STATUS_LABELS = {
  pending: "En attente",
  processing: "En cours",
  active: "En cours",
  in_progress: "En cours",
  finished: "Prete",
  completed: "Prete",
  done: "Prete",
  delivering: "En livraison",
  delivered: "Livree",
};

/** Onglet auquel appartient une commande. */
export function tabOf(status) {
  const tab = STATUS_TABS.find((t) => t.statuses.includes(status));
  return tab ? tab.key : "pending";
}

/** Une commande non traitee = en attente ou en cours. */
export function isUntreated(order) {
  const tab = tabOf(order.status);
  return tab === "pending" || tab === "proccess";
}
