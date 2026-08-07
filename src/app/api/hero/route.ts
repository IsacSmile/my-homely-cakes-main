import { NextResponse } from 'next/server';
import { db } from '@/db';
import { settings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getAdminFromCookies } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DEFAULT_HERO = {
  badge: "Trivandrum's Most Loved Home Bakery",
  heading: "Freshly Baked Homemade Cakes Delivered in Trivandrum.",
  subheading: "Handcrafted with 100% natural butter, organic cream, and zero preservatives. Browse our menu, pick your weight, and place your order in 1 tap — no login or payment gateway needed!",
  ctaPrimaryText: "Explore Cake Menu",
  ctaPrimaryLink: "/shop",
  ctaSecondaryText: "Call Baker Direct",
  ctaSecondaryPhone: "+91 98765 43210",
  images: [
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1000&q=80"
  ],
  cardTag: "TRIVANDRUM FAVORITE",
  cardTitle: "Tender Coconut Dream Cake",
  cardPrice: "₹650",
};

export async function GET() {
  try {
    const allSettings = db.select().from(settings).all();
    const map = allSettings.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, string>);

    let parsedImages = DEFAULT_HERO.images;
    if (map.hero_images) {
      try {
        const p = JSON.parse(map.hero_images);
        if (Array.isArray(p) && p.length > 0) parsedImages = p;
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
      images: parsedImages,
      cardTag: map.hero_card_tag || DEFAULT_HERO.cardTag,
      cardTitle: map.hero_card_title || DEFAULT_HERO.cardTitle,
      cardPrice: map.hero_card_price || DEFAULT_HERO.cardPrice,
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
      images,
      cardTag,
      cardTitle,
      cardPrice,
    } = body;

    const pairs: [string, string][] = [
      ['hero_badge', badge || ''],
      ['hero_heading', heading || ''],
      ['hero_subheading', subheading || ''],
      ['hero_cta_primary_text', ctaPrimaryText || ''],
      ['hero_cta_primary_link', ctaPrimaryLink || ''],
      ['hero_cta_secondary_text', ctaSecondaryText || ''],
      ['hero_cta_secondary_phone', ctaSecondaryPhone || ''],
      ['hero_images', JSON.stringify(Array.isArray(images) ? images : DEFAULT_HERO.images)],
      ['hero_card_tag', cardTag || ''],
      ['hero_card_title', cardTitle || ''],
      ['hero_card_price', cardPrice || ''],
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
  } catch (error) {
    console.error('Hero settings update error:', error);
    return NextResponse.json({ error: 'Failed to update hero section settings' }, { status: 500 });
  }
}
