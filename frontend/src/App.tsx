import { Routes, Route, Navigate, Link } from "react-router-dom";
import { Header } from "./components/layout/Header";
import Home from "./pages/Home";
import Search from "./pages/Search";
import ListingDetail from "./pages/ListingDetail";
import SellerProfile from "./pages/SellerProfile";
import Sell from "./pages/Sell";
import Account from "./pages/Account";
import Help from "./pages/Help";
import Checkout from "./pages/Checkout";
import Cart from "./pages/Cart";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Welcome from "./pages/Welcome";
import DisputesPage from "./pages/DisputesPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSellerDetail from "./pages/AdminSellerDetail";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import OrdersPage from "./pages/OrdersPage";
import OrderDetail from "./pages/OrderDetail";
import BecomeSeller from "./pages/BecomeSeller";
import SellerProfilePage from "./pages/SellerProfilePage";
import SellerConfirmation from "./pages/SellerConfirmation";
import SellerPortal from "./pages/SellerPortal";
import SellerHome from "./pages/SellerHome";

function App() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              loading ? (
                <div className="flex items-center justify-center min-h-[400px] text-sm text-gray-600">
                  Loading...
                </div>
              ) : isAuthenticated ? (
                <Home />
              ) : (
                <Navigate to="/welcome" replace />
              )
            }
          />
          <Route path="/welcome" element={<Welcome />} />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            }
          />
          <Route
            path="/listing/:id"
            element={
              <ProtectedRoute>
                <ListingDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/:sellerId"
            element={
              <ProtectedRoute>
                <SellerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sell"
            element={
              <ProtectedRoute>
                <Sell />
              </ProtectedRoute>
            }
          />
          <Route
            path="/become-seller"
            element={
              <ProtectedRoute>
                <BecomeSeller />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller"
            element={
              <ProtectedRoute>
                <SellerHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/profile"
            element={
              <ProtectedRoute>
                <SellerProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/portal"
            element={
              <ProtectedRoute>
                <SellerPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/confirmation"
            element={
              <ProtectedRoute>
                <SellerConfirmation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            }
          />
          <Route path="/help" element={<Help />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout/:id"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/disputes"
            element={
              <ProtectedRoute>
                <DisputesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/sellers/:userId"
            element={
              <ProtectedRoute>
                <AdminSellerDetail />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="bg-white border-t border-gray-200 text-xs text-gray-600 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 flex justify-between">
          <span>© {new Date().getFullYear()} STOREFRONT</span>
          <div className="flex gap-4">
            <Link to="/help" className="hover:text-blue-600">
              Help
            </Link>
            <span className="text-gray-400">|</span>
            <span className="text-gray-500">Prohibited Items (see Help)</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-500">Report Listing (see Help)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
