import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
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

  // Initialize Turso tables if missing
  client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      image TEXT,
      google_id TEXT,
      created_at TEXT NOT NULL
    );

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
      is_featured INTEGER NOT NULL DEFAULT 0,
      featured_order INTEGER NOT NULL DEFAULT 0,
      home_section_order INTEGER NOT NULL DEFAULT 0,
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

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      order_number TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      mobile TEXT NOT NULL,
      address TEXT,
      delivery_city TEXT,
      delivery_date TEXT,
      delivery_time TEXT,
      cake_message TEXT,
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
  `).then(async () => {
    try {
      await client.execute(`ALTER TABLE orders ADD COLUMN user_id TEXT;`).catch(() => {});
      await client.execute(`ALTER TABLE orders ADD COLUMN consumer_status TEXT NOT NULL DEFAULT 'received';`).catch(() => {});
      await client.execute(`ALTER TABLE users ADD COLUMN points_balance INTEGER NOT NULL DEFAULT 0;`).catch(() => {});
      await client.execute(`ALTER TABLE orders ADD COLUMN points_redeemed INTEGER NOT NULL DEFAULT 0;`).catch(() => {});
      await client.execute(`ALTER TABLE orders ADD COLUMN points_discount_amount INTEGER NOT NULL DEFAULT 0;`).catch(() => {});
      await client.execute(`ALTER TABLE orders ADD COLUMN points_earned INTEGER NOT NULL DEFAULT 0;`).catch(() => {});
      await client.execute(`ALTER TABLE products ADD COLUMN home_section_order INTEGER NOT NULL DEFAULT 0;`).catch(() => {});
      await client.execute(`ALTER TABLE products ADD COLUMN display_position INTEGER NOT NULL DEFAULT 0;`).catch(() => {});
      await client.execute(`ALTER TABLE products ADD COLUMN discount_percentage INTEGER;`).catch(() => {});
      await client.execute(`ALTER TABLE products ADD COLUMN promo_badge TEXT;`).catch(() => {});
      await client.execute(`
        CREATE TABLE IF NOT EXISTS points_transactions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          order_id TEXT,
          points_change INTEGER NOT NULL,
          type TEXT NOT NULL,
          description TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
      `).catch(() => {});
      await client.execute(`
        CREATE TABLE IF NOT EXISTS outlets (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          address TEXT NOT NULL,
          image_url TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL
        );
      `).catch(() => {});
      const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'myhomelycakes@gmail.com';
      const adminPass = process.env.ADMIN_DEFAULT_PASSWORD || 'admin@jinu123!';
      const passwordHash = bcrypt.hashSync(adminPass, 10);
      const now = new Date().toISOString();
      await client.execute({
        sql: 'INSERT OR IGNORE INTO admin_users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)',
        args: ['admin_1', adminEmail, passwordHash, now]
      });
      await client.execute({
        sql: 'INSERT OR IGNORE INTO cities (id, name, is_active, sort_order, created_at) VALUES (?, ?, 1, 0, ?)',
        args: ['city_trivandrum', 'Trivandrum', now]
      });
      await client.execute({
        sql: 'INSERT OR IGNORE INTO outlets (id, name, address, image_url, sort_order, created_at) VALUES (?, ?, ?, ?, 1, ?)',
        args: ['out_kowdiar', 'MyHomelyCake — Kowdiar Flagship', 'Near Golf Club, Main Road, Kowdiar, Thiruvananthapuram, Kerala 695003', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', now]
      });
      await client.execute({
        sql: 'INSERT OR IGNORE INTO outlets (id, name, address, image_url, sort_order, created_at) VALUES (?, ?, ?, ?, 2, ?)',
        args: ['out_pattom', 'MyHomelyCake — Pattom Store', 'Pattom Junction, Medical College Road, Pattom, Thiruvananthapuram, Kerala 695004', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80', now]
      });
      await client.execute({
        sql: 'INSERT OR IGNORE INTO outlets (id, name, address, image_url, sort_order, created_at) VALUES (?, ?, ?, ?, 3, ?)',
        args: ['out_kazhakkoottam', 'MyHomelyCake — Technopark Branch', 'Opp. Technopark Main Gate, Kazhakkoottam, Thiruvananthapuram, Kerala 695581', 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80', now]
      });
      await client.execute({
        sql: 'INSERT OR IGNORE INTO outlets (id, name, address, image_url, sort_order, created_at) VALUES (?, ?, ?, ?, 4, ?)',
        args: ['out_vellayambalam', 'MyHomelyCake — Vellayambalam Express', 'Althara Junction, Vellayambalam, Thiruvananthapuram, Kerala 695010', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80', now]
      });
    } catch (e) {
      console.error('Turso seed init error:', e);
    }
  }).catch(err => console.error('Turso table init error:', err));

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
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      image TEXT,
      google_id TEXT,
      points_balance INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

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

    CREATE TABLE IF NOT EXISTS points_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      order_id TEXT,
      points_change INTEGER NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Migrate: add 'points_balance' to users if missing
  try {
    const userCols = sqliteInstance.pragma('table_info(users)') as any[];
    if (!userCols.some((col: any) => col.name === 'points_balance')) {
      sqliteInstance.exec(`ALTER TABLE users ADD COLUMN points_balance INTEGER NOT NULL DEFAULT 0`);
    }
  } catch (e) {
    console.error('Migration notice (users points_balance):', e);
  }

  // Migrate: add 'images', 'is_featured', 'featured_order', 'home_section_order' columns to products if missing
  try {
    const productCols = sqliteInstance.pragma('table_info(products)') as any[];
    if (!productCols.some((col: any) => col.name === 'images')) {
      sqliteInstance.exec(`ALTER TABLE products ADD COLUMN images TEXT NOT NULL DEFAULT '[]'`);
    }
    if (!productCols.some((col: any) => col.name === 'is_featured')) {
      sqliteInstance.exec(`ALTER TABLE products ADD COLUMN is_featured INTEGER NOT NULL DEFAULT 0`);
    }
    if (!productCols.some((col: any) => col.name === 'featured_order')) {
      sqliteInstance.exec(`ALTER TABLE products ADD COLUMN featured_order INTEGER NOT NULL DEFAULT 0`);
    }
    if (!productCols.some((col: any) => col.name === 'home_section_order')) {
      sqliteInstance.exec(`ALTER TABLE products ADD COLUMN home_section_order INTEGER NOT NULL DEFAULT 0`);
    }
    if (!productCols.some((col: any) => col.name === 'display_position')) {
      sqliteInstance.exec(`ALTER TABLE products ADD COLUMN display_position INTEGER NOT NULL DEFAULT 0`);
    }
    if (!productCols.some((col: any) => col.name === 'discount_percentage')) {
      sqliteInstance.exec(`ALTER TABLE products ADD COLUMN discount_percentage INTEGER`);
    }
    if (!productCols.some((col: any) => col.name === 'promo_badge')) {
      sqliteInstance.exec(`ALTER TABLE products ADD COLUMN promo_badge TEXT`);
    }
  } catch (e) {
    console.error('Migration notice (products new columns):', e);
  }

  sqliteInstance.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      order_number TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      mobile TEXT NOT NULL,
      address TEXT,
      notes TEXT,
      items TEXT NOT NULL,
      subtotal INTEGER NOT NULL,
      discount_amount INTEGER NOT NULL DEFAULT 0,
      points_redeemed INTEGER NOT NULL DEFAULT 0,
      points_discount_amount INTEGER NOT NULL DEFAULT 0,
      points_earned INTEGER NOT NULL DEFAULT 0,
      points_credited INTEGER NOT NULL DEFAULT 0,
      total_amount INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      consumer_status TEXT NOT NULL DEFAULT 'received',
      created_at TEXT NOT NULL
    );
  `);

  // Migrate: add new order columns if missing
  const orderMigrations: [string, string][] = [
    ['user_id', 'TEXT'],
    ['delivery_city', 'TEXT'],
    ['delivery_date', 'TEXT'],
    ['delivery_time', 'TEXT'],
    ['cake_message', 'TEXT'],
    ['consumer_status', "TEXT NOT NULL DEFAULT 'received'"],
    ['points_redeemed', 'INTEGER NOT NULL DEFAULT 0'],
    ['points_discount_amount', 'INTEGER NOT NULL DEFAULT 0'],
    ['points_earned', 'INTEGER NOT NULL DEFAULT 0'],
    ['points_credited', 'INTEGER NOT NULL DEFAULT 0'],
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

    CREATE TABLE IF NOT EXISTS outlets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      image_url TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
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

    const outletCount = sqliteInstance.prepare('SELECT COUNT(*) as cnt FROM outlets').get() as { cnt: number };
    if (outletCount.cnt === 0) {
      const now = new Date().toISOString();
      sqliteInstance.prepare('INSERT OR IGNORE INTO outlets (id, name, address, image_url, sort_order, created_at) VALUES (?, ?, ?, ?, 1, ?)').run('out_kowdiar', 'MyHomelyCake — Kowdiar Flagship', 'Near Golf Club, Main Road, Kowdiar, Thiruvananthapuram, Kerala 695003', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', now);
      sqliteInstance.prepare('INSERT OR IGNORE INTO outlets (id, name, address, image_url, sort_order, created_at) VALUES (?, ?, ?, ?, 2, ?)').run('out_pattom', 'MyHomelyCake — Pattom Store', 'Pattom Junction, Medical College Road, Pattom, Thiruvananthapuram, Kerala 695004', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80', now);
      sqliteInstance.prepare('INSERT OR IGNORE INTO outlets (id, name, address, image_url, sort_order, created_at) VALUES (?, ?, ?, ?, 3, ?)').run('out_kazhakkoottam', 'MyHomelyCake — Technopark Branch', 'Opp. Technopark Main Gate, Kazhakkoottam, Thiruvananthapuram, Kerala 695581', 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80', now);
      sqliteInstance.prepare('INSERT OR IGNORE INTO outlets (id, name, address, image_url, sort_order, created_at) VALUES (?, ?, ?, ?, 4, ?)').run('out_vellayambalam', 'MyHomelyCake — Vellayambalam Express', 'Althara Junction, Vellayambalam, Thiruvananthapuram, Kerala 695010', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80', now);
    }

    // Ensure default admin user exists with requested password
    const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'myhomelycakes@gmail.com';
    const adminPass = process.env.ADMIN_DEFAULT_PASSWORD || 'admin@jinu123!';
    const passwordHash = bcrypt.hashSync(adminPass, 10);
    const now = new Date().toISOString();

    sqliteInstance.prepare(
      'INSERT OR REPLACE INTO admin_users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)'
    ).run('admin_1', adminEmail, passwordHash, now);
  } catch (e) {
    console.error('Seed initDb error:', e);
  }
};


initDb();
