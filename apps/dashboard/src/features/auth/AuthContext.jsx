// Auth dashboard — portage web d'AuthContext (app RN).
// Firebase Auth donne l'identite ; le profil backend (GET /user/:uid) donne le
// role : fastFoodId -> marchand, isAdmin -> admin plateforme.
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, merchantService, IS_DEMO, DEMO_EMAIL, DEMO_PASSWORD, DEMO_USER, resetDemo } from "@yaammoo/shared";

// Mode demo : session locale (sessionStorage), sans Firebase ni backend.
const DEMO_SESSION_KEY = "yaammoo-demo-session";
const demoSession = {
  get: () => {
    try {
      return sessionStorage.getItem(DEMO_SESSION_KEY) === "1";
    } catch {
      return false;
    }
  },
  set: (on) => {
    try {
      if (on) sessionStorage.setItem(DEMO_SESSION_KEY, "1");
      else sessionStorage.removeItem(DEMO_SESSION_KEY);
    } catch {
      /* stockage indisponible */
    }
  },
};
const DEMO_FB_USER = { uid: DEMO_USER.id, email: DEMO_EMAIL };

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (IS_DEMO) {
      if (demoSession.get()) {
        setUser(DEMO_FB_USER);
        setUserData(DEMO_USER);
      }
      setLoading(false);
      return undefined;
    }
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (!fbUser) {
        setUserData(null);
        setLoading(false);
        return;
      }
      try {
        const profile = await merchantService.getUser(fbUser.uid);
        setUserData(profile);
      } catch (err) {
        console.error("Profil introuvable:", err);
        setUserData(null);
        setError("Profil introuvable pour ce compte.");
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  const loginEmail = useCallback(async (email, password) => {
    setError(null);
    if (IS_DEMO) {
      if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD)
        throw new Error("Compte demo : utilisez les identifiants pre-remplis.");
      demoSession.set(true);
      setUser(DEMO_FB_USER);
      setUserData(DEMO_USER);
      return;
    }
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const loginGoogle = useCallback(async () => {
    setError(null);
    if (IS_DEMO) throw new Error("Connexion Google indisponible en mode demo.");
    await signInWithPopup(auth, new GoogleAuthProvider());
  }, []);

  const logout = useCallback(async () => {
    if (IS_DEMO) {
      demoSession.set(false);
      resetDemo();
      setUser(null);
      setUserData(null);
      return;
    }
    await signOut(auth);
    setUserData(null);
  }, []);

  const value = useMemo(() => {
    const isAdmin = Boolean(userData?.isAdmin);
    const fastFoodId = userData?.fastFoodId || null;
    return {
      user,
      userData,
      loading,
      error,
      setError,
      loginEmail,
      loginGoogle,
      logout,
      isSignedIn: Boolean(user && userData),
      isAdmin,
      isMerchant: Boolean(fastFoodId),
      // L'admin sans boutique n'a pas de fastFoodId : les ecrans marchand
      // basculent alors sur la boutique choisie dans la vue admin.
      fastFoodId,
      uid: user?.uid || null,
    };
  }, [user, userData, loading, error, loginEmail, loginGoogle, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
