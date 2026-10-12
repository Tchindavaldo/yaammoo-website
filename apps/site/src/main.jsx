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
// represente ("*" pour 404.html, servi par Cloudflare sur toute URL inconnue).
// On ne l'hydrate que s'il correspond a l'URL courante ; sinon rendu complet
// cote client.
const path = window.location.pathname.replace(/\/+$/, "") || "/";
const prerendered = container.dataset.prerendered;
if (prerendered === path || prerendered === "*") {
  ReactDOM.hydrateRoot(container, app);
} else {
  ReactDOM.createRoot(container).render(app);
}
