export interface DemoTenant {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string;
  whatsapp: string;
  address: string;
  bankInfo: string;
  colorTheme: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DemoUser {
  id: string;
  tenantId: string | null;
  email: string;
  password: string; // bcrypt hash or plaintext check
  name: string;
  role: 'SUPER_ADMIN' | 'OWNER' | 'STAFF';
  createdAt: string;
  updatedAt: string;
}

export interface DemoCustomer {
  id: string;
  tenantId: string;
  name: string;
  whatsapp: string;
  address: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DemoMenu {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DemoOrderItem {
  id: string;
  orderId: string;
  menuId: string | null;
  menuName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
}

export interface DemoPayment {
  id: string;
  tenantId: string;
  orderId: string;
  amount: number;
  paymentType: string; // DP, PELUNASAN, ANGSURAN
  paymentMethod: string;
  paymentProofUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface DemoOrder {
  id: string;
  tenantId: string;
  customerId: string | null;
  orderNumber: string;
  eventDate: string; // YYYY-MM-DD
  deliveryTime: string; // HH:mm
  deliveryAddress: string;
  customerName: string;
  customerWhatsapp: string;
  notes: string | null;
  totalAmount: number;
  dpAmount: number;
  remainingAmount: number;
  paymentStatus: 'UNPAID' | 'DP' | 'PAID';
  orderStatus: 'NEW' | 'CONFIRMED' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  items?: DemoOrderItem[];
  payments?: DemoPayment[];
}

export interface DemoIngredient {
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

export interface DemoRecipe {
  id: string;
  tenantId: string;
  menuId: string;
  ingredientId: string;
  quantityNeeded: number;
}

export interface DemoDelivery {
  id: string;
  tenantId: string;
  orderId: string;
  driverName: string | null;
  driverPhone: string | null;
  status: 'PENDING' | 'ON_THE_WAY' | 'DELIVERED';
  deliveryTime: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

const nowStr = new Date().toISOString();
const today = new Date().toISOString().split('T')[0];

const tomorrowDate = new Date();
tomorrowDate.setDate(tomorrowDate.getDate() + 1);
const tomorrow = tomorrowDate.toISOString().split('T')[0];

const nextWeekDate = new Date();
nextWeekDate.setDate(nextWeekDate.getDate() + 3);
const nextWeek = nextWeekDate.toISOString().split('T')[0];

export const initialSeedData = {
  tenants: [
    {
      id: 'tenant-busiti-001',
      name: 'Catering Bu Siti',
      slug: 'busiti',
      logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
      description: 'Spesialis hidangan lezat, higienis, dan halal untuk acara hajatan, syukuran keluarga, rapat kantor, dan resepsi di Yogyakarta & sekitarnya.',
      whatsapp: '6281234567890',
      address: 'Jl. Malioboro No. 45, Danurejan, Kota Yogyakarta, D.I. Yogyakarta 55213',
      bankInfo: 'Bank BCA: 8690123456 a/n Siti Aminah | Bank Mandiri: 137000987654 a/n Siti Aminah',
      colorTheme: '#10B981',
      active: true,
      createdAt: nowStr,
      updatedAt: nowStr,
    },
    {
      id: 'tenant-sedaprasa-002',
      name: 'Sedap Rasa Nusantara',
      slug: 'sedaprasa',
      logo: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80',
      description: 'Katering harian, nasi tumpeng, dan prasmanan cita rasa nusantara otentik dengan racikan rempah pilihan.',
      whatsapp: '6285678901234',
      address: 'Jl. Kaliurang KM 7, Sleman, Yogyakarta',
      bankInfo: 'Bank BNI: 023456789 a/n Budi Wicaksono',
      colorTheme: '#F59E0B',
      active: true,
      createdAt: nowStr,
      updatedAt: nowStr,
    }
  ] as DemoTenant[],

  users: [
    {
      id: 'user-superadmin-001',
      tenantId: null,
      email: 'admin@cateringapp.com',
      password: '$2a$10$w857Zp9.oO62y/W7xI.6vO9Uo8zVq9uYVqD9r7sXj6B6Nn6d6Dk1S', // password123
      name: 'Super Admin CateringApp',
      role: 'SUPER_ADMIN',
      createdAt: nowStr,
      updatedAt: nowStr,
    },
    {
      id: 'user-owner-busiti',
      tenantId: 'tenant-busiti-001',
      email: 'busiti@catering.com',
      password: '$2a$10$w857Zp9.oO62y/W7xI.6vO9Uo8zVq9uYVqD9r7sXj6B6Nn6d6Dk1S', // password123
      name: 'Ibu Siti Aminah',
      role: 'OWNER',
      createdAt: nowStr,
      updatedAt: nowStr,
    },
  ] as DemoUser[],

  menus: [
    {
      id: 'menu-001',
      tenantId: 'tenant-busiti-001',
      name: 'Nasi Box Hemat',
      description: 'Nasi putih pulen, ayam goreng lengkuas gurih, sambal goreng kentang ati, oseng buncis wortel, kerupuk udang renyah, dan sambal terasi khas Bu Siti.',
      price: 22000,
      category: 'Nasi Box',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      active: true,
      createdAt: nowStr,
      updatedAt: nowStr,
    },
    {
      id: 'menu-002',
      tenantId: 'tenant-busiti-001',
      name: 'Nasi Box Premium',
      description: 'Nasi liwet wangi daun salam, ayam bakar bumbu rujak madu, udang krispi saus tiram, telur balado utuh, capcay sayur segar, kerupuk, pisang raja, dan puding susu.',
      price: 35000,
      category: 'Nasi Box',
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
      active: true,
      createdAt: nowStr,
      updatedAt: nowStr,
    },
    {
      id: 'menu-003',
      tenantId: 'tenant-busiti-001',
      name: 'Snack Box Tradisional & Modern',
      description: 'Paket 3 kue favorit: Lemper ayam bakar pulen, Risoles mayo smoke beef gurih, Pie buah segar, dilengkapi air mineral cup 240ml.',
      price: 15000,
      category: 'Snack Box',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      active: true,
      createdAt: nowStr,
      updatedAt: nowStr,
    },
    {
      id: 'menu-004',
      tenantId: 'tenant-busiti-001',
      name: 'Paket Hajatan & Kenduri Komplit',
      description: 'Nasi kuning wangi / nasi uduk, rendang daging sapi empuk bumbu Padang, ayam ungkep rempah, sambal goreng krecek gurih, perkedel kentang, serundeng manis, dan lalapan.',
      price: 45000,
      category: 'Paket Hajatan',
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
      active: true,
      createdAt: nowStr,
      updatedAt: nowStr,
    },
    {
      id: 'menu-005',
      tenantId: 'tenant-busiti-001',
      name: 'Paket Prasmanan Mewah',
      description: 'Paket lengkap prasmanan (min. 50 porsi): Sup kimlo / iga sapi, rolade sapi jamur, kakap asam manis renyah, ayam rica, karedok / salad buah, dan es kelapa muda.',
      price: 65000,
      category: 'Paket Prasmanan',
      imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80',
      active: true,
      createdAt: nowStr,
      updatedAt: nowStr,
    }
  ] as DemoMenu[],

  customers: [
    {
      id: 'cust-001',
      tenantId: 'tenant-busiti-001',
      name: 'Budi Santoso',
      whatsapp: '6281399887766',
      address: 'Gedung Grha Sabha Pramana UGM, Sekip Bulaksumur, Yogyakarta',
      notes: 'Sering pesan untuk seminar kampus & rapat dosen',
      createdAt: nowStr,
      updatedAt: nowStr,
    },
    {
      id: 'cust-002',
      tenantId: 'tenant-busiti-001',
      name: 'Ibu Rina Indrawati',
      whatsapp: '6285711223344',
      address: 'Perumahan Casa Grande No. B-12, Ring Road Utara, Sleman',
      notes: 'Langganan syukuran keluarga, minta sambal dipisah per wadah',
      createdAt: nowStr,
      updatedAt: nowStr,
    },
    {
      id: 'cust-003',
      tenantId: 'tenant-busiti-001',
      name: 'PT Digital Solusi (Bpk Hendra)',
      whatsapp: '6281809001122',
      address: 'Jalan Gejayan No. 88 Lantai 3, Sleman, DIY',
      notes: 'Makan siang karyawan meeting bulanan',
      createdAt: nowStr,
      updatedAt: nowStr,
    },
  ] as DemoCustomer[],

  orders: [
    {
      id: 'order-001',
      tenantId: 'tenant-busiti-001',
      customerId: 'cust-001',
      orderNumber: 'ORD-20260902-001',
      eventDate: today,
      deliveryTime: '11:00',
      deliveryAddress: 'Gedung Grha Sabha Pramana UGM, Sekip Bulaksumur, Sleman',
      customerName: 'Budi Santoso',
      customerWhatsapp: '6281399887766',
      notes: 'Tolong antar tepat jam 11:00 WIB di pintu barat Hall A lantai 2.',
      totalAmount: 2200000,
      dpAmount: 1100000,
      remainingAmount: 1100000,
      paymentStatus: 'DP',
      orderStatus: 'IN_PROGRESS',
      createdAt: nowStr,
      updatedAt: nowStr,
      items: [
        {
          id: 'item-001',
          orderId: 'order-001',
          menuId: 'menu-001',
          menuName: 'Nasi Box Hemat',
          quantity: 100,
          unitPrice: 22000,
          subtotal: 2200000,
          notes: 'Box standar cokelat ramah lingkungan',
        }
      ],
      payments: [
        {
          id: 'pay-001',
          tenantId: 'tenant-busiti-001',
          orderId: 'order-001',
          amount: 1100000,
          paymentType: 'DP',
          paymentMethod: 'Transfer BCA',
          paymentProofUrl: null,
          notes: 'Uang Muka 50% diterima via BCA Bu Siti',
          createdAt: nowStr,
        }
      ]
    },
    {
      id: 'order-002',
      tenantId: 'tenant-busiti-001',
      customerId: 'cust-002',
      orderNumber: 'ORD-20260903-002',
      eventDate: tomorrow,
      deliveryTime: '10:00',
      deliveryAddress: 'Perumahan Casa Grande No. B-12, Ring Road Utara, Sleman',
      customerName: 'Ibu Rina Indrawati',
      customerWhatsapp: '6285711223344',
      notes: 'Sambal minta dipisah per porsi box, sertakan sendok & tisu higienis.',
      totalAmount: 3500000,
      dpAmount: 3500000,
      remainingAmount: 0,
      paymentStatus: 'PAID',
      orderStatus: 'CONFIRMED',
      createdAt: nowStr,
      updatedAt: nowStr,
      items: [
        {
          id: 'item-002',
          orderId: 'order-002',
          menuId: 'menu-002',
          menuName: 'Nasi Box Premium',
          quantity: 100,
          unitPrice: 35000,
          subtotal: 3500000,
        }
      ],
      payments: [
        {
          id: 'pay-002',
          tenantId: 'tenant-busiti-001',
          orderId: 'order-002',
          amount: 3500000,
          paymentType: 'PELUNASAN',
          paymentMethod: 'Transfer Mandiri',
          paymentProofUrl: null,
          notes: 'Pembayaran Lunas 100%',
          createdAt: nowStr,
        }
      ]
    },
    {
      id: 'order-003',
      tenantId: 'tenant-busiti-001',
      customerId: 'cust-003',
      orderNumber: 'ORD-20260903-003',
      eventDate: tomorrow,
      deliveryTime: '13:00',
      deliveryAddress: 'Jalan Gejayan No. 88 Lantai 3, Sleman, DIY',
      customerName: 'PT Digital Solusi (Bpk Hendra)',
      customerWhatsapp: '6281809001122',
      notes: 'Meeting direksi & makan siang divisi engineering.',
      totalAmount: 3000000,
      dpAmount: 1500000,
      remainingAmount: 1500000,
      paymentStatus: 'DP',
      orderStatus: 'CONFIRMED',
      createdAt: nowStr,
      updatedAt: nowStr,
      items: [
        {
          id: 'item-003',
          orderId: 'order-003',
          menuId: 'menu-003',
          menuName: 'Snack Box Tradisional & Modern',
          quantity: 200,
          unitPrice: 15000,
          subtotal: 3000000,
        }
      ],
      payments: [
        {
          id: 'pay-003',
          tenantId: 'tenant-busiti-001',
          orderId: 'order-003',
          amount: 1500000,
          paymentType: 'DP',
          paymentMethod: 'Transfer BCA',
          paymentProofUrl: null,
          notes: 'DP 50% via BCA Corporate',
          createdAt: nowStr,
        }
      ]
    },
    {
      id: 'order-004',
      tenantId: 'tenant-busiti-001',
      customerId: 'cust-001',
      orderNumber: 'ORD-20260905-004',
      eventDate: nextWeek,
      deliveryTime: '12:00',
      deliveryAddress: 'Fakultas Teknik UGM, Jl. Grafika No. 2, Yogyakarta',
      customerName: 'Budi Santoso',
      customerWhatsapp: '6281399887766',
      notes: 'Acara syukuran wisuda mahasiswa bimbingan',
      totalAmount: 4500000,
      dpAmount: 0,
      remainingAmount: 4500000,
      paymentStatus: 'UNPAID',
      orderStatus: 'NEW',
      createdAt: nowStr,
      updatedAt: nowStr,
      items: [
        {
          id: 'item-004',
          orderId: 'order-004',
          menuId: 'menu-004',
          menuName: 'Paket Hajatan & Kenduri Komplit',
          quantity: 100,
          unitPrice: 45000,
          subtotal: 4500000,
        }
      ],
      payments: []
    }
  ] as DemoOrder[],

  ingredients: [
    { id: 'ing-001', tenantId: 'tenant-busiti-001', name: 'Beras Pulen Premium', unit: 'kg', stock: 150, minimumStock: 50, costPerUnit: 15000, createdAt: nowStr, updatedAt: nowStr },
    { id: 'ing-002', tenantId: 'tenant-busiti-001', name: 'Daging Ayam Segar', unit: 'kg', stock: 80, minimumStock: 30, costPerUnit: 36000, createdAt: nowStr, updatedAt: nowStr },
    { id: 'ing-003', tenantId: 'tenant-busiti-001', name: 'Daging Sapi Paha/Gandik', unit: 'kg', stock: 25, minimumStock: 15, costPerUnit: 125000, createdAt: nowStr, updatedAt: nowStr },
    { id: 'ing-004', tenantId: 'tenant-busiti-001', name: 'Telur Ayam Negeri', unit: 'butir', stock: 400, minimumStock: 100, costPerUnit: 2000, createdAt: nowStr, updatedAt: nowStr },
    { id: 'ing-005', tenantId: 'tenant-busiti-001', name: 'Minyak Goreng Sawit', unit: 'liter', stock: 50, minimumStock: 20, costPerUnit: 18000, createdAt: nowStr, updatedAt: nowStr },
    { id: 'ing-006', tenantId: 'tenant-busiti-001', name: 'Kentang Dieng', unit: 'kg', stock: 40, minimumStock: 15, costPerUnit: 16000, createdAt: nowStr, updatedAt: nowStr },
    { id: 'ing-007', tenantId: 'tenant-busiti-001', name: 'Bawang Merah & Putih', unit: 'kg', stock: 20, minimumStock: 10, costPerUnit: 35000, createdAt: nowStr, updatedAt: nowStr },
    { id: 'ing-008', tenantId: 'tenant-busiti-001', name: 'Box Bento Kraft Ramah Lingkungan', unit: 'buah', stock: 500, minimumStock: 200, costPerUnit: 2500, createdAt: nowStr, updatedAt: nowStr },
  ] as DemoIngredient[],

  recipes: [
    // Nasi Box Hemat (menu-001) per 1 porsi: Beras 0.1 kg, Ayam 0.15 kg, Telur 1 butir, Box Bento 1 buah
    { id: 'rec-001', tenantId: 'tenant-busiti-001', menuId: 'menu-001', ingredientId: 'ing-001', quantityNeeded: 0.1 },
    { id: 'rec-002', tenantId: 'tenant-busiti-001', menuId: 'menu-001', ingredientId: 'ing-002', quantityNeeded: 0.15 },
    { id: 'rec-003', tenantId: 'tenant-busiti-001', menuId: 'menu-001', ingredientId: 'ing-004', quantityNeeded: 1 },
    { id: 'rec-004', tenantId: 'tenant-busiti-001', menuId: 'menu-001', ingredientId: 'ing-008', quantityNeeded: 1 },

    // Nasi Box Premium (menu-002) per 1 porsi: Beras 0.12 kg, Ayam 0.2 kg, Telur 1 butir, Box Bento 1 buah
    { id: 'rec-005', tenantId: 'tenant-busiti-001', menuId: 'menu-002', ingredientId: 'ing-001', quantityNeeded: 0.12 },
    { id: 'rec-006', tenantId: 'tenant-busiti-001', menuId: 'menu-002', ingredientId: 'ing-002', quantityNeeded: 0.2 },
    { id: 'rec-007', tenantId: 'tenant-busiti-001', menuId: 'menu-002', ingredientId: 'ing-004', quantityNeeded: 1 },
    { id: 'rec-008', tenantId: 'tenant-busiti-001', menuId: 'menu-002', ingredientId: 'ing-008', quantityNeeded: 1 },

    // Paket Hajatan (menu-004) per 1 porsi: Beras 0.12 kg, Daging Sapi 0.15 kg, Daging Ayam 0.1 kg, Box Bento 1 buah
    { id: 'rec-009', tenantId: 'tenant-busiti-001', menuId: 'menu-004', ingredientId: 'ing-001', quantityNeeded: 0.12 },
    { id: 'rec-010', tenantId: 'tenant-busiti-001', menuId: 'menu-004', ingredientId: 'ing-003', quantityNeeded: 0.15 },
    { id: 'rec-011', tenantId: 'tenant-busiti-001', menuId: 'menu-004', ingredientId: 'ing-002', quantityNeeded: 0.1 },
    { id: 'rec-012', tenantId: 'tenant-busiti-001', menuId: 'menu-004', ingredientId: 'ing-008', quantityNeeded: 1 },
  ] as DemoRecipe[],

  deliveries: [
    {
      id: 'deliv-001',
      tenantId: 'tenant-busiti-001',
      orderId: 'order-001',
      driverName: 'Pak Joko (Driver Katering)',
      driverPhone: '6281299001122',
      status: 'ON_THE_WAY',
      deliveryTime: '11:00',
      notes: 'Pakai armada mobil box pendingin AB 1234 XY',
      createdAt: nowStr,
      updatedAt: nowStr,
    },
    {
      id: 'deliv-002',
      tenantId: 'tenant-busiti-001',
      orderId: 'order-002',
      driverName: 'Pak Wahyu',
      driverPhone: '6285600112233',
      status: 'PENDING',
      deliveryTime: '10:00',
      notes: 'Siapkan nota rangkap 2',
      createdAt: nowStr,
      updatedAt: nowStr,
    },
    {
      id: 'deliv-003',
      tenantId: 'tenant-busiti-001',
      orderId: 'order-003',
      driverName: 'Pak Joko (Driver Katering)',
      driverPhone: '6281299001122',
      status: 'PENDING',
      deliveryTime: '13:00',
      notes: 'Masuk lewat loading dock basement',
      createdAt: nowStr,
      updatedAt: nowStr,
    }
  ] as DemoDelivery[],

  payments: [
    {
      id: 'pay-001',
      tenantId: 'tenant-busiti-001',
      orderId: 'order-001',
      amount: 1400000,
      paymentType: 'DP',
      paymentMethod: 'Transfer BCA',
      paymentProofUrl: null,
      notes: 'DP 50% via transfer m-banking BCA',
      createdAt: nowStr,
      updatedAt: nowStr,
    },
    {
      id: 'pay-002',
      tenantId: 'tenant-busiti-001',
      orderId: 'order-002',
      amount: 1500000,
      paymentType: 'DP',
      paymentMethod: 'Transfer Mandiri',
      paymentProofUrl: null,
      notes: 'DP 50% masuk ke rekening Mandiri',
      createdAt: nowStr,
      updatedAt: nowStr,
    },
    {
      id: 'pay-003',
      tenantId: 'tenant-busiti-001',
      orderId: 'order-004',
      amount: 3750000,
      paymentType: 'PELUNASAN',
      paymentMethod: 'Transfer BCA',
      paymentProofUrl: null,
      notes: 'Lunas 100% sebelum acara pengajian',
      createdAt: nowStr,
      updatedAt: nowStr,
    }
  ] as DemoPayment[],

  productions: [
    {
      id: 'prod-001',
      tenantId: 'tenant-busiti-001',
      date: today,
      status: 'IN_PROGRESS',
      totalBoxes: 100,
      notes: 'Persiapan bumbu selesai, penggorengan ayam dimulai jam 08:30',
      createdAt: nowStr,
      updatedAt: nowStr,
    },
    {
      id: 'prod-002',
      tenantId: 'tenant-busiti-001',
      date: tomorrow,
      status: 'PENDING',
      totalBoxes: 300,
      notes: '100 Nasi Box Premium + 200 Snack Box, tim pagi jam 06:00',
      createdAt: nowStr,
      updatedAt: nowStr,
    }
  ]
};
