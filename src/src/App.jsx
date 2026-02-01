// src/App.jsx - FIXED with NewsProvider

import {
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ScrollToTop from "./components/common/ScrollToTop";
import { NewsProvider } from './context/NewsContext';  // ✅ Already imported
import { ensureHindiDefault, setEnglishSecondary } from "./utils/languageReset";

// Public Pages
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import ArticleDetail from "./pages/ArticleDetail";
import SearchPage from "./pages/SearchPage";
import Videos from "./pages/Videos";
import Photos from "./pages/Photos";
import Epaper from "./pages/Epaper";
import LiveTV from "./pages/LiveTV";
import Opinion from "./pages/Opinion";
import Trending from "./pages/Trending";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import DashboardStats from "./components/admin/DashboardStats";
import ManageCategories from "./pages/admin/ManageCategories";
import ManageNews from "./pages/admin/ManageNews";
import NewsEditor from "./components/admin/NewsEditor";
import ApprovalQueue from "./components/admin/ApprovalQueue";
import ManageEpaper from "./pages/admin/ManageEpaper";
import ManageUsers from "./pages/admin/ManageUsers";

import { AuthProvider, useAuth } from "./context/AuthContext";

/* ===================== PROTECTED ROUTE ===================== */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    const hasAccess = Array.isArray(allowedRoles)
      ? allowedRoles.includes(user?.role)
      : user?.role === allowedRoles;

    if (!hasAccess) {
      if (user?.role === 'enduser') {
        return <Navigate to="/" replace />;
      } else {
        return <Navigate to="/admin" replace />;
      }
    }
  }

  return children;
};

/* ===================== LAYOUT ===================== */
const Layout = ({ children }) => {
  const location = useLocation();

  ensureHindiDefault();
  setEnglishSecondary();

  const isEpaperPage = location.pathname.startsWith("/epaper");
  const isAdminPage = location.pathname.startsWith("/admin");
  const isLiveTVPage = location.pathname.startsWith("/live-tv");
  const isReporterPage = location.pathname.startsWith("/reporter");
  const isLoginPage = location.pathname === "/login";

  if (
    isEpaperPage ||
    isAdminPage ||
    isLiveTVPage ||
    isReporterPage ||
    isLoginPage
  ) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pt-[160px] md:pt-[140px] lg:pt-[180px]">
        {children}
      </main>
      <Footer />
    </div>
  );
};

/* ===================== APP ===================== */
function App() {
  return (
    <AuthProvider>
      <NewsProvider>  {/* ✅ ADD THIS - Wrap everything with NewsProvider */}
        <ScrollToTop />
        <Layout>
          <Routes>

            {/* PUBLIC ROUTES */}
            <Route path="/" element={<Home />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/category/:category/:subcategory" element={<CategoryPage />} />
            <Route path="/article/:slug" element={<ArticleDetail />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/photos" element={<Photos />} />

            {/* E-PAPER ROUTES */}
            <Route path="/epaper" element={<Epaper />} />
            <Route path="/epaper/:edition" element={<Epaper />} />

            <Route path="/live-tv" element={<LiveTV />} />
            <Route path="/opinion" element={<Opinion />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />

            {/* LOGIN */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<Navigate to="/login" replace />} />

            {/* ADMIN ROUTES */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin', 'reporter']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardStats />} />
              <Route path="categories" element={<ManageCategories />} />
              <Route path="news" element={<ManageNews />} />
              <Route path="news/create" element={<NewsEditor />} />
              <Route path="news/edit/:id" element={<NewsEditor />} />
              <Route path="epaper" element={<ManageEpaper />} />

              <Route
                path="news/approval"
                element={
                  <ProtectedRoute allowedRoles="admin">
                    <ApprovalQueue />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users"
                element={
                  <ProtectedRoute allowedRoles="admin">
                    <ManageUsers />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* REPORTER REDIRECT */}
            <Route path="/reporter/*" element={<Navigate to="/admin" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </Layout>
      </NewsProvider>  {/* ✅ Close NewsProvider */}
    </AuthProvider>
  );
}

export default App;