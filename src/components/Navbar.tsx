import React from 'react';
import { Menu as MenuIcon, ExternalLink, LogOut, Building2, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  title: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu, title }) => {
  const { user, activeTenant, availableTenants, switchTenant, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-stone-200 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
      <div className="flex items-center space-x-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
          aria-label="Buka Menu"
        >
          <MenuIcon className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-stone-900 truncate tracking-tight">
          {title}
        </h2>
      </div>

      <div className="flex items-center space-x-3">
        {/* Tenant Selector (if multiple tenants or Super Admin) */}
        {availableTenants.length > 1 && (
          <div className="hidden sm:flex items-center space-x-2 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200">
            <Building2 className="w-4 h-4 text-stone-500" />
            <select
              value={activeTenant?.id || ''}
              onChange={(e) => switchTenant(e.target.value)}
              aria-label="Pilih Usaha Catering"
              className="bg-transparent text-xs font-medium text-stone-800 focus:outline-hidden cursor-pointer"
            >
              {availableTenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Public Catalog Link */}
        {activeTenant && (
          <a
            href={`/catering/${activeTenant.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
            title="Buka Website Pemesanan Pelanggan"
          >
            <Store className="w-3.5 h-3.5 mr-1.5" />
            <span className="hidden sm:inline">Halaman Order</span>
            <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
          </a>
        )}

        {/* Logout Button */}
        <button
          onClick={logout}
          className="inline-flex items-center p-2 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition text-xs font-medium"
          title="Keluar / Logout"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline ml-1.5">Keluar</span>
        </button>
      </div>
    </header>
  );
};
