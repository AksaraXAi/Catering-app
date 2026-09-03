// @ts-ignore
import pkg from '@prisma/client';
const PrismaClient = (pkg as any).PrismaClient || (pkg as any);
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function main() {
  console.log('Seeding CateringApp database...');

  // 1. Password hash
  const passwordHash = await bcrypt.hash('password123', 10);

  // 2. Super Admin User
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@cateringapp.com' },
    update: {},
    create: {
      email: 'admin@cateringapp.com',
      password: passwordHash,
      name: 'Super Admin CateringApp',
      role: 'SUPER_ADMIN',
    },
  });
  console.log('Super admin created:', superAdmin.email);

  // 3. Demo Tenant: Catering Bu Siti
  const tenantBuSiti = await prisma.tenant.upsert({
    where: { slug: 'busiti' },
    update: {},
    create: {
      name: 'Catering Bu Siti',
      slug: 'busiti',
      description: 'Spesialis hidangan lezat, higienis, dan halal untuk acara hajatan, syukuran, rapat kantor, dan pernikahan di Yogyakarta & sekitarnya.',
      whatsapp: '6281234567890',
      address: 'Jl. Malioboro No. 45, Danurejan, Kota Yogyakarta, D.I. Yogyakarta',
      bankInfo: 'Bank BCA: 8690123456 a/n Siti Aminah | Bank Mandiri: 137000987654 a/n Siti Aminah',
      colorTheme: '#10B981',
      active: true,
      logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
    },
  });
  console.log('Tenant created:', tenantBuSiti.name);

  // 4. Owner User for Catering Bu Siti
  const ownerBuSiti = await prisma.user.upsert({
    where: { email: 'busiti@catering.com' },
    update: {},
    create: {
      tenantId: tenantBuSiti.id,
      email: 'busiti@catering.com',
      password: passwordHash,
      name: 'Ibu Siti Aminah',
      role: 'OWNER',
    },
  });
  console.log('Owner created:', ownerBuSiti.email);

  // 5. Menus
  const menusData = [
    {
      name: 'Nasi Box Hemat',
      description: 'Nasi putih pulen, ayam goreng lengkuas gurih, sambal goreng ati kentang, oseng buncis wortel, kerupuk udang, dan sambal terasi.',
      price: 22000,
      category: 'Nasi Box',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Nasi Box Premium',
      description: 'Nasi liwet wangi, ayam bakar bumbu rujak, udang krispi saus tiram, telur balado utuh, capcay goreng, kerupuk, buah pisang, dan puding.',
      price: 35000,
      category: 'Nasi Box',
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Snack Box Tradisional & Modern',
      description: 'Kombinasi 3 kue pilihan: Lemper ayam bakar, Risoles mayo smoke beef, Pie buah segar manis, dan air mineral botol 330ml.',
      price: 15000,
      category: 'Snack Box',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Paket Hajatan Komplit',
      description: 'Nasi kuning tumpeng mini / box kenduri, rendang daging sapi empuk, ayam goreng rempah, sambal goreng krecek, perkedel kentang, serundeng kelapa, dan lalapan.',
      price: 45000,
      category: 'Paket Hajatan',
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Paket Prasmanan Nusantara',
      description: 'Paket prasmanan min. 50 porsi: Sup kimlo / iga sapi, rolade sapi saus jamur, ayam rica-rica pedas manis, kakap asam manis, mie goreng oriental, salad buah, dan es buah segar.',
      price: 65000,
      category: 'Paket Prasmanan',
      imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const createdMenus: Record<string, any> = {};
  for (const item of menusData) {
    const menu = await prisma.menu.create({
      data: {
        tenantId: tenantBuSiti.id,
        ...item,
      },
    });
    createdMenus[item.name] = menu;
  }
  console.log('Menus seeded:', Object.keys(createdMenus).length);

  // 6. Ingredients
  const ingredientsData = [
    { name: 'Beras Premium', unit: 'kg', stock: 150, minimumStock: 50, costPerUnit: 15000 },
    { name: 'Daging Ayam', unit: 'kg', stock: 80, minimumStock: 25, costPerUnit: 36000 },
    { name: 'Daging Sapi', unit: 'kg', stock: 30, minimumStock: 10, costPerUnit: 125000 },
    { name: 'Telur Ayam', unit: 'butir', stock: 400, minimumStock: 100, costPerUnit: 2000 },
    { name: 'Minyak Goreng', unit: 'liter', stock: 60, minimumStock: 20, costPerUnit: 18000 },
    { name: 'Kentang', unit: 'kg', stock: 45, minimumStock: 15, costPerUnit: 16000 },
    { name: 'Bawang Merah & Putih', unit: 'kg', stock: 25, minimumStock: 10, costPerUnit: 35000 },
    { name: 'Cabai Merah & Rawit', unit: 'kg', stock: 15, minimumStock: 5, costPerUnit: 45000 },
    { name: 'Box Bento Kraft', unit: 'buah', stock: 500, minimumStock: 200, costPerUnit: 2500 },
  ];

  const createdIngredients: Record<string, any> = {};
  for (const ing of ingredientsData) {
    const ingredient = await prisma.ingredient.create({
      data: {
        tenantId: tenantBuSiti.id,
        ...ing,
      },
    });
    createdIngredients[ing.name] = ingredient;
  }
  console.log('Ingredients seeded:', Object.keys(createdIngredients).length);

  // 7. Recipes
  // Nasi Box Hemat recipe per portion: Beras 0.1 kg, Ayam 0.15 kg, Telur 1 butir, Box Bento 1 buah
  if (createdMenus['Nasi Box Hemat']) {
    await prisma.recipe.createMany({
      data: [
        { tenantId: tenantBuSiti.id, menuId: createdMenus['Nasi Box Hemat'].id, ingredientId: createdIngredients['Beras Premium'].id, quantityNeeded: 0.1 },
        { tenantId: tenantBuSiti.id, menuId: createdMenus['Nasi Box Hemat'].id, ingredientId: createdIngredients['Daging Ayam'].id, quantityNeeded: 0.15 },
        { tenantId: tenantBuSiti.id, menuId: createdMenus['Nasi Box Hemat'].id, ingredientId: createdIngredients['Telur Ayam'].id, quantityNeeded: 1 },
        { tenantId: tenantBuSiti.id, menuId: createdMenus['Nasi Box Hemat'].id, ingredientId: createdIngredients['Box Bento Kraft'].id, quantityNeeded: 1 },
      ],
    });
  }
  if (createdMenus['Nasi Box Premium']) {
    await prisma.recipe.createMany({
      data: [
        { tenantId: tenantBuSiti.id, menuId: createdMenus['Nasi Box Premium'].id, ingredientId: createdIngredients['Beras Premium'].id, quantityNeeded: 0.12 },
        { tenantId: tenantBuSiti.id, menuId: createdMenus['Nasi Box Premium'].id, ingredientId: createdIngredients['Daging Ayam'].id, quantityNeeded: 0.2 },
        { tenantId: tenantBuSiti.id, menuId: createdMenus['Nasi Box Premium'].id, ingredientId: createdIngredients['Telur Ayam'].id, quantityNeeded: 1 },
        { tenantId: tenantBuSiti.id, menuId: createdMenus['Nasi Box Premium'].id, ingredientId: createdIngredients['Box Bento Kraft'].id, quantityNeeded: 1 },
      ],
    });
  }

  // 8. Demo Customers
  const customer1 = await prisma.customer.create({
    data: {
      tenantId: tenantBuSiti.id,
      name: 'Budi Santoso',
      whatsapp: '6281399887766',
      address: 'Gedung Grha Sabha Pramana UGM, Sekip Bulaksumur, Yogyakarta',
      notes: 'Sering pesan untuk seminar kampus',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      tenantId: tenantBuSiti.id,
      name: 'Rina Indrawati',
      whatsapp: '6285711223344',
      address: 'Perumahan Casa Grande No. B-12, Ring Road Utara, Sleman',
      notes: 'Acara syukuran keluarga, minta sambal dipisah',
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      tenantId: tenantBuSiti.id,
      name: 'PT Digital Solusi Indonesia (Hendra)',
      whatsapp: '6281809001122',
      address: 'Jalan Gejayan No. 88 Lantai 3, Sleman, DIY',
      notes: 'Makan siang karyawan meeting bulanan',
    },
  });

  // 9. Demo Orders
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 4);

  // Order 1: Today
  const order1 = await prisma.order.create({
    data: {
      tenantId: tenantBuSiti.id,
      customerId: customer1.id,
      orderNumber: 'ORD-20260902-001',
      eventDate: today,
      deliveryTime: '11:00',
      deliveryAddress: 'Gedung Grha Sabha Pramana UGM, Sleman',
      customerName: 'Budi Santoso',
      customerWhatsapp: '6281399887766',
      notes: 'Tolong antar tepat jam 11:00 WIB, ruangan lantai 2 Hall A.',
      totalAmount: 2200000,
      dpAmount: 1100000,
      remainingAmount: 1100000,
      paymentStatus: 'DP',
      orderStatus: 'IN_PROGRESS',
      items: {
        create: [
          {
            menuId: createdMenus['Nasi Box Hemat']?.id,
            menuName: 'Nasi Box Hemat',
            quantity: 100,
            unitPrice: 22000,
            subtotal: 2200000,
          },
        ],
      },
      payments: {
        create: [
          {
            tenantId: tenantBuSiti.id,
            amount: 1100000,
            paymentType: 'DP',
            paymentMethod: 'Transfer BCA',
            notes: 'DP 50% via BCA Budi Santoso',
          },
        ],
      },
      delivery: {
        create: {
          tenantId: tenantBuSiti.id,
          driverName: 'Pak Joko (Driver Internal)',
          driverPhone: '6281299001122',
          status: 'PENDING',
          deliveryTime: '11:00',
          notes: 'Gunakan motor roda tiga bak tertutup',
        },
      },
    },
  });

  // Order 2: Tomorrow (Multiple orders on same date for load alert)
  const order2 = await prisma.order.create({
    data: {
      tenantId: tenantBuSiti.id,
      customerId: customer2.id,
      orderNumber: 'ORD-20260903-002',
      eventDate: tomorrow,
      deliveryTime: '10:00',
      deliveryAddress: 'Perumahan Casa Grande No. B-12, Ring Road Utara, Sleman',
      customerName: 'Rina Indrawati',
      customerWhatsapp: '6285711223344',
      notes: 'Sambal minta dipisah per box, sendok garpu kayu ramah lingkungan.',
      totalAmount: 3500000,
      dpAmount: 3500000,
      remainingAmount: 0,
      paymentStatus: 'PAID',
      orderStatus: 'CONFIRMED',
      items: {
        create: [
          {
            menuId: createdMenus['Nasi Box Premium']?.id,
            menuName: 'Nasi Box Premium',
            quantity: 100,
            unitPrice: 35000,
            subtotal: 3500000,
          },
        ],
      },
      payments: {
        create: [
          {
            tenantId: tenantBuSiti.id,
            amount: 3500000,
            paymentType: 'LUNAS',
            paymentMethod: 'Transfer Mandiri',
            notes: 'Pembayaran Lunas',
          },
        ],
      },
      delivery: {
        create: {
          tenantId: tenantBuSiti.id,
          driverName: 'Pak Wahyu',
          driverPhone: '6285600112233',
          status: 'PENDING',
          deliveryTime: '10:00',
        },
      },
    },
  });

  // Order 3: Tomorrow (Second order on tomorrow to trigger peak load alert!)
  const order3 = await prisma.order.create({
    data: {
      tenantId: tenantBuSiti.id,
      customerId: customer3.id,
      orderNumber: 'ORD-20260903-003',
      eventDate: tomorrow,
      deliveryTime: '12:30',
      deliveryAddress: 'Jalan Gejayan No. 88 Lantai 3, Sleman, DIY',
      customerName: 'PT Digital Solusi Indonesia (Hendra)',
      customerWhatsapp: '6281809001122',
      notes: 'Meeting direksi & makan siang divisi engineering.',
      totalAmount: 3000000,
      dpAmount: 1500000,
      remainingAmount: 1500000,
      paymentStatus: 'DP',
      orderStatus: 'CONFIRMED',
      items: {
        create: [
          {
            menuId: createdMenus['Snack Box Tradisional & Modern']?.id,
            menuName: 'Snack Box Tradisional & Modern',
            quantity: 200,
            unitPrice: 15000,
            subtotal: 3000000,
          },
        ],
      },
      payments: {
        create: [
          {
            tenantId: tenantBuSiti.id,
            amount: 1500000,
            paymentType: 'DP',
            paymentMethod: 'Transfer BCA',
            notes: 'DP 50% via Corporate BCA',
          },
        ],
      },
      delivery: {
        create: {
          tenantId: tenantBuSiti.id,
          driverName: 'Pak Joko',
          driverPhone: '6281299001122',
          status: 'PENDING',
          deliveryTime: '12:30',
        },
      },
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
