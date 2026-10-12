// Point d'entree du rendu serveur, utilise uniquement au build :
// `vite build --ssr src/entry-server.jsx` le compile, puis
// scripts/prerender.mjs l'importe pour ecrire le HTML de chaque route.
// L'arbre rendu doit rester identique a celui de main.jsx (hydratation).
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "./App.jsx";

export { PAGES, PRERENDER_PAGES, absoluteUrl } from "./seo/pages.js";
export { renderHead } from "./seo/head.js";

export function render(url) {
  return renderToString(
    <React.StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </React.StrictMode>
  );
}
