import { Routes, Route, Navigate, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ListingPage from "./pages/ListingPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SellerDashboard from "./pages/SellerDashboard";
import DisputesPage from "./pages/DisputesPage";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold text-lg tracking-tight">
            STOREFRONT
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link to="/seller">Seller</Link>
            <Link to="/disputes">Disputes</Link>
            <Link to="/admin">Admin</Link>
            <Link to="/login" className="ml-4">
              Login
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/listings/:id" element={<ListingPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/seller" element={<SellerDashboard />} />
          <Route path="/disputes" element={<DisputesPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="border-t border-slate-800 text-xs text-slate-400 py-4 mt-4">
        <div className="max-w-6xl mx-auto px-4 flex justify-between">
          <span>© {new Date().getFullYear()} STOREFRONT</span>
          <span>Anonymous marketplace with platform escrow</span>
        </div>
      </footer>
    </div>
  );
}

export default App;


