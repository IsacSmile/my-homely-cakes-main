import { db } from '../src/db/index';
import { products } from '../src/db/schema';
import { eq } from 'drizzle-orm';

const makeVariants = (basePrice: number) => JSON.stringify([
  { weightG: 500, price: basePrice, isDefault: true },
  { weightG: 1000, price: Math.round(basePrice * 1.85), isDefault: false },
  { weightG: 1500, price: Math.round(basePrice * 2.7), isDefault: false },
  { weightG: 2000, price: Math.round(basePrice * 3.5), isDefault: false },
]);

const newProductsToInsert = [
  {
    id: 'cake_19',
    name: 'Pistachio Matcha Cream Cake',
    slug: 'pistachio-matcha-cream-cake',
    description: 'Japanese ceremonial grade matcha sponge infused with silky pistachio cream and topped with crushed roasted pistachios.',
    imageUrl: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify(['https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80']),
    category: 'Signature Cakes',
    baseWeightG: 500,
    basePrice: 820,
    variants: makeVariants(820),
    isAvailable: true,
    isFeatured: false,
    featuredOrder: 0,
    orderCount: 58,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cake_20',
    name: 'Choco Vanilla Swirl Delight',
    slug: 'choco-vanilla-swirl-delight',
    description: 'Dual layered dark chocolate and Madagascar vanilla bean sponge frosted with marbled chocolate buttercream.',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify(['https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80']),
    category: 'Chocolate & Truffle',
    baseWeightG: 500,
    basePrice: 680,
    variants: makeVariants(680),
    isAvailable: true,
    isFeatured: false,
    featuredOrder: 0,
    orderCount: 92,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cake_21',
    name: 'Kottayam Passion Fruit Bliss',
    slug: 'kottayam-passion-fruit-bliss',
    description: 'Tangy fresh passion fruit glaze over moist vanilla bean cake, filled with passion fruit curd and white chocolate mousse.',
    imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify(['https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80']),
    category: 'Fresh Fruit & Berry',
    baseWeightG: 500,
    basePrice: 740,
    variants: makeVariants(740),
    isAvailable: true,
    isFeatured: false,
    featuredOrder: 0,
    orderCount: 63,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cake_22',
    name: 'Rich Dark Forest Cherry Fudge',
    slug: 'rich-dark-forest-cherry-fudge',
    description: 'Moist cocoa sponge steeped in black cherry syrup, filled with dark chocolate fudge and maraschino cherries.',
    imageUrl: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify(['https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80']),
    category: 'Chocolate & Truffle',
    baseWeightG: 500,
    basePrice: 760,
    variants: makeVariants(760),
    isAvailable: true,
    isFeatured: false,
    featuredOrder: 0,
    orderCount: 104,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cake_23',
    name: 'Royal Honey Almond Crunch Cake',
    slug: 'royal-honey-almond-crunch-cake',
    description: 'Pure Wayanad wild honey soaked sponge topped with caramelized sliced almonds and diplomat vanilla cream.',
    imageUrl: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify(['https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=800&q=80']),
    category: 'Kerala Specialities',
    baseWeightG: 500,
    basePrice: 800,
    variants: makeVariants(800),
    isAvailable: true,
    isFeatured: false,
    featuredOrder: 0,
    orderCount: 71,
    createdAt: new Date().toISOString(),
  },
];

async function sync() {
  console.log('🔄 Syncing dummy products to database...');
  for (const p of newProductsToInsert) {
    const existing = await db.select().from(products).where(eq(products.id, p.id));
    if (existing.length === 0) {
      await db.insert(products).values(p);
      console.log(`✅ Inserted: ${p.name} (${p.id})`);
    } else {
      await db.update(products).set(p).where(eq(products.id, p.id));
      console.log(`🔄 Updated: ${p.name} (${p.id})`);
    }
  }
  console.log('✨ All dummy products synced successfully!');
  process.exit(0);
}

sync().catch(err => {
  console.error('❌ Sync failed:', err);
  process.exit(1);
});
