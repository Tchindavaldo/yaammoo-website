// Formulaire de creation / modification d'un menu, rendu dans le rail droit.
//
// Transposition web du bottom sheet RN `AddMenuSheetMultiStep.tsx` : memes
// deux premieres etapes (nom+prix+photos, puis extras+boissons+stock+statut)
// et surtout MEME payload de sortie — voir `handleSubmit` cote RN :
//   { name, prices[], status, images[], coverImage, coverImageHasBackground,
//     extra[], drink[], stock }
// Ici chaque etape est une carte du rail plutot qu'un ecran de sheet ;
// l'etape recap du mobile n'est pas reprise. Les couleurs et rayons viennent
// de `src/theme/index.ts` de l'app RN.
import { useRef, useState } from "react";
import { Config, IS_DEMO } from "@yaammoo/shared";
import { Icon } from "../../components/icons.jsx";
import ItemSection, { namedItems } from "./MenuFormItems.jsx";

/**
 * Envoie un fichier a POST /image/upload et renvoie l'URL publique.
 * Transpose `uploadImage` de l'app RN : progression reelle via XHR, doublee
 * d'une progression simulee pour les envois trop rapides, et un minimum de
 * 1200 ms d'affichage pour que la barre reste lisible.
 */
function uploadImage(file, onProgress) {
  // Mode demo : l'image reste dans le navigateur (data URL), rien n'est envoye.
  if (IS_DEMO)
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => {
        onProgress(100);
        resolve(r.result);
      };
      r.onerror = () => reject(new Error("Lecture de l'image impossible"));
      r.readAsDataURL(file);
    });
  return new Promise((resolve, reject) => {
    const started = Date.now();
    let current = 0;

    const tick = setInterval(() => {
      current += Math.random() * 12 + 6;
      if (current >= 95) {
        current = 95;
        clearInterval(tick);
      }
      onProgress(Math.round(current));
    }, 150);

    const form = new FormData();
    form.append("image", file, file.name || "image.jpg");

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${Config.apiUrl}/image/upload`);

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      const real = Math.round((e.loaded / e.total) * 100);
      if (real > current) {
        current = real;
        onProgress(Math.min(99, real));
      }
    };

    const finish = async (fn) => {
      clearInterval(tick);
      const elapsed = Date.now() - started;
      if (elapsed < 1200) await new Promise((r) => setTimeout(r, 1200 - elapsed));
      fn();
    };

    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        finish(() => reject(new Error(`Upload refuse (${xhr.status})`)));
        return;
      }
      let url = "";
      try {
        const body = JSON.parse(xhr.responseText);
        url = body?.url || body?.data || "";
      } catch {
        finish(() => reject(new Error("Reponse d'upload illisible")));
        return;
      }
      onProgress(100);
      finish(() => (url ? resolve(url) : reject(new Error("URL absente de la reponse"))));
    };
    xhr.onerror = () => finish(() => reject(new Error("Envoi impossible")));

    xhr.send(form);
  });
}

const STEPS = ["nameImage", "details"];
const emptyDraft = () => ({ name: "", prix: "" });

export default function MenuForm({ menu, onSave, onCancel, step }) {
  const editing = Boolean(menu);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const [nom, setNom] = useState(menu?.name || "");
  const [prices, setPrices] = useState(() => {
    const src = Array.isArray(menu?.prices) ? menu.prices : [];
    return [0, 1, 2].map((i) => ({
      price: src[i]?.price ? String(src[i].price) : "",
      description: src[i]?.description || "",
    }));
  });
  const [priceIdx, setPriceIdx] = useState(0);
  const [images, setImages] = useState(() =>
    [0, 1, 2].map((i) => (Array.isArray(menu?.images) ? menu.images[i] || "" : "")),
  );

  const [extras, setExtras] = useState(() =>
    (menu?.extra || []).filter((e) => e.name !== "Aucun").map((e) => ({ ...e })),
  );
  const [drinks, setDrinks] = useState(() =>
    (menu?.drink || []).filter((d) => d.name !== "Aucune").map((d) => ({ ...d })),
  );
  const [extraDraft, setExtraDraft] = useState(emptyDraft);
  const [drinkDraft, setDrinkDraft] = useState(emptyDraft);

  // Upload des photos : un slot a la fois, comme l'app mobile.
  const [progress, setProgress] = useState([0, 0, 0]);
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const [uploadErr, setUploadErr] = useState(null);
  const fileRef = useRef(null);
  const slotRef = useRef(0);

  const pickFile = (i) => {
    if (uploadingIdx !== null) return;
    slotRef.current = i;
    fileRef.current?.click();
  };

  // Plusieurs fichiers peuvent etre choisis d'un coup : ils sont envoyes un
  // par un, en partant du slot clique, et chaque succes remplit son slot.
  // Un echec n'interrompt pas les suivants.
  const onFile = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    // Slots a remplir : celui clique, puis les suivants encore libres.
    const start = slotRef.current;
    const order = [start, ...[0, 1, 2].filter((i) => i !== start)];
    const targets = [];
    for (const i of order) {
      if (targets.length >= files.length) break;
      if (i === start || !images[i]) targets.push(i);
    }

    setUploadErr(null);
    const failed = [];

    for (let k = 0; k < targets.length; k++) {
      const i = targets[k];
      setUploadingIdx(i);
      setProgress((p) => p.map((v, j) => (j === i ? 0 : v)));
      try {
        const url = await uploadImage(files[k], (pct) =>
          setProgress((p) => p.map((v, j) => (j === i ? pct : v))),
        );
        setImages((im) => im.map((v, j) => (j === i ? url : v)));
      } catch (err) {
        failed.push(files[k].name || `image ${k + 1}`);
        setProgress((p) => p.map((v, j) => (j === i ? 0 : v)));
      }
    }

    setUploadingIdx(null);
    if (failed.length)
      setUploadErr(
        failed.length === 1
          ? `Echec de l'envoi : ${failed[0]}.`
          : `Echec de l'envoi pour ${failed.length} images.`,
      );
  };

  const [availability, setAvailability] = useState(menu?.status || "available");
  const [stock, setStock] = useState(String(menu?.stock ?? 0));

  const setPrice = (i, key, v) =>
    setPrices((p) => p.map((row, j) => (j === i ? { ...row, [key]: v } : row)));

  // Saisie directe d'un lien d'image : met a jour le slot et donc l'apercu.
  const setImageUrl = (i, v) =>
    setImages((im) => im.map((x, j) => (j === i ? v.trimStart() : x)));

  const addItem = (list, setList, draft, setDraft) => {
    if (!draft.name.trim()) return;
    setList([
      ...list,
      {
        name: draft.name.trim(),
        prix: Number(draft.prix) || 0,
        quantite: 1,
        status: true,
      },
    ]);
    setDraft(emptyDraft());
  };


  // Payload identique a celui de l'app RN.
  const submit = async () => {
    if (!nom.trim()) return setError("Le nom du menu est obligatoire.");
    if (!prices.some((p) => Number(p.price) > 0))
      return setError("Renseignez au moins un prix.");

    const parseItems = (items) =>
      namedItems(items).map((x) => ({
        name: x.name.trim(),
        status: x.status,
        prix: Number(x.prix) || 0,
        quantite: Number(x.quantite) || 0,
      }));

    const parsedExtras = parseItems(extras);
    if (!parsedExtras.length)
      parsedExtras.push({ name: "Aucun", status: false, prix: 0, quantite: 0 });
    const parsedDrinks = parseItems(drinks);
    if (!parsedDrinks.length)
      parsedDrinks.push({ name: "Aucune", status: false, prix: 0, quantite: 0 });

    const finalImages = images.map((s) => String(s || "").trim()).filter(Boolean);

    setBusy(true);
    setError(null);
    try {
      await onSave({
        name: nom,
        prices: prices
          .map((p) => ({ price: Number(p.price) || 0, description: p.description }))
          .filter((p) => p.price > 0),
        status: availability,
        images: finalImages,
        coverImage: finalImages[0] || "",
        coverImageHasBackground: false,
        extra: parsedExtras,
        drink: parsedDrinks,
        stock: Number(stock) || 0,
      });
    } catch (e) {
      setError(e?.message || "Enregistrement impossible.");
      setBusy(false);
    }
  };

  return (
    <div className="mform">
      <div className="mform-body">
        {step === "main" && (
          <div className="mform-single">
            <section className="mform-block">
              <div className="mform-label">NOM</div>
              <input
                className="mform-input"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Nom du menu"
              />
            </section>

            <section className="mform-block">
              <div className="mform-label">PRIX &amp; DESCRIPTIONS</div>
              <div className="mform-tabs">
                {[0, 1, 2].map((i) => (
                  <button
                    key={i}
                    type="button"
                    className={priceIdx === i ? "mform-tab active" : "mform-tab"}
                    onClick={() => setPriceIdx(i)}
                  >
                    Prix {i + 1}
                    {i === 0 ? " *" : ""}
                  </button>
                ))}
              </div>
              <div className="mform-row">
                <input
                  className="mform-input num"
                  type="number"
                  min="0"
                  value={prices[priceIdx].price}
                  onChange={(e) => setPrice(priceIdx, "price", e.target.value)}
                  placeholder="2000"
                />
                <input
                  className="mform-input"
                  value={prices[priceIdx].description}
                  onChange={(e) => setPrice(priceIdx, "description", e.target.value)}
                  placeholder="Ex : 1 Burger + Frites"
                />
              </div>
            </section>

            <section className="mform-block">
              <div className="mform-label">PHOTOS</div>
              <div className="mform-photos">
                {[0, 1, 2].map((i) => (
                  <button
                    type="button"
                    className={
                      uploadingIdx === i ? "mform-photo busy" : "mform-photo"
                    }
                    key={i}
                    style={
                      images[i]?.trim()
                        ? { backgroundImage: `url(${images[i].trim()})` }
                        : undefined
                    }
                    onClick={() => pickFile(i)}
                    disabled={uploadingIdx !== null}
                    aria-label={`Photo ${i + 1}`}
                  >
                    {uploadingIdx === i ? (
                      <span className="mform-photo-prog">
                        <span
                          className="mform-photo-bar"
                          style={{ width: `${progress[i]}%` }}
                        />
                        <span className="mform-photo-pct">{progress[i]}%</span>
                      </span>
                    ) : (
                      !images[i]?.trim() && <Icon name="image" size={16} />
                    )}
                  </button>
                ))}
              </div>
              <div className="mform-urls">
                {[0, 1, 2].map((i) => (
                  <div className="mform-url-row" key={i}>
                    <input
                      className="mform-input sm"
                      type="url"
                      inputMode="url"
                      value={images[i]}
                      onChange={(e) => setImageUrl(i, e.target.value)}
                      placeholder={`Lien photo ${i + 1} (https://…)`}
                      disabled={uploadingIdx !== null}
                      aria-label={`Lien de la photo ${i + 1}`}
                    />
                    {images[i] && (
                      <button
                        type="button"
                        className="mform-url-clear"
                        onClick={() => setImageUrl(i, "")}
                        aria-label={`Retirer la photo ${i + 1}`}
                        disabled={uploadingIdx !== null}
                      >
                        <Icon name="close" size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>



            <section className="mform-block">
              <div className="mform-label">DISPONIBILITE</div>
              <div className="mform-row">
                <button
                  type="button"
                  className={
                    availability === "available" ? "mform-pick ok on" : "mform-pick ok"
                  }
                  onClick={() => setAvailability("available")}
                >
                  Disponible
                </button>
                <button
                  type="button"
                  className={
                    availability === "unavailable"
                      ? "mform-pick no on"
                      : "mform-pick no"
                  }
                  onClick={() => setAvailability("unavailable")}
                >
                  Indisponible
                </button>
              </div>
            </section>

            <section className="mform-block">
              <div className="mform-label">STOCK DISPONIBLE</div>
              {/* Paliers de 10 jusqu'a 200, defilables — comme l'app mobile. */}
              <div className="mform-tens">
                {Array.from({ length: 21 }, (_, i) => i * 10).map((n) => (
                  <button
                    type="button"
                    key={n}
                    className={
                      (Number(stock) || 0) === n ? "mform-ten active" : "mform-ten"
                    }
                    onClick={() => setStock(String(n))}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="mform-stepper">
                <button
                  type="button"
                  onClick={() => setStock((s) => String(Math.max(0, Number(s) - 1)))}
                >
                  −
                </button>
                <span className="mform-stock">{Number(stock) || 0}</span>
                <button
                  type="button"
                  className="plus"
                  onClick={() => setStock((s) => String(Number(s) + 1))}
                >
                  +
                </button>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={onFile}
              />
              {uploadErr && <div className="mform-error">{uploadErr}</div>}
            </section>
          </div>
        )}

        {step === "items" && (
          <>
            <ItemSection
              label="EXTRAS"
              tone="accent"
              items={extras}
              setItems={setExtras}
              draft={extraDraft}
              setDraft={setExtraDraft}
              onAdd={() => addItem(extras, setExtras, extraDraft, setExtraDraft)}
              placeholder="Nom de l'extra"
            />
            <ItemSection
              label="BOISSONS"
              tone="info"
              items={drinks}
              setItems={setDrinks}
              draft={drinkDraft}
              setDraft={setDrinkDraft}
              onAdd={() => addItem(drinks, setDrinks, drinkDraft, setDrinkDraft)}
              placeholder="Nom de la boisson"
            />
          </>
        )}

        {error && <div className="mform-error">{error}</div>}
      </div>

      <div className="mform-foot">
        <button type="button" className="mform-btn ghost" onClick={onCancel}>
          Annuler
        </button>
        <button
          type="button"
          className="mform-btn primary"
          onClick={submit}
          disabled={busy || uploadingIdx !== null}
        >
          {busy ? "Enregistrement..." : editing ? "Modifier" : "Creer le menu"}
        </button>
      </div>
    </div>
  );
}
