import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { Navbar } from './components/Navbar.tsx';
import { NewOrderModal } from './components/NewOrderModal.tsx';

// Public pages
import { CateringPublicPage } from './pages/public/CateringPublicPage.tsx';

// Admin pages
import { LoginPage } from './pages/admin/LoginPage.tsx';
import { OverviewDashboard } from './pages/admin/OverviewDashboard.tsx';
import { OrdersPage } from './pages/admin/OrdersPage.tsx';
import { CalendarPage } from './pages/admin/CalendarPage.tsx';
import { MenusPage } from './pages/admin/MenusPage.tsx';
import { CustomersPage } from './pages/admin/CustomersPage.tsx';
import { PaymentsPage } from './pages/admin/PaymentsPage.tsx';
import { ProductionPage } from './pages/admin/ProductionPage.tsx';
import { IngredientsPage } from './pages/admin/IngredientsPage.tsx';
import { DeliveryPage } from './pages/admin/DeliveryPage.tsx';
import { ReportsPage } from './pages/admin/ReportsPage.tsx';
import { SettingsPage } from './pages/admin/SettingsPage.tsx';
import { TenantsPage } from './pages/admin/TenantsPage.tsx';

const AppContent: React.FC = () => {
  const { user, loading, activeTenant } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState<boolean>(false);

  // Sync with browser navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  // Route: /catering/:slug
  const cateringMatch = currentPath.match(/^\/catering\/([a-zA-Z0-9_-]+)/);
  if (cateringMatch) {
    const slug = cateringMatch[1];
    return (
      <CateringPublicPage
        slug={slug}
        onNavigateToLogin={() => navigateTo('/login')}
      />
    );
  }

  // Loading session
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-stone-500 font-medium">Memuat CateringApp...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in: Show Login Page (or allow viewing customer page)
  if (!user) {
    return (
      <LoginPage
        onBackToCustomerView={() => {
          const targetSlug = activeTenant?.slug || 'busiti';
          navigateTo(`/catering/${targetSlug}`);
        }}
      />
    );
  }

  // Map active tab to page title
  const tabTitles: Record<string, string> = {
    overview: 'Ringkasan Dashboard',
    orders: 'Daftar Pesanan (Order)',
    calendar: 'Kalender Acara & Kapasitas Dapur',
    menus: 'Katalog Paket Menu',
    customers: 'Buku Pelanggan',
    payments: 'Kas Masuk & Pembayaran',
    production: 'Jadwal Dapur & Kebutuhan Bahan',
    ingredients: 'Inventori Bahan Baku',
    delivery: 'Pengiriman & Rute Kurir',
    reports: 'Laporan Omzet & Keuangan',
    settings: 'Pengaturan Profil Usaha',
    tenants: 'Kelola Usaha Catering (Multi-Tenant)',
  };

  return (
    <div className="min-h-screen bg-stone-100/70 flex">
      {/* Sidebar */}
      <Sidebar
        currentTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (currentPath !== '/admin' && currentPath !== '/') {
            navigateTo('/admin');
          }
        }}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar
          title={tabTitles[activeTab] || 'Dashboard'}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <OverviewDashboard
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenNewOrderModal={() => setIsNewOrderModalOpen(true)}
            />
          )}
          {activeTab === 'orders' && <OrdersPage />}
          {activeTab === 'calendar' && <CalendarPage />}
          {activeTab === 'menus' && <MenusPage />}
          {activeTab === 'customers' && <CustomersPage />}
          {activeTab === 'payments' && <PaymentsPage />}
          {activeTab === 'production' && <ProductionPage />}
          {activeTab === 'ingredients' && <IngredientsPage />}
          {activeTab === 'delivery' && <DeliveryPage />}
          {activeTab === 'reports' && <ReportsPage />}
          {activeTab === 'settings' && <SettingsPage />}
          {activeTab === 'tenants' && <TenantsPage />}
        </main>
      </div>

      {/* Global New Order Modal */}
      {isNewOrderModalOpen && (
        <NewOrderModal
          onClose={() => setIsNewOrderModalOpen(false)}
          onOrderCreated={() => {
            setActiveTab('orders');
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
