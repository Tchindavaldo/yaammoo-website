// Prerendu statique du site, sans navigateur (aucun Playwright / Chromium :
// le build Cloudflare n'en a pas). Lance par `npm run build`, apres :
//   1. `vite build`                                  -> dist/ (client)
//   2. `vite build --ssr src/entry-server.jsx ...`   -> dist-ssr/entry-server.js
// Pour chaque route de PRERENDER_PAGES (src/seo/pages.js), ce script rend
// l'application avec react-dom/server et ecrit dist/<route>.html (dist/index.html
// pour "/") avec les balises <head> de la route. Cloudflare sert dist/support.html
// a l'URL /support (html_handling "auto-trailing-slash", par defaut).
// Voir architecture/seo.md.

import { readFile, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const ssrDir = path.join(root, "dist-ssr");

const HEAD_MARK = "<!--seo-head-->";
const ROOT_DIV = '<div id="root"></div>';

function fail(message) {
  console.error(`[prerender] ERREUR : ${message}`);
  process.exit(1);
}

const template = await readFile(path.join(dist, "index.html"), "utf8");
if (!template.includes(HEAD_MARK) || !template.includes(ROOT_DIV)) {
  fail(`dist/index.html ne contient pas ${HEAD_MARK} et ${ROOT_DIV} : relancer "npm run build" en entier.`);
}

const entry = pathToFileURL(path.join(ssrDir, "entry-server.js")).href;
const { render, renderHead, PAGES, PRERENDER_PAGES, absoluteUrl } = await import(entry);

// public/sitemap.xml doit lister exactement les routes indexables prerendues.
const sitemap = await readFile(path.join(root, "public", "sitemap.xml"), "utf8");
const listed = new Set([...sitemap.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]));
const expected = new Set(PRERENDER_PAGES.filter((p) => !p.noindex).map((p) => absoluteUrl(p.path)));
const missing = [...expected].filter((u) => !listed.has(u));
const extra = [...listed].filter((u) => !expected.has(u));
if (missing.length || extra.length) {
  fail(
    "public/sitemap.xml n'est pas a jour. " +
      `Absentes du sitemap : ${missing.join(", ") || "aucune"}. ` +
      `En trop : ${extra.join(", ") || "aucune"}.`
  );
}

for (const page of PRERENDER_PAGES) {
  const body = render(page.path);
  const h1 = (body.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) fail(`${page.path} contient ${h1} balise(s) <h1> (une seule attendue).`);

  // Remplacements par fonction : un "$" dans le contenu ne doit pas etre
  // interprete comme motif de remplacement.
  const html = template
    .replace(HEAD_MARK, () => renderHead(page))
    .replace(ROOT_DIV, () => `<div id="root" data-prerendered="${page.path}">${body}</div>`);

  const file = page.path === "/" ? "index.html" : `${page.path.slice(1)}.html`;
  await writeFile(path.join(dist, file), html);
  console.log(`[prerender] ${page.path} -> dist/${file} (${Math.round(html.length / 1024)} Ko)`);
}

// Page 404 : Cloudflare sert dist/404.html avec un vrai statut 404 pour toute
// URL inconnue (not_found_handling "404-page" dans wrangler.jsonc). Rendue sur
// une URL qui ne correspond a aucune route, donc avec le composant NotFound.
const notFoundBody = render("/__page-introuvable__");
const notFoundHtml = template
  .replace(HEAD_MARK, () => renderHead(PAGES.notFound))
  .replace(ROOT_DIV, () => `<div id="root" data-prerendered="*">${notFoundBody}</div>`);
await writeFile(path.join(dist, "404.html"), notFoundHtml);
console.log(`[prerender] 404 -> dist/404.html (${Math.round(notFoundHtml.length / 1024)} Ko)`);

await rm(ssrDir, { recursive: true, force: true });
