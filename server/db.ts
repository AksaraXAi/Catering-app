import fs from 'fs';
import path from 'path';
import { initialSeedData } from './seed-data.ts';

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'catering_store.json');

// Memory cache
let dbStore: typeof initialSeedData = JSON.parse(JSON.stringify(initialSeedData));

// Ensure data directory and file exist
function initDbStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      if (content && content.trim().length > 0) {
        dbStore = JSON.parse(content);
        // Ensure all top-level keys exist
        for (const key of Object.keys(initialSeedData) as (keyof typeof initialSeedData)[]) {
          if (!dbStore[key]) {
            (dbStore as any)[key] = initialSeedData[key];
          }
        }
        return;
      }
    }
    // Write initial seed data
    fs.writeFileSync(DB_FILE, JSON.stringify(dbStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error initializing dbStore:', err);
  }
}

function saveDbStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(dbStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving dbStore:', err);
  }
}

// Initialize on module load
initDbStore();

export const db = {
  // TENANTS
  getTenants: () => dbStore.tenants,
  getTenantById: (id: string) => dbStore.tenants.find((t) => t.id === id),
  getTenantBySlug: (slug: string) => dbStore.tenants.find((t) => t.slug.toLowerCase() === slug.toLowerCase() && t.active),
  createTenant: (data: any) => {
    const now = new Date().toISOString();
    const newTenant = {
      id: `tenant-${Date.now()}`,
      active: true,
      createdAt: now,
      updatedAt: now,
      ...data,
    };
    dbStore.tenants.push(newTenant);
    saveDbStore();
    return newTenant;
  },
  updateTenant: (id: string, data: any) => {
    const idx = dbStore.tenants.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    dbStore.tenants[idx] = {
      ...dbStore.tenants[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    saveDbStore();
    return dbStore.tenants[idx];
  },
  deleteTenant: (id: string) => {
    const idx = dbStore.tenants.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    dbStore.tenants.splice(idx, 1);
    saveDbStore();
    return true;
  },

  // USERS
  getUserByEmail: (email: string) => dbStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
  getUserById: (id: string) => dbStore.users.find((u) => u.id === id),
  createUser: (data: any) => {
    const now = new Date().toISOString();
    const newUser = {
      id: `user-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      ...data,
    };
    dbStore.users.push(newUser);
    saveDbStore();
    return newUser;
  },

  // MENUS
  getMenus: (tenantId: string, activeOnly: boolean = false) => {
    return dbStore.menus.filter((m) => m.tenantId === tenantId && (!activeOnly || m.active));
  },
  getMenuById: (tenantId: string, id: string) => {
    return dbStore.menus.find((m) => m.tenantId === tenantId && m.id === id);
  },
  createMenu: (tenantId: string, data: any) => {
    const now = new Date().toISOString();
    const newMenu = {
      id: `menu-${Date.now()}`,
      tenantId,
      active: true,
      createdAt: now,
      updatedAt: now,
      ...data,
    };
    dbStore.menus.push(newMenu);
    saveDbStore();
    return newMenu;
  },
  updateMenu: (tenantId: string, id: string, data: any) => {
    const idx = dbStore.menus.findIndex((m) => m.tenantId === tenantId && m.id === id);
    if (idx === -1) return null;
    dbStore.menus[idx] = {
      ...dbStore.menus[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    saveDbStore();
    return dbStore.menus[idx];
  },
  deleteMenu: (tenantId: string, id: string) => {
    const idx = dbStore.menus.findIndex((m) => m.tenantId === tenantId && m.id === id);
    if (idx === -1) return false;
    dbStore.menus.splice(idx, 1);
    // Also remove recipes for this menu
    dbStore.recipes = dbStore.recipes.filter((r) => r.menuId !== id);
    saveDbStore();
    return true;
  },

  // CUSTOMERS
  getCustomers: (tenantId: string) => {
    return dbStore.customers.filter((c) => c.tenantId === tenantId);
  },
  findCustomerByWhatsapp: (tenantId: string, whatsapp: string) => {
    const cleanWA = whatsapp.replace(/[^0-9]/g, '');
    return dbStore.customers.find((c) => c.tenantId === tenantId && c.whatsapp.replace(/[^0-9]/g, '') === cleanWA);
  },
  createOrUpdateCustomer: (tenantId: string, data: { name: string; whatsapp: string; address: string; notes?: string }) => {
    const cleanWA = data.whatsapp.replace(/[^0-9]/g, '');
    const idx = dbStore.customers.findIndex((c) => c.tenantId === tenantId && c.whatsapp.replace(/[^0-9]/g, '') === cleanWA);
    const now = new Date().toISOString();
    if (idx !== -1) {
      dbStore.customers[idx] = {
        ...dbStore.customers[idx],
        name: data.name || dbStore.customers[idx].name,
        address: data.address || dbStore.customers[idx].address,
        notes: data.notes ?? dbStore.customers[idx].notes,
        updatedAt: now,
      };
      saveDbStore();
      return dbStore.customers[idx];
    }
    const newCustomer = {
      id: `cust-${Date.now()}`,
      tenantId,
      name: data.name,
      whatsapp: cleanWA,
      address: data.address,
      notes: data.notes || null,
      createdAt: now,
      updatedAt: now,
    };
    dbStore.customers.push(newCustomer);
    saveDbStore();
    return newCustomer;
  },

  // ORDERS
  getOrders: (tenantId: string, filters?: { status?: string; date?: string; search?: string }) => {
    let orders = dbStore.orders.filter((o) => o.tenantId === tenantId);
    if (filters?.status && filters.status !== 'ALL') {
      orders = orders.filter((o) => o.orderStatus === filters.status);
    }
    if (filters?.date) {
      orders = orders.filter((o) => o.eventDate.startsWith(filters.date!));
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      orders = orders.filter((o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerWhatsapp.includes(q) ||
        o.deliveryAddress.toLowerCase().includes(q)
      );
    }
    // Attach deliveries & payments
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  getOrderById: (tenantId: string, id: string) => {
    const order = dbStore.orders.find((o) => (tenantId === 'ANY' || o.tenantId === tenantId) && o.id === id);
    if (!order) return null;
    const delivery = dbStore.deliveries.find((d) => d.orderId === order.id);
    return { ...order, delivery };
  },
  getOrderByNumber: (orderNumber: string) => {
    const order = dbStore.orders.find((o) => o.orderNumber === orderNumber);
    if (!order) return null;
    const tenant = dbStore.tenants.find((t) => t.id === order.tenantId);
    const delivery = dbStore.deliveries.find((d) => d.orderId === order.id);
    return { ...order, tenant, delivery };
  },
  createOrder: (data: any) => {
    const now = new Date().toISOString();
    const orderId = `order-${Date.now()}`;
    const dateFormatted = now.split('T')[0].replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${dateFormatted}-${randomSuffix}`;

    // Auto-calculate DP (default 50% or explicit)
    const totalAmount = Number(data.totalAmount) || 0;
    const dpAmount = Number(data.dpAmount) || Math.round(totalAmount * 0.5);
    const remainingAmount = Math.max(0, totalAmount - (data.payments?.length ? data.payments.reduce((acc: number, p: any) => acc + (p.amount || 0), 0) : 0));
    
    // Auto-update or create customer
    const customer = db.createOrUpdateCustomer(data.tenantId, {
      name: data.customerName,
      whatsapp: data.customerWhatsapp,
      address: data.deliveryAddress,
      notes: data.notes,
    });

    const items = (data.items || []).map((item: any, i: number) => ({
      id: `item-${Date.now()}-${i}`,
      orderId,
      menuId: item.menuId || null,
      menuName: item.menuName,
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      subtotal: (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0),
      notes: item.notes || '',
    }));

    const newOrder = {
      id: orderId,
      tenantId: data.tenantId,
      customerId: customer.id,
      orderNumber,
      eventDate: data.eventDate.split('T')[0],
      deliveryTime: data.deliveryTime || '11:00',
      deliveryAddress: data.deliveryAddress,
      customerName: data.customerName,
      customerWhatsapp: data.customerWhatsapp.replace(/[^0-9]/g, ''),
      notes: data.notes || null,
      totalAmount,
      dpAmount,
      remainingAmount,
      paymentStatus: 'UNPAID' as const,
      orderStatus: 'NEW' as const,
      createdAt: now,
      updatedAt: now,
      items,
      payments: [],
    };

    dbStore.orders.unshift(newOrder);

    // Create automatic delivery record
    const deliveryRecord = {
      id: `deliv-${Date.now()}`,
      tenantId: data.tenantId,
      orderId: newOrder.id,
      driverName: null,
      driverPhone: null,
      status: 'PENDING' as const,
      deliveryTime: data.deliveryTime || '11:00',
      notes: null,
      createdAt: now,
      updatedAt: now,
    };
    dbStore.deliveries.push(deliveryRecord);

    saveDbStore();
    return { ...newOrder, delivery: deliveryRecord };
  },
  updateOrder: (tenantId: string, id: string, data: any) => {
    const idx = dbStore.orders.findIndex((o) => o.tenantId === tenantId && o.id === id);
    if (idx === -1) return null;
    const existing = dbStore.orders[idx];

    // Re-calculate remaining if total or payments change
    const updatedTotal = data.totalAmount !== undefined ? Number(data.totalAmount) : existing.totalAmount;
    const paidAmount = (existing.payments || []).reduce((sum, p) => sum + p.amount, 0);
    const updatedRemaining = Math.max(0, updatedTotal - paidAmount);
    let updatedPaymentStatus = existing.paymentStatus;
    if (paidAmount >= updatedTotal && updatedTotal > 0) {
      updatedPaymentStatus = 'PAID';
    } else if (paidAmount > 0) {
      updatedPaymentStatus = 'DP';
    } else {
      updatedPaymentStatus = 'UNPAID';
    }

    dbStore.orders[idx] = {
      ...existing,
      ...data,
      totalAmount: updatedTotal,
      remainingAmount: updatedRemaining,
      paymentStatus: data.paymentStatus || updatedPaymentStatus,
      updatedAt: new Date().toISOString(),
    };
    saveDbStore();
    return dbStore.orders[idx];
  },
  deleteOrder: (tenantId: string, id: string) => {
    const idx = dbStore.orders.findIndex((o) => o.tenantId === tenantId && o.id === id);
    if (idx === -1) return false;
    dbStore.orders.splice(idx, 1);
    dbStore.deliveries = dbStore.deliveries.filter((d) => d.orderId !== id);
    dbStore.payments = dbStore.payments.filter((p) => p.orderId !== id);
    saveDbStore();
    return true;
  },

  // PAYMENTS
  getPayments: (tenantId: string) => {
    return dbStore.payments.filter((p) => p.tenantId === tenantId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  createPayment: (tenantId: string, data: { orderId: string; amount: number; paymentType: string; paymentMethod: string; paymentProofUrl?: string; notes?: string }) => {
    const now = new Date().toISOString();
    const order = dbStore.orders.find((o) => o.tenantId === tenantId && o.id === data.orderId);
    if (!order) return null;

    const newPayment = {
      id: `pay-${Date.now()}`,
      tenantId,
      orderId: data.orderId,
      amount: Number(data.amount),
      paymentType: data.paymentType,
      paymentMethod: data.paymentMethod,
      paymentProofUrl: data.paymentProofUrl || null,
      notes: data.notes || null,
      createdAt: now,
    };

    if (!order.payments) order.payments = [];
    order.payments.push(newPayment);
    dbStore.payments.unshift(newPayment);

    // Recalculate order payment totals
    const totalPaid = order.payments.reduce((acc, p) => acc + p.amount, 0);
    order.remainingAmount = Math.max(0, order.totalAmount - totalPaid);
    if (totalPaid >= order.totalAmount) {
      order.paymentStatus = 'PAID';
    } else if (totalPaid > 0) {
      order.paymentStatus = 'DP';
    }
    order.updatedAt = now;

    saveDbStore();
    return { payment: newPayment, order };
  },

  // INGREDIENTS
  getIngredients: (tenantId: string) => {
    return dbStore.ingredients.filter((i) => i.tenantId === tenantId);
  },
  createIngredient: (tenantId: string, data: any) => {
    const now = new Date().toISOString();
    const newIngredient = {
      id: `ing-${Date.now()}`,
      tenantId,
      stock: Number(data.stock) || 0,
      minimumStock: Number(data.minimumStock) || 0,
      costPerUnit: Number(data.costPerUnit) || 0,
      createdAt: now,
      updatedAt: now,
      ...data,
    };
    dbStore.ingredients.push(newIngredient);
    saveDbStore();
    return newIngredient;
  },
  updateIngredient: (tenantId: string, id: string, data: any) => {
    const idx = dbStore.ingredients.findIndex((i) => i.tenantId === tenantId && i.id === id);
    if (idx === -1) return null;
    dbStore.ingredients[idx] = {
      ...dbStore.ingredients[idx],
      ...data,
      stock: data.stock !== undefined ? Number(data.stock) : dbStore.ingredients[idx].stock,
      minimumStock: data.minimumStock !== undefined ? Number(data.minimumStock) : dbStore.ingredients[idx].minimumStock,
      costPerUnit: data.costPerUnit !== undefined ? Number(data.costPerUnit) : dbStore.ingredients[idx].costPerUnit,
      updatedAt: new Date().toISOString(),
    };
    saveDbStore();
    return dbStore.ingredients[idx];
  },
  deleteIngredient: (tenantId: string, id: string) => {
    const idx = dbStore.ingredients.findIndex((i) => i.tenantId === tenantId && i.id === id);
    if (idx === -1) return false;
    dbStore.ingredients.splice(idx, 1);
    dbStore.recipes = dbStore.recipes.filter((r) => r.ingredientId !== id);
    saveDbStore();
    return true;
  },

  // RECIPES
  getRecipes: (tenantId: string, menuId?: string) => {
    if (menuId) {
      return dbStore.recipes.filter((r) => r.tenantId === tenantId && r.menuId === menuId);
    }
    return dbStore.recipes.filter((r) => r.tenantId === tenantId);
  },
  saveRecipesForMenu: (tenantId: string, menuId: string, recipeItems: { ingredientId: string; quantityNeeded: number }[]) => {
    // Remove existing recipes for this menu
    dbStore.recipes = dbStore.recipes.filter((r) => !(r.tenantId === tenantId && r.menuId === menuId));
    // Add new
    for (const item of recipeItems) {
      dbStore.recipes.push({
        id: `rec-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        tenantId,
        menuId,
        ingredientId: item.ingredientId,
        quantityNeeded: Number(item.quantityNeeded),
      });
    }
    saveDbStore();
    return db.getRecipes(tenantId, menuId);
  },

  // PRODUKSI & KALKULASI BAHAN
  getProductionDailySummary: (tenantId: string, targetDate?: string) => {
    const dateQuery = targetDate || new Date().toISOString().split('T')[0];
    const matchingOrders = dbStore.orders.filter(
      (o) => o.tenantId === tenantId && o.eventDate.startsWith(dateQuery) && o.orderStatus !== 'CANCELLED'
    );

    // Aggregate boxes per menu
    const menuPortions: Record<string, { menuId: string; menuName: string; quantity: number }> = {};
    let totalBoxes = 0;

    for (const ord of matchingOrders) {
      for (const item of ord.items || []) {
        totalBoxes += item.quantity;
        const key = item.menuId || item.menuName;
        if (!menuPortions[key]) {
          menuPortions[key] = {
            menuId: item.menuId || '',
            menuName: item.menuName,
            quantity: 0,
          };
        }
        menuPortions[key].quantity += item.quantity;
      }
    }

    // Get production record if exists
    let production = dbStore.productions.find((p) => p.tenantId === tenantId && p.date.startsWith(dateQuery));
    if (!production) {
      production = {
        id: `prod-${Date.now()}`,
        tenantId,
        date: dateQuery,
        status: 'PENDING',
        totalBoxes,
        notes: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dbStore.productions.push(production);
      saveDbStore();
    } else {
      production.totalBoxes = totalBoxes;
    }

    // Calculate Ingredients Requirement for this day based on recipes
    const ingredientRequirements: Record<
      string,
      {
        ingredientId: string;
        name: string;
        unit: string;
        stock: number;
        required: number;
        deficit: number;
        toBuy: number;
        costPerUnit: number;
        estimatedCost: number;
      }
    > = {};

    const allIngredients = dbStore.ingredients.filter((i) => i.tenantId === tenantId);
    const ingredientMap = new Map(allIngredients.map((i) => [i.id, i]));

    for (const item of Object.values(menuPortions)) {
      if (!item.menuId) continue;
      const recipes = dbStore.recipes.filter((r) => r.tenantId === tenantId && r.menuId === item.menuId);
      for (const rec of recipes) {
        const ing = ingredientMap.get(rec.ingredientId);
        if (!ing) continue;
        const requiredQty = rec.quantityNeeded * item.quantity;
        if (!ingredientRequirements[ing.id]) {
          ingredientRequirements[ing.id] = {
            ingredientId: ing.id,
            name: ing.name,
            unit: ing.unit,
            stock: ing.stock,
            required: 0,
            deficit: 0,
            toBuy: 0,
            costPerUnit: ing.costPerUnit,
            estimatedCost: 0,
          };
        }
        ingredientRequirements[ing.id].required += requiredQty;
      }
    }

    // Compute deficit and cost
    const ingredientList = Object.values(ingredientRequirements).map((item) => {
      const deficit = Math.max(0, item.required - item.stock);
      const toBuy = deficit > 0 ? Number(deficit.toFixed(2)) : 0;
      const estimatedCost = toBuy * item.costPerUnit;
      return {
        ...item,
        required: Number(item.required.toFixed(2)),
        deficit: Number(deficit.toFixed(2)),
        toBuy,
        estimatedCost,
      };
    });

    return {
      date: dateQuery,
      totalOrders: matchingOrders.length,
      totalBoxes,
      production,
      menuBreakdown: Object.values(menuPortions),
      ingredientRequirements: ingredientList,
    };
  },

  updateProductionStatus: (tenantId: string, date: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED', notes?: string) => {
    let prod = dbStore.productions.find((p) => p.tenantId === tenantId && p.date.startsWith(date));
    const now = new Date().toISOString();
    if (!prod) {
      prod = {
        id: `prod-${Date.now()}`,
        tenantId,
        date,
        status,
        totalBoxes: 0,
        notes: notes || null,
        createdAt: now,
        updatedAt: now,
      };
      dbStore.productions.push(prod);
    } else {
      prod.status = status;
      if (notes !== undefined) prod.notes = notes;
      prod.updatedAt = now;
    }
    saveDbStore();
    return prod;
  },

  // DELIVERIES
  getDeliveries: (tenantId: string, targetDate?: string) => {
    const orders = dbStore.orders.filter((o) => {
      if (o.tenantId !== tenantId) return false;
      if (targetDate && !o.eventDate.startsWith(targetDate)) return false;
      return o.orderStatus !== 'CANCELLED';
    });

    return orders.map((ord) => {
      let delivery = dbStore.deliveries.find((d) => d.orderId === ord.id);
      if (!delivery) {
        delivery = {
          id: `deliv-${Date.now()}-${ord.id}`,
          tenantId,
          orderId: ord.id,
          driverName: null,
          driverPhone: null,
          status: 'PENDING',
          deliveryTime: ord.deliveryTime,
          notes: null,
          createdAt: ord.createdAt,
          updatedAt: ord.updatedAt,
        };
        dbStore.deliveries.push(delivery);
        saveDbStore();
      }
      return {
        order: ord,
        delivery,
      };
    });
  },

  updateDelivery: (tenantId: string, orderId: string, data: any) => {
    let delivery = dbStore.deliveries.find((d) => d.tenantId === tenantId && d.orderId === orderId);
    const now = new Date().toISOString();
    if (!delivery) {
      delivery = {
        id: `deliv-${Date.now()}`,
        tenantId,
        orderId,
        driverName: data.driverName || null,
        driverPhone: data.driverPhone || null,
        status: data.status || 'PENDING',
        deliveryTime: data.deliveryTime || null,
        notes: data.notes || null,
        createdAt: now,
        updatedAt: now,
      };
      dbStore.deliveries.push(delivery);
    } else {
      delivery.driverName = data.driverName ?? delivery.driverName;
      delivery.driverPhone = data.driverPhone ?? delivery.driverPhone;
      delivery.status = data.status ?? delivery.status;
      delivery.deliveryTime = data.deliveryTime ?? delivery.deliveryTime;
      delivery.notes = data.notes ?? delivery.notes;
      delivery.updatedAt = now;
    }

    // Sync with order status if delivery completed
    const order = dbStore.orders.find((o) => o.id === orderId);
    if (order) {
      if (delivery.status === 'DELIVERED') {
        order.orderStatus = 'DELIVERED';
      } else if (delivery.status === 'ON_THE_WAY') {
        order.orderStatus = 'DELIVERED';
      }
    }

    saveDbStore();
    return delivery;
  },

  // REPORTS & ANALYTICS
  getReports: (tenantId: string) => {
    const orders = dbStore.orders.filter((o) => o.tenantId === tenantId && o.orderStatus !== 'CANCELLED');
    const payments = dbStore.payments.filter((p) => p.tenantId === tenantId);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Calculate daily, weekly, monthly omzet
    let omzetHariIni = 0;
    let omzetMingguIni = 0;
    let omzetBulanIni = 0;
    let totalOmzet = 0;
    let totalPiutang = 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Menu popularity
    const menuCountMap: Record<string, { name: string; portions: number; totalSales: number }> = {};

    for (const ord of orders) {
      totalOmzet += ord.totalAmount;
      totalPiutang += ord.remainingAmount;

      const ordDate = new Date(ord.eventDate);
      if (ord.eventDate.startsWith(todayStr)) {
        omzetHariIni += ord.totalAmount;
      }
      if (ordDate >= sevenDaysAgo && ordDate <= now) {
        omzetMingguIni += ord.totalAmount;
      }
      if (ordDate.getMonth() === currentMonth && ordDate.getFullYear() === currentYear) {
        omzetBulanIni += ord.totalAmount;
      }

      for (const item of ord.items || []) {
        const key = item.menuName;
        if (!menuCountMap[key]) {
          menuCountMap[key] = { name: item.menuName, portions: 0, totalSales: 0 };
        }
        menuCountMap[key].portions += item.quantity;
        menuCountMap[key].totalSales += item.subtotal;
      }
    }

    const popularMenus = Object.values(menuCountMap).sort((a, b) => b.portions - a.portions);

    // Orders by status
    const statusCounts = {
      NEW: orders.filter((o) => o.orderStatus === 'NEW').length,
      CONFIRMED: orders.filter((o) => o.orderStatus === 'CONFIRMED').length,
      IN_PROGRESS: orders.filter((o) => o.orderStatus === 'IN_PROGRESS').length,
      READY: orders.filter((o) => o.orderStatus === 'READY').length,
      DELIVERED: orders.filter((o) => o.orderStatus === 'DELIVERED').length,
      COMPLETED: orders.filter((o) => o.orderStatus === 'COMPLETED').length,
      CANCELLED: dbStore.orders.filter((o) => o.tenantId === tenantId && o.orderStatus === 'CANCELLED').length,
    };

    return {
      totalOrders: orders.length,
      omzetHariIni,
      omzetMingguIni,
      omzetBulanIni,
      totalOmzet,
      totalPiutang,
      popularMenus,
      statusCounts,
      paymentSummary: {
        totalReceived: payments.reduce((sum, p) => sum + p.amount, 0),
        count: payments.length,
      },
    };
  },
};
