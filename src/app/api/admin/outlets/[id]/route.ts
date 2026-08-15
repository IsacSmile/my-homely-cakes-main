import { NextResponse } from 'next/server';
import { db } from '@/db';
import { outlets } from '@/db/schema';
import { getAdminFromCookies } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, address, imageUrl, sortOrder } = body;

    const existing = await db.select().from(outlets).where(eq(outlets.id, id)).get();
    if (!existing) {
      return NextResponse.json({ error: 'Outlet not found' }, { status: 404 });
    }

    const updatedData = {
      name: name !== undefined ? name.trim() : existing.name,
      address: address !== undefined ? address.trim() : existing.address,
      imageUrl: imageUrl !== undefined ? imageUrl.trim() : existing.imageUrl,
      sortOrder: typeof sortOrder === 'number' ? sortOrder : existing.sortOrder,
    };

    await db.update(outlets).set(updatedData).where(eq(outlets.id, id)).run();

    revalidatePath('/about');
    revalidatePath('/admin-manage/outlets');

    return NextResponse.json({ success: true, outlet: { ...existing, ...updatedData } });
  } catch (error) {
    console.error('Error updating outlet:', error);
    return NextResponse.json({ error: 'Failed to update outlet' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const existing = await db.select().from(outlets).where(eq(outlets.id, id)).get();
    if (!existing) {
      return NextResponse.json({ error: 'Outlet not found' }, { status: 404 });
    }

    await db.delete(outlets).where(eq(outlets.id, id)).run();

    revalidatePath('/about');
    revalidatePath('/admin-manage/outlets');

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Error deleting outlet:', error);
    return NextResponse.json({ error: 'Failed to delete outlet' }, { status: 500 });
  }
}
