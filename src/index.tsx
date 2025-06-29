import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Landing } from "./pages/Landing";
import { Login } from "./screens/Login";
import { Dashboard } from "./pages/Dashboard";
import { ProductDetail } from "./screens/ProductDetail";
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
import { Screen } from "./types";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { Forbidden } from "./pages/Forbidden";

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [selectedProductId, setSelectedProductId] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const { user, isAuthenticated } = useAuth();

  // Auto-redirect to dashboard if logged in and on landing, chỉ khi user thực sự tồn tại
  useEffect(() => {
    if (isAuthenticated && user && currentScreen === 'landing') {
      setCurrentScreen(user.role === 'admin' ? 'admin-dashboard' : 'dashboard');
    }
  }, [isAuthenticated, currentScreen, user]);

  // Auto-redirect to landing nếu vừa logout (luôn reset về landing và isAdminMode false)
  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentScreen('landing');
      setIsAdminMode(false);
    }
  }, [isAuthenticated]);

  // Reset isAdminMode nếu user không còn là admin hoặc đã logout
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      setIsAdminMode(false);
    }
  }, [user]);

  const handleRequireLogin = () => {
    setCurrentScreen('login');
  };

  const handleLoginSuccess = () => {
    setCurrentScreen('dashboard');
  };

  const handleAdminLogin = () => {
    setIsAdminMode(true);
    setCurrentScreen('admin-dashboard');
  };

  const handleLogout = () => {
    setIsAdminMode(false);
    setCurrentScreen('landing'); // Đảm bảo mọi user luôn về landing khi logout
  };

  const handleGoToLogin = () => {
    setCurrentScreen('login');
  };

  const handleGoToRegister = () => {
    setCurrentScreen('register');
  };

  const handleViewProduct = (productId: number) => {
    setSelectedProductId(productId);
    setCurrentScreen('product-detail');
  };

  const handleBackToDashboard = () => {
    if (isAdminMode) {
      setCurrentScreen('admin-dashboard');
    } else {
      setCurrentScreen('dashboard');
    }
  };

  const handleViewCart = () => {
    setCurrentScreen('cart');
  };

  const handleCheckout = () => {
    setCurrentScreen('checkout');
  };

  const handleOrderComplete = () => {
    setCurrentScreen('order-success');
  };

  const handleViewProfile = () => {
    setCurrentScreen('profile');
  };

  const handleViewSearch = (query?: string) => {
    if (query) setSearchQuery(query);
    setCurrentScreen('search');
  };

  const handleViewWishlist = () => {
    setCurrentScreen('wishlist');
  };

  const handleViewNotifications = () => {
    setCurrentScreen('notifications');
  };

  const handleViewOrderHistory = () => {
    setCurrentScreen('order-history');
  };

  const handleViewCategories = (category?: string) => {
    if (category) setSelectedCategory(category);
    setCurrentScreen('categories');
  };

  const handleViewEvents = () => {
    setCurrentScreen('events');
  };

  const handleViewSettings = () => {
    setCurrentScreen('settings');
  };

  const handleViewOrderDetail = (orderId: string) => {
    // For now, just show a toast - in a real app this would navigate to order detail
    console.log('View order detail:', orderId);
  };

  // Admin handlers
  const handleViewProducts = () => {
    setCurrentScreen('admin-products');
  };

  const handleViewOrders = () => {
    setCurrentScreen('admin-orders');
  };

  const handleViewUsers = () => {
    setCurrentScreen('admin-users');
  };

  const handleViewAnalytics = () => {
    setCurrentScreen('admin-analytics');
  };

  const handleViewInventory = () => {
    setCurrentScreen('admin-inventory');
  };

  const handleViewPromotions = () => {
    setCurrentScreen('admin-promotions');
  };

  const handleViewReviews = () => {
    setCurrentScreen('admin-reviews');
  };

  // Nếu chưa xác thực hoặc không có user, chỉ cho phép vào landing/login/register
  if (!isAuthenticated || !user) {
    if (currentScreen === 'login') {
      return (
        <Login 
          onLoginSuccess={handleLoginSuccess}
          onAdminLogin={handleAdminLogin}
          onBackToLanding={() => setCurrentScreen('landing')}
          defaultTab="login"
        />
      );
    }
    if (currentScreen === 'register') {
      return (
        <Login 
          onLoginSuccess={handleLoginSuccess}
          onAdminLogin={handleAdminLogin}
          onBackToLanding={() => setCurrentScreen('landing')}
          defaultTab="register"
        />
      );
    }
    return (
      <Landing 
        onLogin={handleGoToLogin}
        onRegister={handleGoToRegister}
      />
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'landing':
        return (
          <Landing 
            onLogin={handleGoToLogin}
            onRegister={handleGoToRegister}
          />
        );
      case 'login':
        return (
          <Login 
            onLoginSuccess={handleLoginSuccess}
            onAdminLogin={handleAdminLogin}
            onBackToLanding={() => setCurrentScreen('landing')}
            defaultTab="login"
          />
        );
      case 'register':
        return (
          <Login 
            onLoginSuccess={handleLoginSuccess}
            onAdminLogin={handleAdminLogin}
            onBackToLanding={() => setCurrentScreen('landing')}
            defaultTab="register"
          />
        );
      case 'dashboard':
        return (
          <Dashboard 
            onViewProduct={handleViewProduct}
            onViewCart={handleViewCart}
            onViewWishlist={handleViewWishlist}
            onViewNotifications={handleViewNotifications}
            onLogout={handleLogout}
            onViewProfile={handleViewProfile}
            onViewSearch={handleViewSearch}
            onViewCategories={handleViewCategories}
            onViewEvents={handleViewEvents}
            onViewSettings={handleViewSettings}
            onViewOrderHistory={handleViewOrderHistory}
          />
        );
      case 'product-detail':
        return (
          <ProductDetail
            productId={selectedProductId}
            onBack={handleBackToDashboard}
            onViewCart={handleViewCart}
          />
        );
      case 'cart':
        return (
          <Cart
            onBack={handleBackToDashboard}
            onCheckout={handleCheckout}
          />
        );
      case 'checkout':
        return (
          <Checkout
            onBack={handleViewCart}
            onOrderComplete={handleOrderComplete}
          />
        );
      case 'order-success':
        return (
          <OrderSuccess
            onBackToDashboard={handleBackToDashboard}
            onViewOrders={handleViewOrderHistory}
          />
        );
      case 'profile':
        return (
          <Profile
            onBack={handleBackToDashboard}
            onViewSettings={handleViewSettings}
            onViewOrderHistory={handleViewOrderHistory}
            onViewWishlist={handleViewWishlist}
          />
        );
      case 'search':
        return (
          <Search
            onBack={handleBackToDashboard}
            onViewProduct={handleViewProduct}
            onViewCart={handleViewCart}
            initialQuery={searchQuery}
          />
        );
      case 'wishlist':
        return (
          <Wishlist
            onBack={handleBackToDashboard}
            onViewProduct={handleViewProduct}
            onViewCart={handleViewCart}
          />
        );
      case 'notifications':
        return (
          <Notifications
            onBack={handleBackToDashboard}
          />
        );
      case 'order-history':
        return (
          <OrderHistory
            onBack={handleBackToDashboard}
            onViewOrderDetail={handleViewOrderDetail}
          />
        );
      case 'categories':
        return (
          <Categories
            onBack={handleBackToDashboard}
            onViewProduct={handleViewProduct}
            onViewCart={handleViewCart}
            selectedCategory={selectedCategory}
          />
        );
      case 'events':
        return (
          <Events
            onBack={handleBackToDashboard}
          />
        );
      case 'settings':
        return (
          <Settings
            onBack={handleBackToDashboard}
          />
        );
      // Admin screens
      case 'admin-dashboard':
        return (
          <ProtectedRoute requireAdmin fallback={<Forbidden onBack={handleBackToDashboard} />}>
            <AdminDashboard
              onViewProducts={handleViewProducts}
              onViewOrders={handleViewOrders}
              onViewUsers={handleViewUsers}
              onViewAnalytics={handleViewAnalytics}
              onViewInventory={handleViewInventory}
              onViewPromotions={handleViewPromotions}
              onViewReviews={handleViewReviews}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        );
      case 'admin-products':
        return (
          <ProtectedRoute requireAdmin fallback={< Forbidden onBack={handleBackToDashboard} />}>
            <ProductManagement onBack={handleBackToDashboard} />
          </ProtectedRoute>
        );
      case 'admin-orders':
        return (
          <ProtectedRoute requireAdmin fallback={< Forbidden onBack={handleBackToDashboard} />}>
            <OrderManagement onBack={handleBackToDashboard} />
          </ProtectedRoute>
        );
      case 'admin-users':
        return (
          <ProtectedRoute requireAdmin fallback={< Forbidden onBack={handleBackToDashboard} />}>
            <UserManagement onBack={handleBackToDashboard} />
          </ProtectedRoute>
        );
      case 'admin-analytics':
        return (
          <ProtectedRoute requireAdmin fallback={< Forbidden onBack={handleBackToDashboard} />}>
            <Analytics onBack={handleBackToDashboard} />
          </ProtectedRoute>
        );
      case 'admin-inventory':
        return (
          <ProtectedRoute requireAdmin fallback={< Forbidden onBack={handleBackToDashboard} />}>
            <InventoryManagement onBack={handleBackToDashboard} />
          </ProtectedRoute>
        );
      case 'admin-promotions':
        return (
          <ProtectedRoute requireAdmin fallback={< Forbidden onBack={handleBackToDashboard} />}>
            <PromotionManagement onBack={handleBackToDashboard} />
          </ProtectedRoute>
        );
      case 'admin-reviews':
        return (
          <ProtectedRoute requireAdmin fallback={< Forbidden onBack={handleBackToDashboard} />}>
            <ReviewManagement onBack={handleBackToDashboard} />
          </ProtectedRoute>
        );
      default:
        return (
          <Landing 
            onLogin={handleGoToLogin}
            onRegister={handleGoToRegister}
          />
        );
    }
  };

  return renderScreen();
}

function Root() {
  // Đảm bảo tất cả Provider bọc ngoài App để giữ state khi F5 hoặc chuyển màn hình
  return (
    <AuthProvider onRequireLogin={() => {}}>
      <CartProvider>
        <WishlistProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);