import 'dotenv/config';
import { db } from './index';
import { outlets } from './schema';
import { asc } from 'drizzle-orm';

async function testSeedOutlets() {
  try {
    const list = await db.select().from(outlets).orderBy(asc(outlets.sortOrder));
    console.log('Outlets in Turso DB count:', list.length);
    console.log(JSON.stringify(list, null, 2));
  } catch (err) {
    console.error('Error fetching outlets:', err);
  }
}

testSeedOutlets().catch(console.error);
