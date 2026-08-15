import { NextResponse } from 'next/server';
import { db } from '@/db';
import { settings } from '@/db/schema';
import { getAdminFromCookies } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

const DEFAULT_FOUNDER = {
  name: 'Aswathy S.',
  title: 'Founder & Head Baker',
  photoUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
  heading: 'Baking with Pure Love, Tradition & Zero Preservatives',
  experience: '10+ Years of Passionate Home Baking',
  bio: `MyHomelyCake began in a cozy Kowdiar home kitchen driven by a simple belief: every milestone celebration deserves a cake crafted with the exact warmth, wholesome ingredients, and care you would find in your mother's own recipes.\n\nUnlike mass commercial bakeries that rely on premade frozen sponge bases and artificial enhancers, our head baker personally hand-crafts every cake strictly to order. We use 100% natural butter, fresh dairy cream, and pure cocoa to ensure every slice melts with authentic homemade goodness.\n\nToday, while our family of bakers has grown across Trivandrum, our core promise remains unchanged — zero stored stock, custom flavor personalizations, and guaranteed fresh delivery right to your doorstep.`,
};

export async function GET() {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const allSettings = await db.select().from(settings).all();
    const settingsMap = (allSettings || []).reduce((acc: Record<string, string>, item: any) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    const founder = {
      name: settingsMap.founder_name || DEFAULT_FOUNDER.name,
      title: settingsMap.founder_title || DEFAULT_FOUNDER.title,
      photoUrl: settingsMap.founder_photo_url || DEFAULT_FOUNDER.photoUrl,
      heading: settingsMap.founder_heading || DEFAULT_FOUNDER.heading,
      experience: settingsMap.founder_experience || DEFAULT_FOUNDER.experience,
      bio: settingsMap.founder_bio || DEFAULT_FOUNDER.bio,
    };

    return NextResponse.json({ success: true, founder });
  } catch (error) {
    console.error('Error fetching admin founder details:', error);
    return NextResponse.json({ error: 'Failed to fetch founder details' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { name, title, photoUrl, heading, experience, bio } = body;

    const fieldsToUpdate: Record<string, string> = {
      founder_name: name || DEFAULT_FOUNDER.name,
      founder_title: title || DEFAULT_FOUNDER.title,
      founder_photo_url: photoUrl || DEFAULT_FOUNDER.photoUrl,
      founder_heading: heading || DEFAULT_FOUNDER.heading,
      founder_experience: experience || DEFAULT_FOUNDER.experience,
      founder_bio: bio || DEFAULT_FOUNDER.bio,
    };

    for (const [key, value] of Object.entries(fieldsToUpdate)) {
      const existing = await db.select().from(settings).where(eq(settings.key, key)).get();
      if (existing) {
        await db.update(settings).set({ value }).where(eq(settings.key, key)).run();
      } else {
        await db.insert(settings).values({
          id: `set_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          key,
          value,
        }).run();
      }
    }

    revalidatePath('/about');
    revalidatePath('/admin-manage/outlets');

    return NextResponse.json({ success: true, message: 'Founder profile updated successfully' });
  } catch (error) {
    console.error('Error updating founder details:', error);
    return NextResponse.json({ error: 'Failed to update founder profile' }, { status: 500 });
  }
}
