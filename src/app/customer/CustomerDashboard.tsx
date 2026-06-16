// src/pages/customer/CustomerDashboard.tsx
// Main controller — reads openTab state from ServiceDetailPage/LoginPage
// Renders DashboardLayout + appropriate page component

import { useState } from "react";
import { useLocation } from "react-router-dom";

import DashboardLayout   from "./dashboard/DashboardLayout";
import DashboardHome     from "./dashboard/pages/DashboardHome";
import MyBookingsPage    from "./dashboard/pages/MyBookingsPage";
import WalletPage        from "./dashboard/pages/WalletPage";
import AddressesPage     from "./dashboard/pages/AddressesPage";
import NotificationsPage from "./dashboard/pages/NotificationsPage";
import ProfilePage       from "./dashboard/pages/ProfilePage";
import SupportPage       from "./dashboard/pages/SupportPage";
import BookingPage       from "./booking/BookingPage";

export default function CustomerDashboard() {
  const location = useLocation();

  // Auto-open "book" tab if redirected from ServiceDetailPage or LoginPage
  const _locState = (location.state ?? {}) as { openTab?: string; categorySlug?: string };
  const initTab   = _locState.openTab === "book" || !!_locState.categorySlug ? "book" : "dashboard";

  const [activeTab, setActiveTab] = useState(initTab);

  function renderPage() {
    switch (activeTab) {
      case "dashboard":     return <DashboardHome setTab={setActiveTab} />;
      case "bookings":      return <MyBookingsPage />;
      case "book":          return <BookingPage key="dashboard-booking" />;
      case "wallet":        return <WalletPage />;
      case "addresses":     return <AddressesPage />;
      case "notifications": return <NotificationsPage />;
      case "profile":       return <ProfilePage />;
      case "support":       return <SupportPage />;
      default:              return <DashboardHome setTab={setActiveTab} />;
    }
  }

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderPage()}
    </DashboardLayout>
  );
}
