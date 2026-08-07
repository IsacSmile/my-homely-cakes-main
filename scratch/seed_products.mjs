import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const tursoUrl = process.env.TURSO_DATABASE_URL || 'libsql://my-homely-cakes-isacsmile.aws-ap-south-1.turso.io';
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODYwOTU1MTEsImlkIjoiMDE5ZmRiN2UtZTIwMS03ZWY2LTlmY2EtOTAyMmJhMmIwZGUyIiwia2lkIjoiN2xtV3pKVFAtZ1Y1WjdrWk53UkYyOE5iemtIMEFodGltSkFPb19qSFJ2byIsInJpZCI6ImI4MjhhM2U2LTA5ZGUtNDZjMi05MTJiLThhY2FmMThkYzlhOSJ9.zCjvXBE3roKX85ftl7UkN1jOLcGaW64CzaKTHsA8ZoFHqsfimKauBO40E4Q-AINbUPZDSFbPE83-8u6OeDx2DA';

const makeVariants = (basePrice) => JSON.stringify([
  { weightG: 500, price: basePrice, isDefault: true },
  { weightG: 1000, price: Math.round(basePrice * 1.85), isDefault: false },
  { weightG: 1500, price: Math.round(basePrice * 2.7), isDefault: false },
  { weightG: 2000, price: Math.round(basePrice * 3.5), isDefault: false },
]);

const newProducts = [
  {
    id: 'cake_9',
    name: 'Salted Caramel Butterscotch Crunch',
    slug: 'salted-caramel-butterscotch-crunch',
    description: 'Golden butterscotch sponge layers filled with house-made salted caramel drip, praline crunch, and whipped butter cream.',
    imageUrl: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
    ]),
    category: 'Signature Cakes',
    baseWeightG: 500,
    basePrice: 750,
    variants: makeVariants(750),
    isAvailable: 1,
    orderCount: 64,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cake_10',
    name: 'Pistachio Saffron Cardamom Cake',
    slug: 'pistachio-saffron-cardamom-cake',
    description: 'Authentic royal Indian flavors featuring real Kashmiri saffron, crushed roasted pistachios, and aromatic green cardamom cream.',
    imageUrl: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
    ]),
    category: 'Kerala Specialities',
    baseWeightG: 500,
    basePrice: 850,
    variants: makeVariants(850),
    isAvailable: 1,
    orderCount: 52,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cake_11',
    name: 'Triple Chocolate Fudge Overload',
    slug: 'triple-chocolate-fudge-overload',
    description: 'Ultimate chocolate lover dream featuring milk chocolate mousse, dark fudge ganache, and white chocolate curls on cocoa sponge.',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    ]),
    category: 'Chocolate & Truffle',
    baseWeightG: 500,
    basePrice: 780,
    variants: makeVariants(780),
    isAvailable: 1,
    orderCount: 115,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cake_12',
    name: 'Fresh Strawberry Shortcake',
    slug: 'fresh-strawberry-shortcake',
    description: 'Fluffy light vanilla sponge layers overflowing with fresh strawberry slices and sweet whipped cream frosting.',
    imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=800&q=80',
    ]),
    category: 'Fresh Fruit & Berry',
    baseWeightG: 500,
    basePrice: 720,
    variants: makeVariants(720),
    isAvailable: 1,
    orderCount: 79,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cake_13',
    name: 'San Sebastian Burnt Basque Cheesecake',
    slug: 'san-sebastian-burnt-basque-cheesecake',
    description: 'Crustless Spanish cheesecake baked at high temperature for a caramelized top and ultra-creamy melting center.',
    imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
    ]),
    category: 'Premium Cheesecakes',
    baseWeightG: 500,
    basePrice: 980,
    variants: makeVariants(980),
    isAvailable: 1,
    orderCount: 48,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cake_14',
    name: 'Rose Falooda Royal Celebration Cake',
    slug: 'rose-falooda-royal-celebration-cake',
    description: 'Infused with fragrant rose water, sabja seeds, and vermicelli jelly cream layers topped with crushed dry fruits.',
    imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
    ]),
    category: 'Kerala Specialities',
    baseWeightG: 500,
    basePrice: 790,
    variants: makeVariants(790),
    isAvailable: 1,
    orderCount: 41,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cake_15',
    name: 'White Chocolate Raspberry Delight',
    slug: 'white-chocolate-raspberry-delight',
    description: 'Creamy Swiss white chocolate ganache matched with tangy tart raspberry compote between velvet butter sponge layers.',
    imageUrl: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=800&q=80',
    ]),
    category: 'Fresh Fruit & Berry',
    baseWeightG: 500,
    basePrice: 760,
    variants: makeVariants(760),
    isAvailable: 1,
    orderCount: 67,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cake_16',
    name: 'Ferrero Rocher Hazelnut Drip Cake',
    slug: 'ferrero-rocher-hazelnut-drip-cake',
    description: 'Crown of golden Ferrero Rocher chocolates over dark chocolate ganache drip, filled with hazelnut praline buttercream.',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80',
    ]),
    category: 'Chocolate & Truffle',
    baseWeightG: 500,
    basePrice: 890,
    variants: makeVariants(890),
    isAvailable: 1,
    orderCount: 132,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cake_17',
    name: 'Tiramisu Mascarpone Espresso Cake',
    slug: 'tiramisu-mascarpone-espresso-cake',
    description: 'Italian style coffee-soaked sponge layered with whipped mascarpone cream and dusted with dark Dutch cocoa powder.',
    imageUrl: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=800&q=80',
    ]),
    category: 'Signature Cakes',
    baseWeightG: 500,
    basePrice: 820,
    variants: makeVariants(820),
    isAvailable: 1,
    orderCount: 85,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cake_18',
    name: 'Custom Two-Tier Floral Birthday Cake',
    slug: 'custom-two-tier-floral-birthday-cake',
    description: 'Stunning 2-tier custom celebration cake with handcrafted edible fondant flowers and personalized gold name topper.',
    imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
    ]),
    category: 'Custom Occasion Cakes',
    baseWeightG: 1000,
    basePrice: 1450,
    variants: makeVariants(1450),
    isAvailable: 1,
    orderCount: 39,
    createdAt: new Date().toISOString(),
  },
];

