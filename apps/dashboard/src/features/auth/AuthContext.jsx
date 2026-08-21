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
import { auth, merchantService } from "@yaammoo/shared";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const loginGoogle = useCallback(async () => {
    setError(null);
    await signInWithPopup(auth, new GoogleAuthProvider());
  }, []);

  const logout = useCallback(async () => {
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
