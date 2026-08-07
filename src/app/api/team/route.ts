import { NextResponse } from 'next/server';
import { db } from '@/db';
import { teamMembers } from '@/db/schema';
import { asc } from 'drizzle-orm';
import { getAdminFromCookies } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DEFAULT_TEAM = [
  {
    id: 'tm_1',
    name: 'Anitha Kumar',
    occupation: 'Head Baker & Founder',
    photoUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=600&q=80',
    bio: 'Pioneered MyHomelyCake with authentic, 100% preservative-free homemade recipes.',
    sortOrder: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tm_2',
    name: 'Rahul V. S.',
    occupation: 'Master Pastry Chef',
    photoUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80',
    bio: 'Specializes in Belgian Truffle & Tender Coconut sponge perfection.',
    sortOrder: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tm_3',
    name: 'Meera Nair',
    occupation: 'Sugar Artist & Decorator',
    photoUrl: 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?auto=format&fit=crop&w=600&q=80',
    bio: 'Handcrafts exquisite custom birthday themes and floral cake designs.',
    sortOrder: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tm_4',
    name: 'Arun K. Pillai',
    occupation: 'Quality & Delivery Lead',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
    bio: 'Ensures temperature-controlled, pristine delivery across Trivandrum.',
    sortOrder: 4,
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    let members = db.select().from(teamMembers).orderBy(asc(teamMembers.sortOrder)).all();

    // Auto-seed default team members if empty
    if (members.length === 0) {
      for (const item of DEFAULT_TEAM) {
        db.insert(teamMembers).values(item).run();
      }
      members = db.select().from(teamMembers).orderBy(asc(teamMembers.sortOrder)).all();
    }

    return NextResponse.json({ members });
  } catch (error: any) {
    console.error('Fetch team error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch team members' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, occupation, photoUrl, bio } = await request.json();
    if (!name || !occupation || !photoUrl) {
      return NextResponse.json({ error: 'Name, occupation, and photo URL are required.' }, { status: 400 });
    }

    const currentMembers = db.select().from(teamMembers).all();
    const memberId = 'tm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    const newMember = {
      id: memberId,
      name: name.trim(),
      occupation: occupation.trim(),
      photoUrl: photoUrl.trim(),
      bio: bio ? bio.trim() : null,
      sortOrder: currentMembers.length + 1,
      createdAt: now,
    };

    db.insert(teamMembers).values(newMember).run();

    return NextResponse.json({ success: true, member: newMember });
  } catch (error: any) {
    console.error('Create team member error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to add team member' }, { status: 500 });
  }
}
