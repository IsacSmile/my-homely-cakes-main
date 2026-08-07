import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const tursoUrl = process.env.TURSO_DATABASE_URL || 'libsql://my-homely-cakes-isacsmile.aws-ap-south-1.turso.io';
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODYwOTU1MTEsImlkIjoiMDE5ZmRiN2UtZTIwMS03ZWY2LTlmY2EtOTAyMmJhMmIwZGUyIiwia2lkIjoiN2xtV3pKVFAtZ1Y1WjdrWk53UkYyOE5iemtIMEFodGltSkFPb19qSFJ2byIsInJpZCI6ImI4MjhhM2U2LTA5ZGUtNDZjMi05MTJiLThhY2FmMThkYzlhOSJ9.zCjvXBE3roKX85ftl7UkN1jOLcGaW64CzaKTHsA8ZoFHqsfimKauBO40E4Q-AINbUPZDSFbPE83-8u6OeDx2DA';

const featuredIds = ['cake_1', 'cake_2', 'cake_7', 'cake_10'];

async function markFeatured() {
  console.log('Marking initial featured products in local SQLite...');
  const localDbPath = path.join(process.cwd(), 'data', 'myhomelycakes.db');
  if (fs.existsSync(localDbPath)) {
    const sqlite = new Database(localDbPath);
    try {
      sqlite.prepare('ALTER TABLE products ADD COLUMN is_featured INTEGER NOT NULL DEFAULT 0').run();
      sqlite.prepare('ALTER TABLE products ADD COLUMN featured_order INTEGER NOT NULL DEFAULT 0').run();
    } catch {}

    for (let i = 0; i < featuredIds.length; i++) {
      sqlite.prepare('UPDATE products SET is_featured = 1, featured_order = ? WHERE id = ?').run(i + 1, featuredIds[i]);
    }
    console.log('✅ Local SQLite updated with initial featured products!');
  }

  console.log('Marking initial featured products in Turso Cloud...');
  try {
    const client = createClient({ url: tursoUrl, authToken: tursoAuthToken });
    try {
      await client.execute('ALTER TABLE products ADD COLUMN is_featured INTEGER NOT NULL DEFAULT 0');
      await client.execute('ALTER TABLE products ADD COLUMN featured_order INTEGER NOT NULL DEFAULT 0');
    } catch {}

    for (let i = 0; i < featuredIds.length; i++) {
      await client.execute({
        sql: 'UPDATE products SET is_featured = 1, featured_order = ? WHERE id = ?',
        args: [i + 1, featuredIds[i]]
      });
    }
    console.log('✅ Turso Cloud DB updated with initial featured products!');
  } catch (err) {
    console.error('Turso mark featured warning:', err.message);
  }
}

markFeatured();
