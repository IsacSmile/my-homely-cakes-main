import { NextResponse } from 'next/server';
import { db } from '@/db';
import { settings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getAdminFromCookies } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export interface HeroSlide {
  id: string;
  imageUrl: string;
  cardTag: string;
  cardTitle: string;
  cardPrice: string;
  linkUrl: string;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 'hs_1',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80',
    cardTag: 'BESTSELLER',
    cardTitle: 'Belgian Chocolate Truffle',
    cardPrice: '₹750',
    linkUrl: '/shop',
  },
  {
    id: 'hs_2',
    imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=1000&q=80',
    cardTag: 'TRIVANDRUM FAVORITE',
    cardTitle: 'Tender Coconut Dream Cake',
    cardPrice: '₹650',
    linkUrl: '/shop',
  },
  {
    id: 'hs_3',
    imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1000&q=80',
    cardTag: 'SEASONAL SPECIAL',
    cardTitle: 'Fresh Alphonso Mango Cake',
    cardPrice: '₹700',
    linkUrl: '/shop',
  },
];

const DEFAULT_HERO = {
  badge: "Trivandrum's Most Loved Home Bakery",
  heading: "Freshly Baked Homemade Cakes Delivered in Trivandrum.",
  subheading: "Handcrafted with 100% natural butter, organic cream, and zero preservatives. Browse our menu, pick your weight, and place your order in 1 tap — no login or payment gateway needed!",
  ctaPrimaryText: "Explore Cake Menu",
  ctaPrimaryLink: "/shop",
  ctaSecondaryText: "Call Baker Direct",
  ctaSecondaryPhone: "+91 99470 66011",
  slides: DEFAULT_SLIDES,
};

export async function GET() {
  try {
    const allSettings = (await db.select().from(settings).all()) || [];
    const map = allSettings.reduce((acc: Record<string, string>, item: any) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, string>);

    let slides: HeroSlide[] = DEFAULT_SLIDES;
    if (map.hero_slides) {
      try {
        const parsed = JSON.parse(map.hero_slides);
        if (Array.isArray(parsed) && parsed.length > 0) {
          slides = parsed;
        }
      } catch (e) {}
    } else if (map.hero_images) {
      // Backward compatibility fallback from old simple images array
      try {
        const oldImages = JSON.parse(map.hero_images);
        if (Array.isArray(oldImages) && oldImages.length > 0) {
          slides = oldImages.map((imgUrl: string, idx: number) => ({
            id: 'hs_' + (idx + 1),
            imageUrl: imgUrl,
            cardTag: idx === 1 ? 'TRIVANDRUM FAVORITE' : idx === 0 ? 'BESTSELLER' : 'SEASONAL SPECIAL',
            cardTitle: idx === 1 ? 'Tender Coconut Dream Cake' : idx === 0 ? 'Belgian Chocolate Truffle' : 'Fresh Alphonso Mango Cake',
            cardPrice: idx === 1 ? '₹650' : idx === 0 ? '₹750' : '₹700',
            linkUrl: '/shop',
          }));
        }
      } catch (e) {}
    }

    const result = {
      badge: map.hero_badge || DEFAULT_HERO.badge,
      heading: map.hero_heading || DEFAULT_HERO.heading,
      subheading: map.hero_subheading || DEFAULT_HERO.subheading,
      ctaPrimaryText: map.hero_cta_primary_text || DEFAULT_HERO.ctaPrimaryText,
      ctaPrimaryLink: map.hero_cta_primary_link || DEFAULT_HERO.ctaPrimaryLink,
      ctaSecondaryText: map.hero_cta_secondary_text || DEFAULT_HERO.ctaSecondaryText,
      ctaSecondaryPhone: map.hero_cta_secondary_phone || DEFAULT_HERO.ctaSecondaryPhone,
      slides,
    };

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(DEFAULT_HERO);
  }
}

export async function POST(request: Request) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const {
      badge,
      heading,
      subheading,
      ctaPrimaryText,
      ctaPrimaryLink,
      ctaSecondaryText,
      ctaSecondaryPhone,
      slides,
    } = body;

    const pairs: [string, string][] = [
      ['hero_badge', badge || ''],
      ['hero_heading', heading || ''],
      ['hero_subheading', subheading || ''],
      ['hero_cta_primary_text', ctaPrimaryText || ''],
      ['hero_cta_primary_link', ctaPrimaryLink || ''],
      ['hero_cta_secondary_text', ctaSecondaryText || ''],
      ['hero_cta_secondary_phone', ctaSecondaryPhone || ''],
      ['hero_slides', JSON.stringify(Array.isArray(slides) && slides.length > 0 ? slides : DEFAULT_SLIDES)],
    ];

    for (const [key, value] of pairs) {
      const existing = await db.select().from(settings).where(eq(settings.key, key)).get();
      if (existing) {
        await db.update(settings).set({ value }).where(eq(settings.key, key)).run();
      } else {
        const id = 'set_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
        await db.insert(settings).values({ id, key, value }).run();
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Hero settings update error:', error);
    return NextResponse.json({ error: 'Failed to update hero section settings' }, { status: 500 });
  }
}
