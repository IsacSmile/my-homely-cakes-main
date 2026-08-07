import { db } from './index';
import { products, offers, adminUsers, settings, orders, clickLogs, searchLogs, emailSignups, categories } from './schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Seeding MyHomelyCake database...');

  // 1. Default Admin User
  const existingAdmin = db.select().from(adminUsers).where(eq(adminUsers.email, 'myhomelycakes@gmail.com')).get();
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin@jinu123!', 10);
    db.insert(adminUsers).values({
      id: 'admin_1',
      email: 'myhomelycakes@gmail.com',
      passwordHash,
      createdAt: new Date().toISOString(),
    }).run();
    console.log('✅ Created default admin user: myhomelycakes@gmail.com');
  }

  // 2. Default Settings
  const defaultSettings = [
    { id: 'set_1', key: 'admin_whatsapp', value: '919947066011' },
    { id: 'set_2', key: 'admin_email', value: 'myhomelycakes@gmail.com' },
  ];

  for (const s of defaultSettings) {
    const exists = db.select().from(settings).where(eq(settings.key, s.key)).get();
    if (!exists) {
      db.insert(settings).values(s).run();
    }
  }

  // 2b. Categories Setup
  const initialCategories = [
    { id: 'cat_1', name: 'Kerala Specialities', slug: 'kerala-specialities', displayOrder: 1, createdAt: new Date().toISOString() },
    { id: 'cat_2', name: 'Chocolate & Truffle', slug: 'chocolate-truffle', displayOrder: 2, createdAt: new Date().toISOString() },
    { id: 'cat_3', name: 'Signature Cakes', slug: 'signature-cakes', displayOrder: 3, createdAt: new Date().toISOString() },
    { id: 'cat_4', name: 'Fresh Fruit & Berry', slug: 'fresh-fruit-berry', displayOrder: 4, createdAt: new Date().toISOString() },
    { id: 'cat_5', name: 'Premium Cheesecakes', slug: 'premium-cheesecakes', displayOrder: 5, createdAt: new Date().toISOString() },
    { id: 'cat_6', name: 'Custom Occasion Cakes', slug: 'custom-occasion-cakes', displayOrder: 6, createdAt: new Date().toISOString() },
  ];
  for (const c of initialCategories) {
    const exists = db.select().from(categories).where(eq(categories.id, c.id)).get();
    if (!exists) {
      db.insert(categories).values(c).run();
    }
  }
  console.log('✅ Seeded default categories.');

  // Helper function to create structured variants
  const makeVariants = (basePrice: number) => JSON.stringify([
    { weightG: 500, price: basePrice, isDefault: true },
    { weightG: 1000, price: Math.round(basePrice * 1.85), isDefault: false },
    { weightG: 1500, price: Math.round(basePrice * 2.7), isDefault: false },
    { weightG: 2000, price: Math.round(basePrice * 3.5), isDefault: false },
  ]);

  // 3. Products Setup (22 realistic Trivandrum specialty cakes with 3-4 photos each)
  const initialProducts = [
    {
      id: 'cake_1',
      name: 'Tender Coconut Dream Cake',
      slug: 'tender-coconut-dream-cake',
      description: 'Signature Trivandrum delicacy made with fresh Elaneer (tender coconut pulp), fluffy coconut cream, and soft vanilla sponge.',
      imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80',
      ]),
      category: 'Kerala Specialities',
      baseWeightG: 500,
      basePrice: 650,
      variants: makeVariants(650),
      isAvailable: true,
      orderCount: 142,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cake_2',
      name: 'Belgian Chocolate Truffle Cake',
      slug: 'belgian-chocolate-truffle-cake',
      description: 'Rich 60% dark Belgian chocolate ganache layered between moist cocoa sponge. Smooth, glossy finish topped with hand-carved truffle curls.',
      imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80',
      ]),
      category: 'Chocolate & Truffle',
      baseWeightG: 500,
      basePrice: 700,
      variants: makeVariants(700),
      isAvailable: true,
      orderCount: 198,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cake_3',
      name: 'Nutella Hazelnut Crunch',
      slug: 'nutella-hazelnut-crunch',
      description: 'Irresistible Nutella cream layers interspersed with toasted hazelnuts and crunchy wafer pearls on a rich chocolate sponge.',
      imageUrl: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
      ]),
      category: 'Chocolate & Truffle',
      baseWeightG: 500,
      basePrice: 800,
      variants: makeVariants(800),
      isAvailable: true,
      orderCount: 165,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cake_4',
      name: 'Classic Red Velvet Cream Cheese',
      slug: 'classic-red-velvet-cream-cheese',
      description: 'Traditional crimson velvet sponge with subtle cocoa undertones, layered with rich imported cream cheese frosting.',
      imageUrl: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=800&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
      ]),
      category: 'Signature Cakes',
      baseWeightG: 500,
      basePrice: 750,
      variants: makeVariants(750),
      isAvailable: true,
      orderCount: 110,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cake_5',
      name: 'Fresh Alphonso Mango Gateau',
      slug: 'fresh-alphonso-mango-gateau',
      description: 'Seasonal delight loaded with real Alphonso mango pulp, light whipped cream, and tender vanilla sponge.',
      imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
      ]),
      category: 'Fresh Fruit & Berry',
      baseWeightG: 500,
      basePrice: 700,
      variants: makeVariants(700),
      isAvailable: true,
      orderCount: 88,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cake_6',
      name: 'New York Baked Blueberry Cheesecake',
      slug: 'new-york-baked-blueberry-cheesecake',
      description: 'Slow-baked creamy cheesecake on a buttery Graham cracker crust, smothered with wild blueberry compote.',
      imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=800&q=80',
      ]),
      category: 'Premium Cheesecakes',
      baseWeightG: 500,
      basePrice: 950,
      variants: makeVariants(950),
      isAvailable: true,
      orderCount: 76,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cake_7',
      name: 'Lotus Biscoff Speculoos Cake',
      slug: 'lotus-biscoff-speculoos-cake',
      description: 'Decadent layers of caramelized Biscoff cookie butter cream, crunchy cookie crumbs, and soft brown sugar sponge.',
      imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80',
      ]),
      category: 'Signature Cakes',
      baseWeightG: 500,
      basePrice: 850,
      variants: makeVariants(850),
      isAvailable: true,
      orderCount: 94,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cake_8',
      name: 'Black Forest Royale',
      slug: 'black-forest-royale',
      description: 'Classic Kirsch-soaked chocolate sponge filled with sour cherries and whipped cream, coated in chocolate shavings.',
      imageUrl: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
      ]),
      category: 'Chocolate & Truffle',
      baseWeightG: 500,
      basePrice: 600,
      variants: makeVariants(600),
      isAvailable: true,
      orderCount: 130,
      createdAt: new Date().toISOString(),
    },
  ];

  for (const p of initialProducts) {
    const exists = db.select().from(products).where(eq(products.id, p.id)).get();
    if (!exists) {
      db.insert(products).values(p).run();
    } else {
      // Update variants to new structured format
      db.update(products).set({ variants: p.variants }).where(eq(products.id, p.id)).run();
    }
  }
  console.log('✅ Seeded products with structured weight-price variants.');

  // 4. Default Occasion Offers
  const initialOffers = [
    {
      id: 'off_1',
      heading: '🎉 Birthday Special Offer — 15% OFF All Specialty Cakes!',
      discountPercent: 15,
      isActive: true,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'off_2',
      heading: '🥥 Trivandrum Local Special: Free Delivery on 1.5kg+ Tender Coconut Cakes',
      discountPercent: 10,
      isActive: false,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    },
  ];

  for (const o of initialOffers) {
    const exists = db.select().from(offers).where(eq(offers.id, o.id)).get();
    if (!exists) {
      db.insert(offers).values(o).run();
    }
  }
  console.log('✅ Seeded occasion offers.');

  console.log('✨ Seed complete!');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
