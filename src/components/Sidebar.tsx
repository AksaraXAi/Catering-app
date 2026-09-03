import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Calendar,
  UtensilsCrossed,
  Users,
  CreditCard,
  ChefHat,
  Boxes,
  Truck,
  BarChart3,
  Settings,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { user, activeTenant } = useAuth();

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Pesanan (Order)', icon: ShoppingBag },
    { id: 'calendar', label: 'Kalender Order', icon: Calendar },
    { id: 'menus', label: 'Menu & Paket', icon: UtensilsCrossed },
    { id: 'customers', label: 'Data Pelanggan', icon: Users },
    { id: 'payments', label: 'Pembayaran', icon: CreditCard },
    { id: 'production', label: 'Jadwal Produksi', icon: ChefHat },
    { id: 'ingredients', label: 'Bahan & Resep', icon: Boxes },
    { id: 'delivery', label: 'Pengiriman', icon: Truck },
    { id: 'reports', label: 'Laporan & Omzet', icon: BarChart3 },
    { id: 'settings', label: 'Pengaturan Usaha', icon: Settings },
  ];

  if (user?.role === 'SUPER_ADMIN') {
    menuItems.push({ id: 'tenants', label: 'Kelola Tenant', icon: Building2 });
  }

  const handleNav = (tabId: string) => {
    onSelectTab(tabId);
    onCloseMobile();
  };

  const publicUrl = activeTenant ? `/catering/${activeTenant.slug}` : null;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-stone-900 text-stone-300 flex flex-col transition-transform duration-300 ease-in-out border-r border-stone-800 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-stone-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              C
            </div>
            <div className="overflow-hidden">
              <h1 className="text-base font-bold text-white tracking-tight truncate">
                {activeTenant?.name || 'CateringApp'}
              </h1>
              <p className="text-[11px] text-stone-400 truncate">
                {user?.role === 'SUPER_ADMIN' ? 'Super Administrator' : 'Dashboard Pemilik'}
              </p>
            </div>
          </div>
        </div>

        {/* Public Page Quick Preview Link */}
        {publicUrl && (
          <div className="px-4 py-2.5 mx-3 my-2 bg-stone-800/60 rounded-xl border border-stone-700/50 flex items-center justify-between">
            <div className="overflow-hidden pr-2">
              <span className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider block">
                Halaman Pelanggan
              </span>
              <span className="text-xs text-emerald-400 font-mono truncate block">
                /catering/{activeTenant?.slug}
              </span>
            </div>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 rounded-lg transition"
              title="Buka Halaman Pemesanan Publik"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer User Info */}
        <div className="p-4 border-t border-stone-800/80 bg-stone-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-stone-700 flex items-center justify-center text-xs font-bold text-stone-200">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
              <p className="text-[11px] text-stone-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
