export type Role = 'SUPER_ADMIN' | 'OWNER' | 'STAFF';

export type OrderStatus =
  | 'NEW'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'READY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentStatus = 'UNPAID' | 'DP' | 'PAID';

export type ProductionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export type DeliveryStatus = 'PENDING' | 'ON_THE_WAY' | 'DELIVERED';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  whatsapp: string;
  address: string | null;
  bankInfo: string | null;
  colorTheme?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  tenantId: string | null;
  tenant?: Tenant | null;
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  whatsapp: string;
  address: string;
  notes?: string | null;
  totalOrders?: number;
  totalSpent?: number;
  orders?: {
    id: string;
    orderNumber: string;
    eventDate: string;
    totalAmount: number;
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  imageUrl: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuId: string | null;
  menuName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  orderId: string;
  orderNumber?: string;
  customerName?: string;
  totalAmount?: number;
  remainingAmount?: number;
  amount: number;
  paymentType: string;
  paymentMethod: string;
  paymentProofUrl?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface Delivery {
  id: string;
  tenantId: string;
  orderId: string;
  driverName: string | null;
  driverPhone: string | null;
  status: DeliveryStatus;
  deliveryTime: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  tenantId: string;
  customerId?: string | null;
  orderNumber: string;
  eventDate: string;
  deliveryTime: string;
  deliveryAddress: string;
  customerName: string;
  customerWhatsapp: string;
  notes?: string | null;
  totalAmount: number;
  dpAmount: number;
  remainingAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  payments?: Payment[];
  delivery?: Delivery | null;
  tenant?: Tenant;
}

export interface Ingredient {
  id: string;
  tenantId: string;
  name: string;
  unit: string;
  stock: number;
  minimumStock: number;
  costPerUnit: number;
  createdAt: string;
  updatedAt: string;
}

export interface Recipe {
  id: string;
  tenantId: string;
  menuId: string;
  ingredientId: string;
  quantityNeeded: number;
  ingredient?: Ingredient | null;
}

export interface ProductionSummary {
  date: string;
  totalOrders: number;
  totalBoxes: number;
  production: {
    id: string;
    tenantId: string;
    date: string;
    status: ProductionStatus;
    totalBoxes: number;
    notes: string | null;
  };
  menuBreakdown: {
    menuId: string;
    menuName: string;
    quantity: number;
  }[];
  ingredientRequirements: {
    ingredientId: string;
    name: string;
    unit: string;
    stock: number;
    required: number;
    deficit: number;
    toBuy: number;
    costPerUnit: number;
    estimatedCost: number;
  }[];
}

export interface ReportsData {
  totalOrders: number;
  omzetHariIni: number;
  omzetMingguIni: number;
  omzetBulanIni: number;
  totalOmzet: number;
  totalPiutang: number;
  popularMenus: {
    name: string;
    portions: number;
    totalSales: number;
  }[];
  statusCounts: Record<OrderStatus, number>;
  paymentSummary: {
    totalReceived: number;
    count: number;
  };
}
