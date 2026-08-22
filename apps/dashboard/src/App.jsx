import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./features/auth/AuthContext.jsx";
import { MerchantProvider } from "./features/merchant/MerchantContext.jsx";
import { ToastProvider } from "./components/Toast.jsx";
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
      <ToastProvider>
        <AuthProvider>
          <Gate />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
