import { NextResponse } from 'next/server';
import { db } from '@/db';
import { settings, products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getAdminFromCookies } from '@/lib/auth';
import { getDefaultVariant, formatINR } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export interface HeroSlide {
  id: string;
  imageUrl: string;
  cardTag: string;
  cardTitle: string;
  cardPrice: string;
  linkUrl: string;
  productId?: string;
  product?: any;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 'cake_2',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80',
    cardTag: 'BESTSELLER #1',
    cardTitle: 'Belgian Chocolate Truffle Cake',
    cardPrice: '₹700',
    linkUrl: '/shop?product=cake_2',
    productId: 'cake_2',
  },
  {
    id: 'cake_3',
    imageUrl: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=1000&q=80',
    cardTag: 'TOP FAVORITE',
    cardTitle: 'Nutella Hazelnut Crunch',
    cardPrice: '₹800',
    linkUrl: '/shop?product=cake_3',
    productId: 'cake_3',
  },
  {
    id: 'cake_1',
    imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=1000&q=80',
    cardTag: 'POPULAR CHOICE',
    cardTitle: 'Tender Coconut Dream Cake',
    cardPrice: '₹650',
    linkUrl: '/shop?product=cake_1',
    productId: 'cake_1',
  },
  {
    id: 'cake_16',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80',
    cardTag: 'BESTSELLER #4',
    cardTitle: 'Ferrero Rocher Hazelnut Drip Cake',
    cardPrice: '₹890',
    linkUrl: '/shop?product=cake_16',
    productId: 'cake_16',
  },
  {
    id: 'cake_8',
    imageUrl: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=1000&q=80',
    cardTag: 'BESTSELLER #5',
    cardTitle: 'Black Forest Royale',
    cardPrice: '₹600',
    linkUrl: '/shop?product=cake_8',
    productId: 'cake_8',
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
    let allSettings: any[] = [];
    let allProducts: any[] = [];
    try { allSettings = (await db.select().from(settings).all()) || []; } catch {}
    try { allProducts = (await db.select().from(products).all()) || []; } catch {}

    const map = (allSettings || []).reduce((acc: Record<string, string>, item: any) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, string>);

    // Fetch top 5 best-selling available products (orderCount rank)
    const bestSelling = (allProducts || [])
      .filter((p: any) => p.isAvailable !== false)
      .sort((a: any, b: any) => (b.orderCount || 0) - (a.orderCount || 0) || (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));

    const bestSellingSlides: HeroSlide[] = bestSelling.slice(0, 5).map((p: any, idx: number) => {
      const defVar = getDefaultVariant(p);
      const tagText = p.promoBadge && p.promoBadge.trim()
        ? p.promoBadge.trim().toUpperCase()
        : (idx === 0 ? 'BESTSELLER #1' : idx === 1 ? 'TOP FAVORITE' : idx === 2 ? 'POPULAR CHOICE' : `BESTSELLER #${idx + 1}`);

      return {
        id: p.id,
        imageUrl: p.imageUrl,
        cardTag: tagText,
        cardTitle: p.name,
        cardPrice: formatINR(defVar.price),
        linkUrl: `/shop?product=${p.id}`,
        productId: p.id,
        product: p,
      };
    });

    let slides: HeroSlide[] = bestSellingSlides.length >= 3 ? bestSellingSlides : DEFAULT_SLIDES;

    if (map.hero_slides) {
      try {
        const parsed = JSON.parse(map.hero_slides);
        if (Array.isArray(parsed) && parsed.length > 0) {
          slides = parsed.map((s: any) => {
            const matched = (allProducts || []).find((p: any) => p.id === s.productId || p.name.toLowerCase() === s.cardTitle?.toLowerCase());
            return matched ? { ...s, product: matched } : s;
          });
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
