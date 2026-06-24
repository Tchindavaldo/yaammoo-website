import { Link } from "react-router-dom";

const APP_STORE_URL = "https://apps.apple.com/app/yaammoo/id6783684604";

const steps = [
  {
    n: 1,
    title: "Choisissez",
    text: "Parcourez les restaurants et boutiques près de vous et ajoutez vos articles au panier.",
  },
  {
    n: 2,
    title: "Commandez",
    text: "Validez votre commande en quelques secondes. Un livreur est immédiatement notifié.",
  },
  {
    n: 3,
    title: "Suivez",
    text: "Recevez des notifications en temps réel jusqu'à la livraison à votre adresse.",
  },
  {
    n: 4,
    title: "Payez",
    text: "Réglez à la livraison, en espèces. Aucune carte bancaire requise.",
  },
];

const features = [
  {
    icon: "⚡️",
    title: "Livraison rapide",
    text: "Nos livreurs locaux connaissent le terrain pour vous livrer au plus vite.",
  },
  {
    icon: "📍",
    title: "Commerces de proximité",
    text: "Soutenez les restaurants et boutiques de votre quartier.",
  },
  {
    icon: "🔔",
    title: "Suivi en temps réel",
    text: "Soyez notifié à chaque étape de votre commande.",
  },
  {
    icon: "💵",
    title: "Paiement à la livraison",
    text: "Payez en espèces à la réception. Zéro inscription bancaire.",
  },
];

export default function Home() {
  return (
    <>
      <nav className="nav">
        <Link className="brand" to="/">
          <img src="/logo.png" alt="Yaammoo" className="brand-logo" />
        </Link>
        <div className="links">
          <Link to="/support">Support</Link>
          <Link to="/privacy">Confidentialité</Link>
        </div>
      </nav>

      <section className="hero">
        <h1>
          Livraison locale,
          <br />
          livrée à votre porte
        </h1>
        <p>
          Commandez vos repas et produits préférés auprès des restaurants et
          boutiques de votre quartier. Simple, rapide, fiable.
        </p>
        <a className="store-btn" href={APP_STORE_URL}>
          <span style={{ fontSize: "1.4rem" }}>🍎</span>
          <span>
            <span className="store-small">Télécharger sur l'</span>
            <br />
            <span className="store-name">App Store</span>
          </span>
        </a>
      </section>

      <section className="section">
        <h2>Comment ça marche ?</h2>
        <div className="steps">
          {steps.map((s) => (
            <div className="step" key={s.n}>
              <div className="num">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="features-bg">
        <div className="features">
          <h2>Pourquoi Yaammoo ?</h2>
          <div className="feat-grid">
            {features.map((f) => (
              <div className="feat" key={f.title}>
                <div className="icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="footer">
        <img src="/logo.png" alt="Yaammoo" className="footer-logo" />
        <div>
          <Link to="/privacy">Politique de confidentialité</Link>
          <Link to="/support">Support</Link>
          <Link to="/accessibility">Accessibilité</Link>
        </div>
        <div className="copy">© 2025 Yaammoo. Tous droits réservés.</div>
      </footer>
    </>
  );
}
