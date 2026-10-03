// Retour d'action non bloquant : confirme un changement de statut, une
// creation de commande, une erreur reseau — sans interrompre le travail.
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Icon } from "./icons.jsx";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const seq = useRef(0);

  const push = useCallback((title, msg, tone = "ok") => {
    const id = ++seq.current;
    setItems((prev) => [...prev, { id, title, msg, tone }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const toast = {
    ok: (title, msg) => push(title, msg, "ok"),
    err: (title, msg) => push(title, msg, "err"),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-stack no-print" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast toast-${t.tone}`}>
            <Icon name={t.tone === "ok" ? "checkCircle" : "alert"} size={17} />
            <div className="grow">
              <div className="toast-title">{t.title}</div>
              {t.msg && <div className="toast-msg">{t.msg}</div>}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast doit etre utilise dans ToastProvider");
  return ctx;
}
