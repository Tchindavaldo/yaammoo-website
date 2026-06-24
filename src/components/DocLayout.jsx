import { Link } from "react-router-dom";

export default function DocLayout({ title, subtitle, footerLinks, children }) {
  return (
    <div className="doc-body">
      <header className="doc-header">
        <Link to="/">
          <img src="/logo.png" alt="Yaammoo" className="doc-header-logo" />
        </Link>
        <h1>{title}</h1>
        <p>{subtitle || "Yaammoo — Livraison locale au Cameroun"}</p>
        <Link className="back" to="/">
          ← Retour à l'accueil
        </Link>
      </header>

      <main className="doc-main">
        <div className="card">{children}</div>
      </main>

      <footer className="doc-footer">
        © 2025 Yaammoo
        {footerLinks?.map((l) => (
          <span key={l.to}>
            {" · "}
            <Link to={l.to}>{l.label}</Link>
          </span>
        ))}
      </footer>
    </div>
  );
}
