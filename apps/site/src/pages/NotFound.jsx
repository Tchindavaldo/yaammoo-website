import { Link } from "react-router-dom";
import { PAGES } from "../seo/pages.js";
import useSeo from "../seo/useSeo.js";

export default function NotFound() {
  // noindex : une URL inconnue ne doit jamais entrer dans l'index.
  useSeo(PAGES.notFound);

  return (
    <div className="notfound">
      <h1>404</h1>
      <p>Cette page n'existe pas.</p>
      <Link className="store-btn" to="/" style={{ background: "var(--orange)" }}>
        Retour à l'accueil
      </Link>
    </div>
  );
}
