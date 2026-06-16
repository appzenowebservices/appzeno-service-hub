import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import ScrollToTop from "./components/common/ScrollToTop";
import { useAuthStore } from "./store/authStore";
import type { UserRole } from "./types";
import HomePage    from "./pages/public/HomePage";
import BookingPage from "./pages/customer/booking/BookingPage";
import ComingSoon        from "./components/common/ComingSoon";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import VendorDashboard   from "./pages/vendor/VendorDashboard";
import AgentDashboard    from "./pages/agent/AgentDashboard";
import AdminDashboard    from "./pages/admin/AdminDashboard";
import AboutPage         from "./pages/public/AboutPage";
import HowItWorksPage    from "./pages/public/HowItWorksPage";
import ContactPage       from "./pages/public/ContactPage";
import TermsPage         from "./pages/public/TermsPage";
import PrivacyPage       from "./pages/public/PrivacyPage";

// ─── AUTH PAGES ───────────────────────────────────────────────────────────────
import LoginPage            from "./pages/auth/LoginPage";
import RegisterPage         from "./pages/auth/RegisterPage";
import CustomerRegisterPage from "./pages/auth/CustomerRegisterPage";
import VendorRegisterPage   from "./pages/auth/VendorRegisterPage";
import AgentRegisterPage    from "./pages/auth/AgentRegisterPage";

// ─── SERVICE DETAIL PAGE ──────────────────────────────────────────────────────
// 1 generic page for ALL 12 categories
// Route: /:citySlug/:categorySlug  (PUBLIC — login only on "Book Now" click)
import ServiceDetailPage from "./pages/services/ServiceDetailPage";
import AllServicesPage    from "./pages/services/AllServicesPage";

// ─── DIRECTORY PAGES ──────────────────────────────────────────────────────────
// Route: /vendors  and  /vendors/:slug  (PUBLIC — no login required)
import VendorDirectoryPage     from "./pages/directory/VendorDirectoryPage";
import VendorPublicProfilePage from "./pages/directory/VendorPublicProfilePage";

// ─── ROUTE GUARD ─────────────────────────────────────────────────────────────
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          redirect:     location.pathname,
          ...(location.state ?? {}),
        }}
      />
    );
  }
  if (allowedRoles && user && !allowedRoles.includes(user.role as UserRole))
    return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
}

