import { NextResponse } from 'next/server';
import { db } from '@/db';
import { outlets } from '@/db/schema';
import { getAdminFromCookies } from '@/lib/auth';
import { asc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const list = await db.select().from(outlets).orderBy(asc(outlets.sortOrder));
    return NextResponse.json({ success: true, outlets: list });
  } catch (error) {
    console.error('Error fetching admin outlets:', error);
    return NextResponse.json({ error: 'Failed to fetch outlets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { name, address, imageUrl, sortOrder } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Outlet name is required' }, { status: 400 });
    }
    if (!address || !address.trim()) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }
    if (!imageUrl || !imageUrl.trim()) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    const newOutlet = {
      id: `out_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      address: address.trim(),
      imageUrl: imageUrl.trim(),
      sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
      createdAt: new Date().toISOString(),
    };

    await db.insert(outlets).values(newOutlet).run();

    revalidatePath('/about');
    revalidatePath('/admin-manage/outlets');

    return NextResponse.json({ success: true, outlet: newOutlet });
  } catch (error) {
    console.error('Error creating outlet:', error);
    return NextResponse.json({ error: 'Failed to create outlet' }, { status: 500 });
  }
}
