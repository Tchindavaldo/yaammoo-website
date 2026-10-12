import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles.css";

const container = document.getElementById("root");
const app = (
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Le HTML prerendu au build (scripts/prerender.mjs) porte la route qu'il
// represente. On ne l'hydrate que s'il correspond a l'URL courante : une URL
// inconnue recoit index.html (l'Accueil) via le repli SPA de Cloudflare, et
// doit alors etre rendue entierement cote client (page 404).
const path = window.location.pathname.replace(/\/+$/, "") || "/";
if (container.dataset.prerendered === path) {
  ReactDOM.hydrateRoot(container, app);
} else {
  ReactDOM.createRoot(container).render(app);
}
