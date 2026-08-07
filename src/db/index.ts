import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlitePath = path.join(dbDir, 'myhomelycakes.db');
const sqlite = new Database(sqlitePath);

// Enable WAL mode for performance
sqlite.pragma('journal_mode = WAL');

export const db = drizzleSqlite(sqlite, { schema });

// Auto-initialize tables if they don't exist
const initDb = () => {
  sqlite.exec(`
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
  `);

  try {
    const tableInfo = sqlite.pragma('table_info(products)') as any[];
    const hasImagesCol = tableInfo.some(col => col.name === 'images');
    if (!hasImagesCol) {
      sqlite.exec(`ALTER TABLE products ADD COLUMN images TEXT NOT NULL DEFAULT '[]'`);
    }
  } catch (e) {
    console.error('Migration notice:', e);
  }

  sqlite.exec(`
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
};

initDb();
