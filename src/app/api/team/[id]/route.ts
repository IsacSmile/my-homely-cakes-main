import { NextResponse } from 'next/server';
import { db } from '@/db';
import { teamMembers } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { getAdminFromCookies } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const resolvedParams = await params;
    const body = await request.json();

    // Reorder action
    if (body.action === 'reorder') {
      const { direction } = body; // 'up' or 'down'
      const allMembers = db.select().from(teamMembers).orderBy(asc(teamMembers.sortOrder)).all();
      const currentIndex = allMembers.findIndex((m: any) => m.id === resolvedParams.id);

      if (currentIndex === -1) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex >= 0 && targetIndex < allMembers.length) {
        const currentMember = allMembers[currentIndex];
        const targetMember = allMembers[targetIndex];

        db.update(teamMembers)
          .set({ sortOrder: targetMember.sortOrder })
          .where(eq(teamMembers.id, currentMember.id))
          .run();

        db.update(teamMembers)
          .set({ sortOrder: currentMember.sortOrder })
          .where(eq(teamMembers.id, targetMember.id))
          .run();
      }

      return NextResponse.json({ success: true });
    }

    // Normal edit update
    const { name, occupation, photoUrl, bio } = body;
    if (!name || !occupation || !photoUrl) {
      return NextResponse.json({ error: 'Name, occupation, and photo are required.' }, { status: 400 });
    }

    db.update(teamMembers)
      .set({
        name: name.trim(),
        occupation: occupation.trim(),
        photoUrl: photoUrl.trim(),
        bio: bio ? bio.trim() : null,
      })
      .where(eq(teamMembers.id, resolvedParams.id))
      .run();

    const updated = db.select().from(teamMembers).where(eq(teamMembers.id, resolvedParams.id)).get();
    return NextResponse.json({ success: true, member: updated });
  } catch (error) {
    console.error('Update team member error:', error);
    return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const resolvedParams = await params;
    db.delete(teamMembers).where(eq(teamMembers.id, resolvedParams.id)).run();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete team member' }, { status: 500 });
  }
}
