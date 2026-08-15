import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';

// Parse .env manually
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    for (const line of envConfig.split('\n')) {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        if (key && !process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
} catch (e) {}

const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:local.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({
  url,
  authToken,
});

async function runMigration() {
  console.log('Running database migrations for users and user_id column...');

  try {
    // 1. Create users table if not exists
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT,
        image TEXT,
        google_id TEXT,
        created_at TEXT NOT NULL
      );
    `);
    console.log('Users table created or verified.');

    // 2. Add user_id column to orders table if not exists
    try {
      await client.execute(`
        ALTER TABLE orders ADD COLUMN user_id TEXT;
      `);
      console.log('Added user_id column to orders table.');
    } catch (err: any) {
      if (err?.message?.includes('duplicate column') || err?.message?.includes('already exists')) {
        console.log('user_id column already exists in orders table.');
      } else {
        console.log('Note on user_id column:', err.message);
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
  }
}

runMigration();
