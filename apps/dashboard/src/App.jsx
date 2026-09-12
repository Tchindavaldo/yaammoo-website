import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./features/auth/AuthContext.jsx";
import { MerchantProvider } from "./features/merchant/MerchantContext.jsx";
import { ToastProvider } from "./components/Toast.jsx";
import DashboardLayout from "./components/DashboardLayout.jsx";
import Login from "./pages/Login.jsx";
import Menus from "./pages/Menus.jsx";
import Overview from "./pages/Overview.jsx";
import { Btn, Empty } from "./components/ui.jsx";

/** Garde d'acces : seuls marchands et admins entrent dans le dashboard. */
function Gate() {
  const { loading, isSignedIn, isMerchant, isAdmin, logout } = useAuth();

  if (loading) {
    return (
      <div className="center-screen">
        <div className="row">
          <span className="brand-mark">Y</span>
          <span className="spinner" />
        </div>
      </div>
    );
  }

  if (!isSignedIn) return <Login />;

  if (!isMerchant && !isAdmin) {
    return (
      <div className="center-screen">
        <div className="card" style={{ maxWidth: 420 }}>
          <Empty
            icon="alert"
            title="Acces reserve"
            hint="Ce compte n'est rattache a aucune boutique. Le dashboard est reserve aux marchands et aux administrateurs."
            action={
              <Btn icon="logout" onClick={logout}>
                Se deconnecter
              </Btn>
            }
          />
        </div>
      </div>
    );
  }

  // Le dashboard est reduit au seul ecran Menus : toute autre adresse y
  // revient plutot que d'afficher une page vide.
  return (
    <MerchantProvider>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<Menus />} />
          <Route path="menus" element={<Menus />} />
          <Route path="overview" element={<Overview />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </MerchantProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Gate />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
