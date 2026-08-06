import { db } from './index';
import { products, offers, adminUsers, settings, orders, clickLogs, searchLogs, emailSignups } from './schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Seeding MyHomelyCake database...');

  // 1. Admin User Setup
  const defaultEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@myhomelycakes.com';
  const defaultPass = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@123456!';
  const hashedPassword = await bcrypt.hash(defaultPass, 10);

  const existingAdmin = db.select().from(adminUsers).where(eq(adminUsers.email, defaultEmail)).get();
  if (!existingAdmin) {
    db.insert(adminUsers).values({
      id: 'admin_1',
      email: defaultEmail,
      passwordHash: hashedPassword,
      createdAt: new Date().toISOString(),
    }).run();
    console.log('✅ Admin user created:', defaultEmail);
  }

  // 2. Settings Setup
  const initialSettings = [
    { id: 'set_1', key: 'admin_whatsapp', value: '919876543210' },
    { id: 'set_2', key: 'admin_email', value: 'orders@myhomelycakes.com' },
    { id: 'set_3', key: 'monthly_order_counter_override', value: '500' },
  ];
  for (const s of initialSettings) {
    const exists = db.select().from(settings).where(eq(settings.key, s.key)).get();
    if (!exists) {
      db.insert(settings).values(s).run();
    }
  }

  // 3. Products Setup (22 realistic Trivandrum specialty cakes)
  const initialProducts = [
    {
      id: 'cake_1',
      name: 'Tender Coconut Dream Cake',
      slug: 'tender-coconut-dream-cake',
      description: 'Our Trivandrum bestseller! Layers of soft vanilla sponge infused with fresh tender coconut pulp, coconut cream frost, and roasted almond flakes.',
      imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
      category: 'Kerala Specialities',
      baseWeightG: 500,
      basePrice: 650,
      variants: JSON.stringify([500, 1000, 1500, 2000]),
      isAvailable: true,
      orderCount: 142,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cake_2',
      name: 'Belgian Chocolate Truffle Cake',
      slug: 'belgian-chocolate-truffle-cake',
      description: 'Rich 60% dark Belgian chocolate ganache layered between moist cocoa sponge. Smooth, glossy finish topped with hand-carved chocolate curls.',
      imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
      category: 'Chocolate & Truffle',
      baseWeightG: 500,
      basePrice: 700,
      variants: JSON.stringify([500, 1000, 1500, 2000, 3000]),
      isAvailable: true,
      orderCount: 189,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cake_3',
      name: 'Classic Red Velvet Cream Cheese',
      slug: 'classic-red-velvet-cream-cheese',
      description: 'Velvety crimson sponge with a touch of cocoa, layered with authentic whipped cream cheese frosting and fine red crumbs.',
      imageUrl: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=800&q=80',
      category: 'Signature Cakes',
      baseWeightG: 500,
      basePrice: 680,
      variants: JSON.stringify([500, 1000, 1500, 2000]),
      isAvailable: true,
      orderCount: 115,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cake_4',
      name: 'Fresh Alphonso Mango Gateau',
      slug: 'fresh-alphonso-mango-gateau',
      description: 'Seasonal delight loaded with fresh Alphonso mango chunks, light mango mousse filling, and vanilla chiffon cake base.',
      imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
      category: 'Fresh Fruit & Berry',
      baseWeightG: 500,
      basePrice: 750,
      variants: JSON.stringify([500, 1000, 1500, 2000]),
      isAvailable: true,
      orderCount: 98,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cake_5',
      name: 'Nutella Hazelnut Crunch',
      slug: 'nutella-hazelnut-crunch',
      description: 'Irresistible Nutella cream layers interspersed with toasted hazelnuts and crunchy wafer pearls on a rich chocolate sponge.',
      imageUrl: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80',
      category: 'Chocolate & Truffle',
      baseWeightG: 500,
      basePrice: 800,
      variants: JSON.stringify([500, 1000, 1500, 2000]),
      isAvailable: true,
      orderCount: 167,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cake_6',
      name: 'German Black Forest Classic',
      slug: 'german-black-forest-classic',
      description: 'Traditional Kirsch-infused cherry syrup soaked chocolate sponge, fresh whipped cream, dark chocolate shavings, and maraschino cherries.',
      imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
      category: 'Signature Cakes',
      baseWeightG: 500,
      basePrice: 580,
      variants: JSON.stringify([500, 1000, 1500, 2000]),
      isAvailable: true,
      orderCount: 130,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cake_7',
      name: 'Lotus Biscoff Caramel Cheesecake',
      slug: 'lotus-biscoff-caramel-cheesecake',
      description: 'Baked New York cheesecake on a spiced Biscoff biscuit crust, generously topped with melted Biscoff spread and biscuit crumbles.',
      imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
      category: 'Premium Cheesecakes',
      baseWeightG: 500,
      basePrice: 890,
      variants: JSON.stringify([500, 1000, 1500]),
      isAvailable: true,
      orderCount: 110,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cake_8',
      name: 'Honey Almond Crunch Cake',
      slug: 'honey-almond-crunch-cake',
      description: 'Natural Malabar honey sponge filled with butterscotch cream and covered in caramelized toasted almond praline.',
      imageUrl: 'https://images.unsplash.com/photo-1557925923-cd4648e211a0?auto=format&fit=crop&w=800&q=80',
      category: 'Kerala Specialities',
      baseWeightG: 500,
      basePrice: 620,
      variants: JSON.stringify([500, 1000, 1500, 2000]),
      isAvailable: true,
      orderCount: 88,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cake_9',
      name: 'White Forest Strawberry Swirl',
      slug: 'white-forest-strawberry-swirl',
      description: 'Fluffy white vanilla sponge layered with white chocolate ganache, fresh strawberry compote, and delicate white chocolate flakes.',
      imageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80',
      category: 'Fresh Fruit & Berry',
      baseWeightG: 500,
      basePrice: 620,
      variants: JSON.stringify([500, 1000, 1500, 2000]),
      isAvailable: true,
      orderCount: 75,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cake_10',
      name: 'Pistachio Saffron Royal Cake',
      slug: 'pistachio-saffron-royal-cake',
      description: 'Fragrant Kashmiri saffron sponge layered with crushed Iranian pistachios and cardamom cardamom cream.',
      imageUrl: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80',
      category: 'Signature Cakes',
      baseWeightG: 500,
      basePrice: 850,
      variants: JSON.stringify([500, 1000, 1500, 2000]),
      isAvailable: true,
      orderCount: 64,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cake_11',
      name: 'Triple Chocolate Fudge Overload',
      slug: 'triple-chocolate-fudge-overload',
      description: 'For intense chocolate lovers: dark, milk, and white chocolate fudge layers baked to gooey perfection.',
      imageUrl: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80',
      category: 'Chocolate & Truffle',
      baseWeightG: 500,
      basePrice: 720,
      variants: JSON.stringify([500, 1000, 1500, 2000]),
      isAvailable: true,
      orderCount: 145,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cake_12',
      name: 'Blueberry Swirl Baked Cheesecake',
      slug: 'blueberry-swirl-baked-cheesecake',
      description: 'Silky smooth cream cheese base with a vibrant wild blueberry compote swirl baked on a buttery graham crust.',
      imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
      category: 'Premium Cheesecakes',
      baseWeightG: 500,
      basePrice: 850,
      variants: JSON.stringify([500, 1000, 1500]),
      isAvailable: true,
      orderCount: 92,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cake_13',
      name: 'Butterscotch Caramel Bliss',
      slug: 'butterscotch-caramel-bliss',
      description: 'Classic yellow cake filled with handmade butterscotch sauce, caramelized sugar crunch, and smooth cream.',
      imageUrl: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80',
      category: 'Signature Cakes',
      baseWeightG: 500,
      basePrice: 550,
      variants: JSON.stringify([500, 1000, 1500, 2000]),
      isAvailable: true,
      orderCount: 121,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cake_14',
      name: 'Pineapple Sunshine Gateau',
      slug: 'pineapple-sunshine-gateau',
      description: 'Refreshing tropical cake with fresh caramelized pineapple chunks, maraschino cherry accents, and light vanilla cream.',
      imageUrl: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=800&q=80',
      category: 'Fresh Fruit & Berry',
      baseWeightG: 500,
      basePrice: 520,
      variants: JSON.stringify([500, 1000, 1500, 2000]),
      isAvailable: true,
      orderCount: 104,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cake_15',
      name: 'Ferrero Rocher Deluxe Cake',
      slug: 'ferrero-rocher-deluxe-cake',
      description: 'Dark cocoa cake smothered in hazelnut praline, roasted crushed hazelnuts, and topped with whole Ferrero Rocher chocolates.',
      imageUrl: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=800&q=80',
      category: 'Chocolate & Truffle',
      baseWeightG: 500,
      basePrice: 890,
      variants: JSON.stringify([500, 1000, 1500, 2000]),
      isAvailable: true,
      orderCount: 156,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cake_16',
      name: 'Spanish Delight Cake',
      slug: 'spanish-delight-cake',
      description: 'Special vanilla sponge soaked in milk caramel, layered with butter-roasted cashews and tutty-fruity crunch.',
      imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
      category: 'Kerala Specialities',
      baseWeightG: 500,
      basePrice: 640,
      variants: JSON.stringify([500, 1000, 1500, 2000]),
      isAvailable: true,
      orderCount: 82,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cake_17',
      name: 'Salted Caramel Espresso Cake',
      slug: 'salted-caramel-espresso-cake',
      description: 'Rich dark espresso-infused chocolate sponge filled with artisanal salted caramel buttercream.',
      imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
      category: 'Signature Cakes',
      baseWeightG: 500,
      basePrice: 690,
      variants: JSON.stringify([500, 1000, 1500, 2000]),
      isAvailable: true,
      orderCount: 71,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cake_18',
      name: 'Strawberry Shortcake Tier',
      slug: 'strawberry-shortcake-tier',
      description: 'Light-as-air Japanese sponge cake layered with fresh sliced strawberries and unsweetened vanilla bean cream.',
      imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
      category: 'Fresh Fruit & Berry',
      baseWeightG: 500,
      basePrice: 720,
      variants: JSON.stringify([500, 1000, 1500, 2000]),
      isAvailable: true,
      orderCount: 60,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cake_19',
      name: 'Matcha Green Tea & White Choco',
      slug: 'matcha-green-tea-white-choco',
      description: 'Organic Uji matcha sponge with delicate white chocolate mousse layers and matcha dusting.',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      category: 'Custom Occasion Cakes',
      baseWeightG: 500,
      basePrice: 780,
      variants: JSON.stringify([500, 1000, 1500]),
      isAvailable: true,
      orderCount: 35,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cake_20',
      name: 'Customized Birthday Theme Cake',
      slug: 'customized-birthday-theme-cake',
      description: 'Handcrafted fondant & cream custom theme cakes tailored for birthdays, anniversaries, and milestones.',
      imageUrl: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=800&q=80',
      category: 'Custom Occasion Cakes',
      baseWeightG: 1000,
      basePrice: 1200,
      variants: JSON.stringify([1000, 2000, 3000, 5000]),
      isAvailable: true,
      orderCount: 110,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cake_21',
      name: 'Oreo Cream Cookie Crunch',
      slug: 'oreo-cream-cookie-crunch',
      description: 'Decadent chocolate cake loaded with crushed Oreo cookies, vanilla cookies & cream frosting.',
      imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
      category: 'Chocolate & Truffle',
      baseWeightG: 500,
      basePrice: 620,
      variants: JSON.stringify([500, 1000, 1500, 2000]),
      isAvailable: true,
      orderCount: 95,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cake_22',
      name: 'Carrot Walnut Spiced Cake',
      slug: 'carrot-walnut-spiced-cake',
      description: 'Moist spiced carrot cake packed with toasted walnuts and coated in velvety orange cream cheese frost.',
      imageUrl: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=800&q=80',
      category: 'Signature Cakes',
      baseWeightG: 500,
      basePrice: 650,
      variants: JSON.stringify([500, 1000, 1500, 2000]),
      isAvailable: true,
      orderCount: 48,
      createdAt: new Date().toISOString(),
    },
  ];

  for (const p of initialProducts) {
    const exists = db.select().from(products).where(eq(products.id, p.id)).get();
    if (!exists) {
      db.insert(products).values(p).run();
    }
  }
  console.log('✅ Seeded 22 Trivandrum specialty products.');

  // 4. Occasion Offers Setup
  const initialOffers = [
    {
      id: 'offer_1',
      heading: '🎉 Onam Festival Special Offer',
      discountPercent: 15,
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'offer_2',
      heading: '🎂 Birthday Celebration Offer',
      discountPercent: 10,
      isActive: true,
      startDate: null,
      endDate: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'offer_3',
      heading: '🥥 Trivandrum Local Weekend Delight',
      discountPercent: 12,
      isActive: true,
      startDate: null,
      endDate: null,
      createdAt: new Date().toISOString(),
    }
  ];

  for (const o of initialOffers) {
    const exists = db.select().from(offers).where(eq(offers.id, o.id)).get();
    if (!exists) {
      db.insert(offers).values(o).run();
    }
  }
  console.log('✅ Seeded occasion offers.');

  // 5. Initial Sample Analytics & Orders
  const sampleSearchLogs = ['Tender Coconut', 'Chocolate Truffle', 'Red Velvet', 'Cheesecake', 'Mango Cake', 'Custom Birthday Cake'];
  for (const query of sampleSearchLogs) {
    db.insert(searchLogs).values({
      id: 'search_' + Math.random().toString(36).substring(2, 9),
      query,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    }).run();
  }

  const sampleClickLogs = ['cake_1', 'cake_2', 'cake_3', 'cake_5', 'cake_7', 'cake_15'];
  for (const productId of sampleClickLogs) {
    db.insert(clickLogs).values({
      id: 'click_' + Math.random().toString(36).substring(2, 9),
      productId,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    }).run();
  }

  const sampleSubscribers = ['deepa.nair@gmail.com', 'rahul.tvm@yahoo.com', 'anandhu.k@outlook.com'];
  for (const email of sampleSubscribers) {
    const exists = db.select().from(emailSignups).where(eq(emailSignups.email, email)).get();
    if (!exists) {
      db.insert(emailSignups).values({
        id: 'sub_' + Math.random().toString(36).substring(2, 9),
        email,
        createdAt: new Date().toISOString(),
      }).run();
    }
  }

  // Sample Orders for Dashboard Stats
  const sampleOrders = [
    {
      id: 'ord_1',
      orderNumber: '#MHC-9041',
      customerName: 'Anoop Kumar',
      mobile: '9847012345',
      address: 'Kowdiar, Trivandrum',
      notes: 'Please add "Happy 25th Anniversary" on cake',
      items: JSON.stringify([{ productId: 'cake_1', name: 'Tender Coconut Dream Cake', weightG: 1000, qty: 1, calculatedPrice: 1300 }]),
      subtotal: 1300,
      discountAmount: 195,
      totalAmount: 1105,
      status: 'new',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ord_2',
      orderNumber: '#MHC-9040',
      customerName: 'Reshma Pillai',
      mobile: '9447198765',
      address: 'Vazhuthacaud, Trivandrum',
      notes: 'Deliver around 5 PM',
      items: JSON.stringify([{ productId: 'cake_2', name: 'Belgian Chocolate Truffle Cake', weightG: 500, qty: 1, calculatedPrice: 700 }]),
      subtotal: 700,
      discountAmount: 70,
      totalAmount: 630,
      status: 'confirmed',
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
    {
      id: 'ord_3',
      orderNumber: '#MHC-9039',
      customerName: 'Dr. Suresh Varma',
      mobile: '9895054321',
      address: 'Pattam, Trivandrum',
      notes: '',
      items: JSON.stringify([{ productId: 'cake_5', name: 'Nutella Hazelnut Crunch', weightG: 1000, qty: 1, calculatedPrice: 1600 }]),
      subtotal: 1600,
      discountAmount: 160,
      totalAmount: 1440,
      status: 'completed',
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    }
  ];

  for (const ord of sampleOrders) {
    const exists = db.select().from(orders).where(eq(orders.id, ord.id)).get();
    if (!exists) {
      db.insert(orders).values(ord).run();
    }
  }

  console.log('✨ Seed complete!');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
