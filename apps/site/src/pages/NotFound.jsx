import { Link } from "react-router-dom";

export default function NotFound() {
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
