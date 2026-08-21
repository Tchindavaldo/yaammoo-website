// Connexion dashboard — email/password ou Google, memes comptes que l'app RN.
import { useState } from "react";
import { useAuth } from "../features/auth/AuthContext.jsx";
import { Field } from "../components/ui.jsx";

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
    <div className="center-screen">
      <div className="card card-pad" style={{ width: 380 }}>
        <div className="row" style={{ marginBottom: 18 }}>
          <span className="sidebar-logo">Y</span>
          <div>
            <h2>Dashboard Yaammoo</h2>
            <div className="small dim">Espace marchand et administration</div>
          </div>
        </div>

        <form onSubmit={submit}>
          <Field label="Email">
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
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

          {shown && (
            <div
              className="small"
              style={{ color: "var(--danger)", marginBottom: 12 }}
            >
              ❌ {shown}
            </div>
          )}

          <button className="btn primary block" disabled={busy} type="submit">
            {busy ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div
          className="small dim"
          style={{ textAlign: "center", margin: "13px 0" }}
        >
          ou
        </div>

        <button className="btn block" onClick={google} disabled={busy} type="button">
          Continuer avec Google
        </button>

        <div className="small dim" style={{ marginTop: 16, textAlign: "center" }}>
          Utilisez le compte marchand de votre boutique.
        </div>
      </div>
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
