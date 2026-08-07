import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

const tursoUrl = process.env.TURSO_DATABASE_URL || (process.env.DATABASE_URL?.startsWith('libsql') || process.env.DATABASE_URL?.startsWith('https') ? process.env.DATABASE_URL : undefined);
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

let dbInstance: any;
let sqliteInstance: any = null;

if (tursoUrl && (tursoAuthToken || tursoUrl.startsWith('file:'))) {
  const client = createClient({
    url: tursoUrl,
    authToken: tursoAuthToken,
  });
  dbInstance = drizzleLibsql(client, { schema });
} else {
  const dbDir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'data');
  if (!process.env.VERCEL && !fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const sqlitePath = path.join(dbDir, 'myhomelycakes.db');
  sqliteInstance = new Database(sqlitePath);
  sqliteInstance.pragma('journal_mode = WAL');
  dbInstance = drizzleSqlite(sqliteInstance, { schema });
}

export const db = dbInstance;

// Auto-initialize local tables if using local SQLite
const initDb = () => {
  if (!sqliteInstance) return;
  sqliteInstance.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      image_url TEXT NOT NULL,
      images TEXT NOT NULL DEFAULT '[]',
      category TEXT NOT NULL,
      base_weight_g INTEGER NOT NULL DEFAULT 500,
      base_price INTEGER NOT NULL,
      variants TEXT NOT NULL DEFAULT '[500, 1000, 2000]',
      is_available INTEGER NOT NULL DEFAULT 1,
      order_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  // Migrate: add 'images' column to products if missing
  try {
    const productCols = sqliteInstance.pragma('table_info(products)') as any[];
    if (!productCols.some((col: any) => col.name === 'images')) {
      sqliteInstance.exec(`ALTER TABLE products ADD COLUMN images TEXT NOT NULL DEFAULT '[]'`);
    }
  } catch (e) {
    console.error('Migration notice (products.images):', e);
  }

  sqliteInstance.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      mobile TEXT NOT NULL,
      address TEXT,
      notes TEXT,
      items TEXT NOT NULL,
      subtotal INTEGER NOT NULL,
      discount_amount INTEGER NOT NULL DEFAULT 0,
      total_amount INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL
    );
  `);

  // Migrate: add new order columns if missing
  const orderMigrations: [string, string][] = [
    ['delivery_city', 'TEXT'],
    ['delivery_date', 'TEXT'],
    ['delivery_time', 'TEXT'],
    ['cake_message', 'TEXT'],
  ];
  try {
    const orderCols = sqliteInstance.pragma('table_info(orders)') as any[];
    for (const [colName, colType] of orderMigrations) {
      if (!orderCols.some((col: any) => col.name === colName)) {
        sqliteInstance.exec(`ALTER TABLE orders ADD COLUMN ${colName} ${colType}`);
      }
    }
  } catch (e) {
    console.error('Migration notice (orders new columns):', e);
  }

  sqliteInstance.exec(`
    CREATE TABLE IF NOT EXISTS offers (
      id TEXT PRIMARY KEY,
      heading TEXT NOT NULL,
      discount_percent INTEGER NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      start_date TEXT,
      end_date TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      occupation TEXT NOT NULL,
      photo_url TEXT NOT NULL,
      bio TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      cake_name TEXT NOT NULL,
      rating INTEGER NOT NULL DEFAULT 5,
      quote TEXT NOT NULL,
      initials TEXT NOT NULL,
      avatar_bg TEXT NOT NULL DEFAULT 'bg-amber-100 text-amber-900 border-amber-300',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS email_signups (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS search_logs (
      id TEXT PRIMARY KEY,
      query TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS click_logs (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL
    );
  `);

  // Seed default city "Trivandrum" if cities table is empty
  try {
    const cityCount = sqliteInstance.prepare('SELECT COUNT(*) as cnt FROM cities').get() as { cnt: number };
    if (cityCount.cnt === 0) {
      const now = new Date().toISOString();
      sqliteInstance.prepare(
        'INSERT OR IGNORE INTO cities (id, name, is_active, sort_order, created_at) VALUES (?, ?, 1, 0, ?)'
      ).run('city_trivandrum', 'Trivandrum', now);
    }
  } catch (e) {
    console.error('Seed cities error:', e);
  }
};

initDb();
