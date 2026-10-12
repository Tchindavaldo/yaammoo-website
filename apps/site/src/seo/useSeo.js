import { useEffect } from "react";
import { applyHead } from "./head.js";

// Met a jour le <head> (title, description, canonical, Open Graph, JSON-LD...)
// pour la page affichee. `page` vient de PAGES (src/seo/pages.js).
// Sans effet au rendu serveur : le prerendu ecrit ces balises dans le HTML.
export default function useSeo(page) {
  useEffect(() => {
    applyHead(page);
  }, [page]);
}
