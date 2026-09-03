import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Tenant } from '../types.ts';
import { api, getAuthToken, setAuthToken, setActiveTenantHeader, getActiveTenantHeader } from '../api/client.ts';

interface AuthContextType {
  user: User | null;
  activeTenant: Tenant | null;
  availableTenants: Tenant[];
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  switchTenant: (tenantId: string) => void;
  refreshTenant: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null);
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadUserData = async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);

        // Fetch tenants list for switcher
        try {
          const tenantsRes = await api.getTenants();
          if (tenantsRes.success) {
            setAvailableTenants(tenantsRes.tenants || []);

            // Set active tenant: check saved preference or user's assigned tenant
            const savedTenantId = getActiveTenantHeader();
            let selected = tenantsRes.tenants.find((t: Tenant) => t.id === savedTenantId);
            if (!selected) {
              selected = tenantsRes.tenants.find((t: Tenant) => t.id === res.user.tenantId) || tenantsRes.tenants[0];
            }
            if (selected) {
              setActiveTenant(selected);
              setActiveTenantHeader(selected.id);
            }
          }
        } catch (e) {
          console.error('Error fetching tenants:', e);
        }
      } else {
        setAuthToken(null);
      }
    } catch (err) {
      console.error('Auth verification failed:', err);
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await api.login(credentials);
      if (res.success && res.token) {
        setAuthToken(res.token);
        setUser(res.user);

        // Fetch tenants
        const tenantsRes = await api.getTenants();
        if (tenantsRes.success) {
          setAvailableTenants(tenantsRes.tenants || []);
          const chosen = tenantsRes.tenants.find((t: Tenant) => t.id === res.user.tenantId) || tenantsRes.tenants[0];
          if (chosen) {
            setActiveTenant(chosen);
            setActiveTenantHeader(chosen.id);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setActiveTenantHeader(null);
    setUser(null);
    setActiveTenant(null);
  };

  const switchTenant = (tenantId: string) => {
    const found = availableTenants.find((t) => t.id === tenantId);
    if (found) {
      setActiveTenant(found);
      setActiveTenantHeader(found.id);
      // Reload page or let components re-fetch
    }
  };

  const refreshTenant = async () => {
    if (!activeTenant) return;
    try {
      const res = await api.getTenants();
      if (res.success) {
        setAvailableTenants(res.tenants);
        const updated = res.tenants.find((t: Tenant) => t.id === activeTenant.id);
        if (updated) setActiveTenant(updated);
      }
    } catch (err) {
      console.error('Failed to refresh tenant:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeTenant,
        availableTenants,
        loading,
        login,
        logout,
        switchTenant,
        refreshTenant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
