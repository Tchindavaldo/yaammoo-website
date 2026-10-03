// Sous-sections Extras / Boissons du formulaire menu (extrait de MenuForm.jsx).
import { Icon } from "../../components/icons.jsx";

/** Items valides : ceux qui portent un nom. */
export const namedItems = (items) => items.filter((x) => x.name.trim());

/** Section Extras ou Boissons — rendu en grille de cellules, calque des
    cartes de creneaux du design « Dashboard Boutique md screen ». Les cases
    vides completent la grille pour qu'elle garde sa forme. */
export default function ItemSection({ label, tone, items, setItems, draft, setDraft, onAdd, placeholder }) {
  const valid = namedItems(items);
  const fillers = Math.max(0, 6 - valid.length);

  return (
    <section className="mform-card zone">
      <div className="zone-head">
        <div>
          <div className="zone-title">{label === "EXTRAS" ? "Extras" : "Boissons"}</div>
          <div className="zone-sub">
            {valid.length ? `${valid.length} enregistre${valid.length > 1 ? "s" : ""}` : "Aucun pour l'instant"}
          </div>
        </div>
      </div>

      <div className="zone-grid">
        {valid.map((it, i) => (
          <button
            type="button"
            className={`zone-card ${tone}`}
            key={`${it.name}-${i}`}
            onClick={() => setItems(items.filter((_, j) => j !== i))}
            title={`Retirer ${it.name}`}
          >
            <span className="zone-card-top">
              <span className={`zone-dot ${tone}`} />
              <span className="zone-tag">{it.prix ? `${it.prix} F` : "0 F"}</span>
            </span>
            <span className="zone-card-name truncate">{it.name}</span>
          </button>
        ))}
        {Array.from({ length: fillers }).map((_, i) => (
          <div className="zone-card empty" key={`z-${i}`}>
            <span className="zone-card-top">
              <span className="zone-dot" />
              <span className="zone-tag">— F</span>
            </span>
            <span className="zone-card-name">Non defini</span>
          </div>
        ))}
      </div>

      <div className="mform-row">
        <input
          className="mform-input"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder={placeholder}
        />
        <input
          className="mform-input num"
          type="number"
          min="0"
          value={draft.prix}
          onChange={(e) => setDraft({ ...draft, prix: e.target.value })}
          placeholder="Prix"
        />
        <button type="button" className="mform-add" onClick={onAdd} aria-label="Ajouter">
          <Icon name="check" size={14} />
        </button>
      </div>
    </section>
  );
}
