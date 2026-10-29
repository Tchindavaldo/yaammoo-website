import { Link } from "react-router-dom";

export default function DocLayout({ title, subtitle, footerLinks, children }) {
  return (
    <div className="doc-body">
      <header className="doc-header">
        <Link to="/">
          <img src="/logo-256.png" alt="Yaammoo" className="doc-header-logo" width="256" height="256" />
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
        © 2025 Yaammoo · <a href="https://rauval.com" target="_blank" rel="noopener">Rauval</a>
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
