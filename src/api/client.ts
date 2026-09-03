const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('catering_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('catering_token', token);
  } else {
    localStorage.removeItem('catering_token');
  }
}

export function getActiveTenantHeader(): string | null {
  return localStorage.getItem('catering_active_tenant_id');
}

export function setActiveTenantHeader(tenantId: string | null) {
  if (tenantId) {
    localStorage.setItem('catering_active_tenant_id', tenantId);
  } else {
    localStorage.removeItem('catering_active_tenant_id');
  }
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const activeTenantId = getActiveTenantHeader();
  if (activeTenantId) {
    headers.set('x-tenant-id', activeTenantId);
  }

  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errData = await response.json();
      if (errData && errData.error) {
        errorMessage = errData.error;
      }
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  // If response is a file download (like CSV)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/csv')) {
    return (await response.blob()) as unknown as T;
  }

  return response.json();
}

export const api = {
  // AUTH
  login: (credentials: { email: string; password: string }) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => request('/auth/me'),

  // PUBLIC CATERING
  getPublicTenant: (slug: string) => request(`/public/tenants/${slug}`),
  getPublicMenus: (slug: string) => request(`/public/tenants/${slug}/menus`),
  lookupCustomer: (slug: string, whatsapp: string) =>
    request(`/public/customer-lookup?slug=${encodeURIComponent(slug)}&whatsapp=${encodeURIComponent(whatsapp)}`),
  placeOrder: (orderData: any) =>
    request('/public/orders', { method: 'POST', body: JSON.stringify(orderData) }),
  getPublicOrder: (orderNumber: string) => request(`/public/orders/${orderNumber}`),

  // TENANTS
  getTenants: () => request('/tenants'),
  createTenant: (data: any) => request('/tenants', { method: 'POST', body: JSON.stringify(data) }),
  updateTenant: (id: string, data: any) => request(`/tenants/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTenant: (id: string) => request(`/tenants/${id}`, { method: 'DELETE' }),

  // MENUS
  getMenus: () => request('/menus'),
  createMenu: (data: any) => request('/menus', { method: 'POST', body: JSON.stringify(data) }),
  updateMenu: (id: string, data: any) => request(`/menus/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMenu: (id: string) => request(`/menus/${id}`, { method: 'DELETE' }),

  // ORDERS
  getOrders: (params?: { status?: string; date?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.date) query.append('date', params.date);
    if (params?.search) query.append('search', params.search);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/orders${queryString}`);
  },
  getOrderById: (id: string) => request(`/orders/${id}`),
  updateOrder: (id: string, data: any) => request(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteOrder: (id: string) => request(`/orders/${id}`, { method: 'DELETE' }),

  // CUSTOMERS
  getCustomers: () => request('/customers'),

  // PAYMENTS
  getPayments: () => request('/payments'),
  createPayment: (data: { orderId: string; amount: number; paymentType: string; paymentMethod: string; notes?: string }) =>
    request('/payments', { method: 'POST', body: JSON.stringify(data) }),

  // PRODUCTION
  getProductionSummary: (date?: string) => {
    const query = date ? `?date=${date}` : '';
    return request(`/production/summary${query}`);
  },
  updateProductionStatus: (data: { date: string; status: string; notes?: string }) =>
    request('/production/status', { method: 'POST', body: JSON.stringify(data) }),

  // INGREDIENTS & RECIPES
  getIngredients: () => request('/ingredients'),
  createIngredient: (data: any) => request('/ingredients', { method: 'POST', body: JSON.stringify(data) }),
  updateIngredient: (id: string, data: any) => request(`/ingredients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteIngredient: (id: string) => request(`/ingredients/${id}`, { method: 'DELETE' }),
  getRecipes: (menuId?: string) => request(`/recipes${menuId ? `?menuId=${menuId}` : ''}`),
  saveRecipes: (menuId: string, items: { ingredientId: string; quantityNeeded: number }[]) =>
    request('/recipes', { method: 'POST', body: JSON.stringify({ menuId, items }) }),

  // DELIVERY
  getDeliveries: (date?: string) => request(`/delivery${date ? `?date=${date}` : ''}`),
  updateDelivery: (orderId: string, data: any) =>
    request(`/delivery/${orderId}`, { method: 'PUT', body: JSON.stringify(data) }),

  // REPORTS
  getReports: () => request('/reports'),
  exportReportsCsvUrl: () => `${API_BASE}/reports/export-csv`,

  // UPLOAD
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await request<{ success: boolean; url: string }>('/upload', {
      method: 'POST',
      body: formData,
    });
    return res.url;
  },
};
