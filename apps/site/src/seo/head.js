// Balises <head> propres a chaque route : title, description, robots,
// canonical, hreflang, Open Graph, Twitter et JSON-LD.
// Deux sorties pour une seule definition :
//   - renderHead(page) : chaine HTML injectee au build par scripts/prerender.mjs
//     a la place du marqueur <!--seo-head--> d'index.html ;
//   - applyHead(page) : mise a jour du DOM a la navigation (via useSeo).
// Aucune dependance : fonctionne cote serveur (Node) comme dans le navigateur.

import { SITE_NAME, OG_IMAGE, absoluteUrl } from "./pages.js";
import { pageJsonLd } from "./jsonld.js";

const JSONLD_ID = "seo-jsonld";

// Chaque slot = une balise geree : `sel` la retrouve dans le DOM, `attrs` donne
// ses attributs pour cette page (null = balise absente sur cette page).
function slots(page) {
  const url = page.noindex ? null : absoluteUrl(page.path);
  const meta = (key, name, content) => ({
    tag: "meta",
    sel: `meta[${key}="${name}"]`,
    attrs: content == null ? null : { [key]: name, content },
  });
  const link = (sel, attrs) => ({ tag: "link", sel, attrs: url ? attrs : null });

  return [
    meta("name", "description", page.description),
    meta("name", "robots", page.noindex ? "noindex, follow" : "index, follow, max-image-preview:large"),
    link('link[rel="canonical"]', { rel: "canonical", href: url }),
    link('link[rel="alternate"][hreflang="fr"]', { rel: "alternate", hreflang: "fr", href: url }),
    link('link[rel="alternate"][hreflang="x-default"]', { rel: "alternate", hreflang: "x-default", href: url }),
    meta("property", "og:type", "website"),
    meta("property", "og:site_name", SITE_NAME),
    meta("property", "og:locale", "fr_FR"),
    meta("property", "og:title", page.title),
    meta("property", "og:description", page.description),
    meta("property", "og:url", url),
    meta("property", "og:image", OG_IMAGE.url),
    meta("property", "og:image:width", String(OG_IMAGE.width)),
    meta("property", "og:image:height", String(OG_IMAGE.height)),
    meta("property", "og:image:type", "image/jpeg"),
    meta("property", "og:image:alt", OG_IMAGE.alt),
    meta("name", "twitter:card", "summary_large_image"),
    meta("name", "twitter:title", page.title),
    meta("name", "twitter:description", page.description),
    meta("name", "twitter:image", OG_IMAGE.url),
    meta("name", "twitter:image:alt", OG_IMAGE.alt),
  ];
}

const escText = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escAttr = (s) => escText(s).replace(/"/g, "&quot;");
// "<" echappe : un texte contenant "</script>" ne peut pas fermer la balise.
const jsonForHtml = (data) => JSON.stringify(data).replace(/</g, "\\u003c");

export function renderHead(page) {
  const lines = [`<title>${escText(page.title)}</title>`];
  for (const { tag, attrs } of slots(page)) {
    if (!attrs) continue;
    const list = Object.entries(attrs).map(([k, v]) => `${k}="${escAttr(v)}"`);
    lines.push(`<${tag} ${list.join(" ")} />`);
  }
  const ld = pageJsonLd(page);
  if (ld) lines.push(`<script type="application/ld+json" id="${JSONLD_ID}">${jsonForHtml(ld)}</script>`);
  return lines.join("\n    ");
}

export function applyHead(page, doc = document) {
  doc.title = page.title;
  for (const { tag, sel, attrs } of slots(page)) {
    let el = doc.head.querySelector(sel);
    if (!attrs) {
      el?.remove();
      continue;
    }
    if (!el) {
      el = doc.createElement(tag);
      doc.head.appendChild(el);
    }
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  }

  const ld = pageJsonLd(page);
  let script = doc.getElementById(JSONLD_ID);
  if (!ld) {
    script?.remove();
    return;
  }
  if (!script) {
    script = doc.createElement("script");
    script.type = "application/ld+json";
    script.id = JSONLD_ID;
    doc.head.appendChild(script);
  }
  script.textContent = JSON.stringify(ld);
}
