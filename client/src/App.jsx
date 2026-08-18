import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

// Layout Components
import TopAnnouncementBar from './components/TopAnnouncementBar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DeliveryModal from './components/DeliveryModal';
import AnalyticsTracker from './components/AnalyticsTracker';

// Core E-Commerce Pages
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import WishlistPage from './pages/WishlistPage';
import RemindersPage from './pages/RemindersPage';
import GiftCardsPage from './pages/GiftCardsPage';
import AdminDashboard from './pages/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';

// ── Complete Footer & Specialized Venture Pages ──────────────────────────────
// 1. About
import AboutUsPage from './pages/AboutUsPage';
import CareersPage from './pages/CareersPage';
import StoriesPage from './pages/StoriesPage';
import CorporateBulkGiftingPage from './pages/CorporateBulkGiftingPage';
import PressMediaPage from './pages/PressMediaPage';

// 2. Group Companies
import FloraPage from './pages/FloraPage';
import Studio3DPage from './pages/Studio3DPage';
import BakesPage from './pages/BakesPage';
import LuxePage from './pages/LuxePage';

// 3. Help
import PaymentsFAQPage from './pages/PaymentsFAQPage';
import ShippingDeliveryPage from './pages/ShippingDeliveryPage';
import CancellationReturnsPage from './pages/CancellationReturnsPage';
import HelpCenterPage from './pages/HelpCenterPage';

// 4. Consumer Policy
import TermsOfUsePage from './pages/TermsOfUsePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import GrievanceRedressalPage from './pages/GrievanceRedressalPage';
import EprCompliancePage from './pages/EprCompliancePage';

// Auth Guard for protected routes
import { useAuthStore } from './store/useAuthStore';

const RequireAuth = ({ children }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/profile" replace />;
  return children;
};

const RequireAdmin = ({ children }) => {
  const { user } = useAuthStore();
  if (!user || (user.role !== 'admin' && user.role !== 'support')) {
    return <Navigate to="/profile" replace />;
  }
  return children;
};

// Layout wrapper — used for all public pages
const Layout = ({ children }) => (
  <div className="min-h-screen bg-slate-50 flex flex-col">
    <TopAnnouncementBar />
    <Navbar />
    <main className="flex-1">
      {children}
    </main>
    <Footer />
    <DeliveryModal />
  </div>
);

const App = () => {
  return (
    <HelmetProvider>
      <AnalyticsTracker />
      <Toaster
        position="top-center"
        gutter={8}
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1e293b',
            color: '#fff',
            fontSize: '13px',
            fontWeight: '600',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.2)'
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
        }}
      />

      <Routes>
        {/* ── Admin Panel (No Navbar/Footer) ── */}
        <Route path="/admin" element={
          <RequireAdmin>
            <AdminDashboard />
          </RequireAdmin>
        } />

        {/* ── Core E-Commerce Routes ── */}
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/products" element={<Layout><ProductListPage /></Layout>} />
        <Route path="/product/:slug" element={<Layout><ProductDetailPage /></Layout>} />
        <Route path="/cart" element={<Layout><CartPage /></Layout>} />
        <Route path="/checkout" element={<Layout><CheckoutPage /></Layout>} />
        <Route path="/order-success/:orderId" element={<Layout><OrderSuccessPage /></Layout>} />
        <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
        <Route path="/orders" element={<Layout><RequireAuth><OrdersPage /></RequireAuth></Layout>} />
        <Route path="/wishlist" element={<Layout><WishlistPage /></Layout>} />
        <Route path="/reminders" element={<Layout><RemindersPage /></Layout>} />
        <Route path="/gift-cards" element={<Layout><GiftCardsPage /></Layout>} />

        {/* ── 1. ABOUT ── */}
        <Route path="/about-us" element={<Layout><AboutUsPage /></Layout>} />
        <Route path="/careers" element={<Layout><CareersPage /></Layout>} />
        <Route path="/stories" element={<Layout><StoriesPage /></Layout>} />
        <Route path="/blogs" element={<Layout><StoriesPage /></Layout>} />
        <Route path="/blogs/:slug" element={<Layout><StoriesPage /></Layout>} />
        <Route path="/corporate-bulk-gifting" element={<Layout><CorporateBulkGiftingPage /></Layout>} />
        <Route path="/corporate-gifting" element={<Layout><CorporateBulkGiftingPage /></Layout>} />
        <Route path="/press-media" element={<Layout><PressMediaPage /></Layout>} />
        <Route path="/press" element={<Layout><PressMediaPage /></Layout>} />

        {/* ── 2. GROUP COMPANIES ── */}
        <Route path="/flora" element={<Layout><FloraPage /></Layout>} />
        <Route path="/group/flora" element={<Layout><FloraPage /></Layout>} />
        <Route path="/3d-studio" element={<Layout><Studio3DPage /></Layout>} />
        <Route path="/group/3d-studio" element={<Layout><Studio3DPage /></Layout>} />
        <Route path="/bakes" element={<Layout><BakesPage /></Layout>} />
        <Route path="/group/bakes" element={<Layout><BakesPage /></Layout>} />
        <Route path="/luxe" element={<Layout><LuxePage /></Layout>} />
        <Route path="/group/luxe" element={<Layout><LuxePage /></Layout>} />

        {/* ── 3. HELP ── */}
        <Route path="/payments-faq" element={<Layout><PaymentsFAQPage /></Layout>} />
        <Route path="/shipping-delivery" element={<Layout><ShippingDeliveryPage /></Layout>} />
        <Route path="/shipping-policy" element={<Layout><ShippingDeliveryPage /></Layout>} />
        <Route path="/cancellation-returns" element={<Layout><CancellationReturnsPage /></Layout>} />
        <Route path="/return-policy" element={<Layout><CancellationReturnsPage /></Layout>} />
        <Route path="/help-center" element={<Layout><HelpCenterPage /></Layout>} />
        <Route path="/support" element={<Layout><HelpCenterPage /></Layout>} />

        {/* ── 4. CONSUMER POLICY ── */}
        <Route path="/terms-of-use" element={<Layout><TermsOfUsePage /></Layout>} />
        <Route path="/terms" element={<Layout><TermsOfUsePage /></Layout>} />
        <Route path="/privacy-policy" element={<Layout><PrivacyPolicyPage /></Layout>} />
        <Route path="/privacy" element={<Layout><PrivacyPolicyPage /></Layout>} />
        <Route path="/grievance-redressal" element={<Layout><GrievanceRedressalPage /></Layout>} />
        <Route path="/grievance" element={<Layout><GrievanceRedressalPage /></Layout>} />
        <Route path="/epr-compliance" element={<Layout><EprCompliancePage /></Layout>} />
        <Route path="/epr" element={<Layout><EprCompliancePage /></Layout>} />

        {/* ── 404 Not Found ── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </HelmetProvider>
  );
};

export default App;