async function runSeed() {
  console.log('Seeding 10 dummy products into local SQLite database...');
  const localDbPath = path.join(process.cwd(), 'data', 'myhomelycakes.db');
  if (fs.existsSync(localDbPath)) {
    const sqlite = new Database(localDbPath);
    for (const p of newProducts) {
      sqlite.prepare(`
        INSERT OR REPLACE INTO products (id, name, slug, description, image_url, images, category, base_weight_g, base_price, variants, is_available, order_count, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(p.id, p.name, p.slug, p.description, p.imageUrl, p.images, p.category, p.baseWeightG, p.basePrice, p.variants, p.isAvailable, p.orderCount, p.createdAt);
    }
    console.log('✅ Local SQLite updated with 10 dummy products!');
  }

  console.log('Seeding 10 dummy products into Turso Cloud database...');
  try {
    const client = createClient({ url: tursoUrl, authToken: tursoAuthToken });
    for (const p of newProducts) {
      await client.execute({
        sql: `INSERT OR REPLACE INTO products (id, name, slug, description, image_url, images, category, base_weight_g, base_price, variants, is_available, order_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [p.id, p.name, p.slug, p.description, p.imageUrl, p.images, p.category, p.baseWeightG, p.basePrice, p.variants, p.isAvailable, p.orderCount, p.createdAt]
      });
    }
    console.log('✅ Turso Cloud Database updated with 10 dummy products!');
  } catch (err) {
    console.error('Turso seed warning:', err.message);
  }
}

runSeed();