function P({ page, roles }: { page: string; roles?: UserRole[] }) {
  if (roles) return <ProtectedRoute allowedRoles={roles}><ComingSoon page={page} /></ProtectedRoute>;
  return <ComingSoon page={page} />;
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>

        {/* ── PUBLIC ── */}
        <Route path="/"              element={<HomePage />} />
        <Route path="/services"      element={<AllServicesPage />} />
        <Route path="/services"      element={<P page="All Services" />} />
        <Route path="/cities"        element={<P page="City Selection" />} />
        <Route path="/about-us"         element={<AboutPage />} />
        <Route path="/how-it-works"  element={<HowItWorksPage />} />
        <Route path="/become-vendor" element={<P page="Become a Partner" />} />
        <Route path="/contact-us"       element={<ContactPage />} />
        <Route path="/privacy"       element={<PrivacyPage />} />
        <Route path="/terms"         element={<TermsPage />} />

        {/* ── BOOKING FORM (PROTECTED) ─────────────────────────────────────────
            /book  and  /customer/book  — fallback direct booking routes
            Main flow: ServiceDetailPage → Login → CustomerDashboard (book tab)
        ── */}
        <Route path="/book"
               element={<ProtectedRoute allowedRoles={["customer"]}><BookingPage /></ProtectedRoute>} />
        <Route path="/customer/book"
               element={<ProtectedRoute allowedRoles={["customer"]}><BookingPage /></ProtectedRoute>} />

        {/* ── DIRECTORY (PUBLIC) ───────────────────────────────────────────────
            MUST come BEFORE /:citySlug/:categorySlug to avoid slug conflict
        ── */}
        <Route path="/vendors"       element={<VendorDirectoryPage />} />
        <Route path="/vendors/:slug" element={<VendorPublicProfilePage />} />

        {/* ── SERVICE DETAIL PAGE (PUBLIC) ─────────────────────────────────────
            /:citySlug/:categorySlug  → ServiceDetailPage  (all 12 categories)
            /varanasi/home-cleaning, /delhi/ac-service, etc.
            MUST come after /book routes to avoid conflict
        ── */}
        <Route path="/:citySlug/:categorySlug"
               element={<ServiceDetailPage />} />

        {/* ── SLUG-BASED CITY / CATEGORY — booking routes ke baad rakho ── */}
        <Route path="/:citySlug/category/:categorySlug" element={<P page="Service Category" />} />
        <Route path="/:citySlug/service/:serviceSlug"   element={<P page="Service Detail" />} />
        <Route path="/:citySlug"                        element={<P page="City Landing" />} />

        {/* ── AUTH ── */}
        <Route path="/login"             element={<LoginPage />} />
        <Route path="/register"          element={<RegisterPage />} />
        <Route path="/register/customer" element={<CustomerRegisterPage />} />
        <Route path="/register/vendor"   element={<VendorRegisterPage />} />
        <Route path="/register/agent"    element={<AgentRegisterPage />} />
        <Route path="/verify-otp"        element={<P page="OTP Verification" />} />
        <Route path="/forgot-password"   element={<P page="Forgot Password" />} />
        <Route path="/reset-password"    element={<P page="Reset Password" />} />
        <Route path="/pending-approval"  element={<P page="Pending Approval" />} />

        {/* ── CUSTOMER ── */}
        <Route path="/customer"
               element={<ProtectedRoute allowedRoles={["customer"]}><CustomerDashboard /></ProtectedRoute>} />
        <Route path="/customer/bookings"      element={<P page="My Bookings"      roles={["customer"]} />} />
        <Route path="/customer/bookings/:id"  element={<P page="Booking Detail"   roles={["customer"]} />} />
        <Route path="/customer/wallet"        element={<P page="Wallet"           roles={["customer"]} />} />
        <Route path="/customer/addresses"     element={<P page="Saved Addresses"  roles={["customer"]} />} />
        <Route path="/customer/profile"       element={<P page="Profile Settings" roles={["customer"]} />} />
        <Route path="/customer/notifications" element={<P page="Notifications"    roles={["customer"]} />} />
        <Route path="/customer/support"       element={<P page="Support Center"   roles={["customer"]} />} />

        {/* ── VENDOR ── */}
        <Route path="/vendor"
               element={<ProtectedRoute allowedRoles={["vendor"]}><VendorDashboard /></ProtectedRoute>} />
        <Route path="/vendor/leads"             element={<ProtectedRoute allowedRoles={["vendor"]}><VendorDashboard /></ProtectedRoute>} />
        <Route path="/vendor/jobs/accepted"     element={<ProtectedRoute allowedRoles={["vendor"]}><VendorDashboard /></ProtectedRoute>} />
        <Route path="/vendor/jobs/completed"    element={<ProtectedRoute allowedRoles={["vendor"]}><VendorDashboard /></ProtectedRoute>} />
        <Route path="/vendor/earnings"          element={<ProtectedRoute allowedRoles={["vendor"]}><VendorDashboard /></ProtectedRoute>} />
        <Route path="/vendor/subscription"      element={<ProtectedRoute allowedRoles={["vendor"]}><VendorDashboard /></ProtectedRoute>} />
        <Route path="/vendor/reviews"           element={<ProtectedRoute allowedRoles={["vendor"]}><VendorDashboard /></ProtectedRoute>} />
        <Route path="/vendor/service-area"      element={<ProtectedRoute allowedRoles={["vendor"]}><VendorDashboard /></ProtectedRoute>} />
        <Route path="/vendor/pricing"           element={<ProtectedRoute allowedRoles={["vendor"]}><VendorDashboard /></ProtectedRoute>} />
        <Route path="/vendor/profile"           element={<ProtectedRoute allowedRoles={["vendor"]}><VendorDashboard /></ProtectedRoute>} />
        <Route path="/vendor/analytics"         element={<ProtectedRoute allowedRoles={["vendor"]}><VendorDashboard /></ProtectedRoute>} />

        {/* ── AGENT ── */}
        <Route path="/agent" element={<ProtectedRoute allowedRoles={["agent"]}><AgentDashboard /></ProtectedRoute>} />
        <Route path="/agent/approvals"          element={<P page="Vendor Approvals"      roles={["agent"]} />} />
        <Route path="/agent/disputes"           element={<P page="Dispute Resolution"    roles={["agent"]} />} />
        <Route path="/agent/analytics"          element={<P page="City Analytics"        roles={["agent"]} />} />
        <Route path="/agent/commissions"        element={<P page="Commission Reports"    roles={["agent"]} />} />
        <Route path="/agent/vendor-performance" element={<P page="Vendor Performance"    roles={["agent"]} />} />
        <Route path="/agent/area-expansion"     element={<P page="Area Expansion"        roles={["agent"]} />} />

        {/* ── ADMIN ── */}
        <Route path="/admin"
               element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/categories"
               element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/cities"
               element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/vendors"
               element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/customers"
               element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/finance"
               element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/disputes"
               element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/analytics"
               element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/payouts"
               element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/subscriptions"
               element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />

        {/* ── FALLBACK ── */}
        <Route path="/unauthorized" element={<P page="Unauthorized" />} />
        <Route path="*"             element={<P page="404 — Not Found" />} />

      </Routes>
    </BrowserRouter>
  );
}