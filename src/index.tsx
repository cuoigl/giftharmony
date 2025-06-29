import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Outlet, useParams } from "react-router-dom";
import { Landing } from "./pages/Landing";
import { Login } from "./screens/Login";
import { Dashboard } from "./pages/Dashboard";
import { ProductDetail as ProductDetailComponent } from "./screens/ProductDetail";
import { Cart } from "./screens/Cart";
import { Checkout } from "./screens/Checkout";
import { OrderSuccess } from "./screens/OrderSuccess";
import { Profile } from "./screens/Profile";
import { Search } from "./pages/Search";
import { Wishlist } from "./pages/Wishlist";
import { Notifications } from "./pages/Notifications";
import { OrderHistory } from "./pages/OrderHistory";
import { Categories } from "./pages/Categories";
import { Events } from "./pages/Events";
import { Settings } from "./pages/Settings";
import { 
  AdminDashboard, 
  ProductManagement, 
  OrderManagement, 
  UserManagement, 
  Analytics,
  InventoryManagement,
  PromotionManagement,
  ReviewManagement
} from "./pages/Admin";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { ToastProvider } from "./components/ui/toast";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { Forbidden } from "./pages/Forbidden";
import { NotificationProvider } from "./contexts/NotificationContext";

// Wrapper để lấy id từ params và truyền vào ProductDetail
function ProductDetailWrapper(props: any) {
  const { id } = useParams();
  return <ProductDetailComponent productId={id ? Number(id) : undefined} {...props} />;
}

function AppRoutes() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Điều hướng sau đăng nhập
  const handleLoginSuccess = () => {
    if (user && user.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  };

  // Điều hướng sau đăng xuất
  const handleLogout = () => {
    navigate("/", { replace: true });
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing onLogin={() => navigate("/login")} onRegister={() => navigate("/register")} />} />
      <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} defaultTab="login" />} />
      <Route path="/register" element={<Login onLoginSuccess={handleLoginSuccess} defaultTab="register" />} />

      {/* User protected routes */}
      <Route element={<ProtectedRoute fallback={<Navigate to="/login" replace />} />}>
        <Route path="/dashboard" element={<Dashboard onLogout={handleLogout} onViewProfile={() => navigate("/profile")}
          onViewCart={() => navigate("/cart")} onViewWishlist={() => navigate("/wishlist")} onViewNotifications={() => navigate("/notifications")} onViewSearch={q => navigate(`/search${q ? `?q=${q}` : ""}`)} onViewCategories={c => navigate(`/categories${c ? `?c=${c}` : ""}`)} onViewEvents={() => navigate("/events")} onViewSettings={() => navigate("/settings")} onViewOrderHistory={() => navigate("/order-history")} onViewProduct={id => navigate(`/product/${id}`)} />} />
        <Route path="/profile" element={<Profile onBack={() => navigate(-1)} onViewSettings={() => navigate("/settings")} onViewOrderHistory={() => navigate("/order-history")} onViewWishlist={() => navigate("/wishlist")} />} />
        <Route path="/cart" element={<Cart onBack={() => navigate(-1)} onCheckout={() => navigate("/checkout")} />} />
        <Route path="/checkout" element={<Checkout onBack={() => navigate("/cart")} onOrderComplete={() => navigate("/order-success")} />} />
        <Route path="/order-success" element={<OrderSuccess onBackToDashboard={() => navigate("/dashboard")} onViewOrders={() => navigate("/order-history")} />} />
        <Route path="/search" element={<Search onBack={() => navigate(-1)} onViewProduct={id => navigate(`/product/${id}`)} onViewCart={() => navigate("/cart")} />} />
        <Route path="/wishlist" element={<Wishlist onBack={() => navigate(-1)} onViewProduct={id => navigate(`/product/${id}`)} onViewCart={() => navigate("/cart")} />} />
        <Route path="/notifications" element={<Notifications onBack={() => navigate(-1)} />} />
        <Route path="/order-history" element={<OrderHistory onBack={() => navigate(-1)} onViewOrderDetail={() => {}} />} />
        <Route path="/categories" element={<Categories onBack={() => navigate(-1)} onViewProduct={id => navigate(`/product/${id}`)} onViewCart={() => navigate("/cart")} />} />
        <Route path="/events" element={<Events onBack={() => navigate(-1)} />} />
        <Route path="/settings" element={<Settings onBack={() => navigate(-1)} />} />
        <Route path="/product/:id" element={<ProductDetailWrapper onBack={() => navigate(-1)} onViewCart={() => navigate("/cart")} />} />
      </Route>

      {/* Admin protected routes */}
      <Route element={<ProtectedRoute requireAdmin fallback={<Forbidden onBack={() => navigate("/dashboard")} />} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard onViewProducts={() => navigate("/admin/products")} onViewOrders={() => navigate("/admin/orders")} onViewUsers={() => navigate("/admin/users")} onViewAnalytics={() => navigate("/admin/analytics")} onViewInventory={() => navigate("/admin/inventory")} onViewPromotions={() => navigate("/admin/promotions")} onViewReviews={() => navigate("/admin/reviews")} onLogout={handleLogout} />} />
        <Route path="/admin/products" element={<ProductManagement onBack={() => navigate("/admin/dashboard")} />} />
        <Route path="/admin/orders" element={<OrderManagement onBack={() => navigate("/admin/dashboard")} />} />
        <Route path="/admin/users" element={<UserManagement onBack={() => navigate("/admin/dashboard")} />} />
        <Route path="/admin/analytics" element={<Analytics onBack={() => navigate("/admin/dashboard")} />} />
        <Route path="/admin/inventory" element={<InventoryManagement onBack={() => navigate("/admin/dashboard")} />} />
        <Route path="/admin/promotions" element={<PromotionManagement onBack={() => navigate("/admin/dashboard")} />} />
        <Route path="/admin/reviews" element={<ReviewManagement onBack={() => navigate("/admin/dashboard")} />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function Root() {
  // Hàm xử lý khi cần login (ví dụ khi token hết hạn)
  const handleRequireLogin = () => {
    window.location.href = "/login";
  };

  return (
    <NotificationProvider>
      <AuthProvider onRequireLogin={handleRequireLogin}>
        <CartProvider>
          <WishlistProvider>
            <ToastProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);