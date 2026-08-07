import { NextResponse } from 'next/server';
import { db } from '@/db';
import { testimonials, settings } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { getAdminFromCookies } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DEFAULT_SETTINGS = {
  eyebrow: 'Customer Stories',
  heading: 'What Our Customers Say',
  subheading: 'Real stories from the people who made their celebrations a little sweeter with MyHomelyCake.',
};

const SEED_TESTIMONIALS = [
  {
    id: 't1',
    name: 'Anjali Nair',
    location: 'Kowdiar, Trivandrum',
    cakeName: 'Tender Coconut Dream Cake',
    rating: 5,
    quote: 'The Tender Coconut cake for my daughter’s 1st birthday was an absolute dream! So fresh, perfectly moist, and zero artificial sweetness. Everyone at the party asked where we ordered it from.',
    initials: 'AN',
    avatarBg: 'bg-amber-100 text-amber-900 border-amber-300',
    sortOrder: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't2',
    name: 'Dr. Suresh Kumar',
    location: 'Pattom, Trivandrum',
    cakeName: 'Belgian Chocolate Truffle',
    rating: 5,
    quote: 'Ordered the Belgian Chocolate Truffle for our wedding anniversary. Delivery was right on time at 7 PM and the cake melted in our mouths. 100% authentic home bakery quality!',
    initials: 'SK',
    avatarBg: 'bg-rose-100 text-rose-900 border-rose-300',
    sortOrder: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't3',
    name: 'Pooja & Deepak',
    location: 'Technopark, Kazhakkoottam',
    cakeName: 'Red Velvet Cream Cheese',
    rating: 5,
    quote: 'We order cakes for all our team birthdays at Technopark from MyHomelyCake. The online 1-tap ordering with cash/UPI on delivery is so convenient and completely stress-free.',
    initials: 'PD',
    avatarBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    sortOrder: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't4',
    name: 'Reshma Pillai',
    location: 'Vazhuthacaud, Trivandrum',
    cakeName: 'Fresh Alphonso Mango Cake',
    rating: 5,
    quote: 'You can instantly taste the difference with real Amul butter and natural cream. No heavy commercial icing or chemical flavorings. My parents loved the Mango Bliss cake!',
    initials: 'RP',
    avatarBg: 'bg-amber-100 text-amber-900 border-amber-300',
    sortOrder: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't5',
    name: 'Gokul Krishna',
    location: 'Nanthancode, Trivandrum',
    cakeName: 'Nutella Hazelnut Crunch',
    rating: 5,
    quote: 'Extremely courteous phone confirmation right after placing the order. They customized the birthday message on top beautifully. Highly recommended home bakers in Trivandrum!',
    initials: 'GK',
    avatarBg: 'bg-sky-100 text-sky-900 border-sky-300',
    sortOrder: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't6',
    name: 'Lakshmi Menon',
    location: 'Sasthamangalam, Trivandrum',
    cakeName: 'Persian Pistachio Rose Cake',
    rating: 5,
    quote: 'Finding 100% eggless handcrafted cakes in TVM that taste this rich was a blessing. The Pistachio Rose cake was the absolute star of our family weekend gathering!',
    initials: 'LM',
    avatarBg: 'bg-purple-100 text-purple-900 border-purple-300',
    sortOrder: 6,
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    let list = db.select().from(testimonials).orderBy(asc(testimonials.sortOrder)).all();

    // Auto-seed initial reviews if table is empty
    if (list.length === 0) {
      for (const item of SEED_TESTIMONIALS) {
        db.insert(testimonials).values(item).run();
      }
      list = db.select().from(testimonials).orderBy(asc(testimonials.sortOrder)).all();
    }

    // Fetch header settings
    const allSettings = db.select().from(settings).all();
    const map = allSettings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      eyebrow: map.testimonial_eyebrow || DEFAULT_SETTINGS.eyebrow,
      heading: map.testimonial_heading || DEFAULT_SETTINGS.heading,
      subheading: map.testimonial_subheading || DEFAULT_SETTINGS.subheading,
      testimonials: list,
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json({
      ...DEFAULT_SETTINGS,
      testimonials: SEED_TESTIMONIALS,
    });
  }
}

export async function POST(request: Request) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();

    // 1. Update Header Settings Action
    if (body.action === 'update_settings') {
      const { eyebrow, heading, subheading } = body;
      const pairs: [string, string][] = [
        ['testimonial_eyebrow', eyebrow || ''],
        ['testimonial_heading', heading || ''],
        ['testimonial_subheading', subheading || ''],
      ];

      for (const [key, value] of pairs) {
        const existing = db.select().from(settings).where(eq(settings.key, key)).get();
        if (existing) {
          db.update(settings).set({ value }).where(eq(settings.key, key)).run();
        } else {
          const id = 'set_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
          db.insert(settings).values({ id, key, value }).run();
        }
      }

      return NextResponse.json({ success: true });
    }

    // 2. Add New Testimonial Action
    const { name, location, cakeName, rating, quote } = body;

    if (!name || !location || !cakeName || !quote) {
      return NextResponse.json({ error: 'Name, location, cake name, and review quote are required.' }, { status: 400 });
    }

    const currentList = db.select().from(testimonials).all();
    const nextOrder = currentList.length + 1;

    // Generate Initials
    const nameParts = name.trim().split(' ');
    const initials = nameParts.length >= 2
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();

    const avatarBgs = [
      'bg-amber-100 text-amber-900 border-amber-300',
      'bg-rose-100 text-rose-900 border-rose-300',
      'bg-emerald-100 text-emerald-900 border-emerald-300',
      'bg-purple-100 text-purple-900 border-purple-300',
      'bg-sky-100 text-sky-900 border-sky-300',
    ];
    const avatarBg = avatarBgs[Math.floor(Math.random() * avatarBgs.length)];

    const id = 't_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newRecord = {
      id,
      name: name.trim(),
      location: location.trim(),
      cakeName: cakeName.trim(),
      rating: Number(rating) || 5,
      quote: quote.trim(),
      initials,
      avatarBg,
      sortOrder: nextOrder,
      createdAt: new Date().toISOString(),
    };

    db.insert(testimonials).values(newRecord).run();

    return NextResponse.json({ success: true, testimonial: newRecord });
  } catch (error) {
    console.error('Error adding testimonial:', error);
    return NextResponse.json({ error: 'Failed to add review' }, { status: 500 });
  }
}
