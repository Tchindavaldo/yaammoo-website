// Connexion — memes comptes que l'app mobile (Firebase email/mot de passe
// ou Google). Ecran en deux volets : le contexte a gauche, le formulaire a droite.
import { useState } from "react";
import { useAuth } from "../features/auth/AuthContext.jsx";
import { Alert, Btn, Field } from "../components/ui.jsx";
import { Icon } from "../components/icons.jsx";

const POINTS = [
  ["orders", "Suivez vos commandes en direct, du ticket a la livraison."],
  ["pos", "Encaissez au comptoir et editez le bon de caisse a l'instant."],
  ["wallet", "Gains, retraits et transactions au meme endroit."],
];

export default function Login() {
  const { loginEmail, loginGoogle, error, setError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setLocalError(null);
    setError(null);
    try {
      await loginEmail(email, password);
    } catch (err) {
      setLocalError(mapAuthError(err));
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    setLocalError(null);
    try {
      await loginGoogle();
    } catch (err) {
      setLocalError(mapAuthError(err));
      setBusy(false);
    }
  };

  const shown = localError || error;

  return (
    <div className="auth">
      <aside className="auth-side">
        <div className="row">
          <span className="brand-mark">Y</span>
          <span className="strong">Yaammoo</span>
        </div>

        <div className="auth-pitch">
          <h2>La console de votre restaurant.</h2>
          <p>
            Tout ce que vous faites depuis l'application, en plus grand : le
            board des commandes, la caisse et vos gains.
          </p>
          <div className="auth-points">
            {POINTS.map(([icon, text]) => (
              <div className="auth-point" key={icon}>
                <Icon name={icon} size={17} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="tiny auth-legal">Yaammoo · yaammoo.rauval.com</div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <div className="stacked auth-title">
            <h1>Connexion</h1>
            <span className="small dim">Espace marchand et administration</span>
          </div>

          <form onSubmit={submit} className="stack">
            <Field label="Email">
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                required
              />
            </Field>
            <Field label="Mot de passe">
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </Field>

            {shown && <Alert>{shown}</Alert>}

            <Btn variant="primary" size="lg" block disabled={busy} type="submit">
              {busy ? "Connexion..." : "Se connecter"}
            </Btn>
          </form>

          <div className="auth-sep">ou</div>

          <Btn size="lg" block onClick={google} disabled={busy}>
            Continuer avec Google
          </Btn>

          <p className="small dim auth-foot">
            Utilisez le compte marchand de votre boutique.
          </p>
        </div>
      </main>
    </div>
  );
}

function mapAuthError(err) {
  const code = err?.code || "";
  if (code.includes("invalid-credential") || code.includes("wrong-password"))
    return "Email ou mot de passe incorrect.";
  if (code.includes("user-not-found")) return "Aucun compte pour cet email.";
  if (code.includes("too-many-requests"))
    return "Trop de tentatives. Reessayez dans quelques minutes.";
  if (code.includes("popup-closed")) return "Connexion Google annulee.";
  return err?.message || "Connexion impossible.";
}
