import { Link } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import { APP_STORE_URL, PLAY_STORE_URL } from "../content/contact.js";
import { PAGES } from "../seo/pages.js";
import useSeo from "../seo/useSeo.js";

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
    icon: "zap",
    title: "Livraison rapide",
    text: "Nos livreurs locaux connaissent le terrain pour vous livrer au plus vite.",
  },
  {
    icon: "pin",
    title: "Commerces de proximité",
    text: "Soutenez les restaurants et boutiques de votre quartier.",
  },
  {
    icon: "bell",
    title: "Suivi en temps réel",
    text: "Soyez notifié à chaque étape de votre commande.",
  },
  {
    icon: "cash",
    title: "Paiement à la livraison",
    text: "Payez en espèces à la réception. Zéro inscription bancaire.",
  },
];

export default function Home() {
  useSeo(PAGES.home);

  return (
    <>
      <nav className="nav">
        <Link className="brand" to="/">
          <img src="/logo-256.png" alt="Yaammoo" className="brand-logo" width="256" height="256" />
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
        <div className="store-btns">
          <a className="store-btn" href={APP_STORE_URL}>
            <Icon name="apple" size={24} />
            <span>
              <span className="store-small">Télécharger sur l'</span>
              <br />
              <span className="store-name">App Store</span>
            </span>
          </a>
          <a className="store-btn" href={PLAY_STORE_URL}>
            <Icon name="googleplay" size={22} />
            <span>
              <span className="store-small">Disponible sur</span>
              <br />
              <span className="store-name">Google Play</span>
            </span>
          </a>
        </div>
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
                <div className="icon">
                  <Icon name={f.icon} size={32} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="footer">
        <img src="/logo-256.png" alt="Yaammoo" className="footer-logo" width="256" height="256" />
        <div>
          <Link to="/privacy">Politique de confidentialité</Link>
          <Link to="/support">Support</Link>
        </div>
        <div className="copy">© 2025 Yaammoo. Tous droits réservés. Une application <a href="https://rauval.com" target="_blank" rel="noopener" style={{ color: "inherit", textDecoration: "underline" }}>Rauval</a>.</div>
      </footer>
    </>
  );
}
