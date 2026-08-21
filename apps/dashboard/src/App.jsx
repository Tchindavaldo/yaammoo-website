import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./features/auth/AuthContext.jsx";
import { MerchantProvider } from "./features/merchant/MerchantContext.jsx";
import DashboardLayout from "./components/DashboardLayout.jsx";
import Login from "./pages/Login.jsx";
import Overview from "./pages/Overview.jsx";
import Orders from "./pages/Orders.jsx";
import Pos from "./pages/Pos.jsx";
import Menus from "./pages/Menus.jsx";
import Wallet from "./pages/Wallet.jsx";
import AdminShops from "./pages/admin/AdminShops.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import { Loading } from "./components/ui.jsx";

/** Garde d'acces : seuls marchands et admins entrent dans le dashboard. */
function Gate() {
  const { loading, isSignedIn, isMerchant, isAdmin, logout } = useAuth();

  if (loading) {
    return (
      <div className="center-screen">
        <Loading label="Verification du compte..." />
      </div>
    );
  }

  if (!isSignedIn) return <Login />;

  if (!isMerchant && !isAdmin) {
    return (
      <div className="center-screen">
        <div className="card card-pad" style={{ maxWidth: 400, textAlign: "center" }}>
          <h2>Acces reserve</h2>
          <p className="muted small">
            Ce compte n'est rattache a aucune boutique. Le dashboard est reserve
            aux marchands et aux administrateurs.
          </p>
          <button className="btn block" onClick={logout} type="button">
            Se deconnecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <MerchantProvider>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="commandes" element={<Orders />} />
          <Route path="caisse" element={<Pos />} />
          <Route path="menus" element={<Menus />} />
          <Route path="portefeuille" element={<Wallet />} />
          {isAdmin && (
            <>
              <Route path="admin/boutiques" element={<AdminShops />} />
              <Route path="admin/commandes" element={<AdminOrders />} />
              <Route path="admin/utilisateurs" element={<AdminUsers />} />
            </>
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </MerchantProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </BrowserRouter>
  );
}
