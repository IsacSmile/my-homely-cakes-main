import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  imageUrl: text('image_url').notNull(),
  category: text('category').notNull(),
  baseWeightG: integer('base_weight_g').notNull().default(500),
  basePrice: integer('base_price').notNull(),
  variants: text('variants').notNull().default('[500, 1000, 2000]'), // JSON array string
  isAvailable: integer('is_available', { mode: 'boolean' }).notNull().default(true),
  orderCount: integer('order_count').notNull().default(0),
  createdAt: text('created_at').notNull(),
});

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  customerName: text('customer_name').notNull(),
  mobile: text('mobile').notNull(),
  address: text('address'),
  notes: text('notes'),
  items: text('items').notNull(), // JSON string array of items
  subtotal: integer('subtotal').notNull(),
  discountAmount: integer('discount_amount').notNull().default(0),
  totalAmount: integer('total_amount').notNull(),
  status: text('status').notNull().default('new'), // new, contacted, confirmed, completed, cancelled
  createdAt: text('created_at').notNull(),
});

export const offers = sqliteTable('offers', {
  id: text('id').primaryKey(),
  heading: text('heading').notNull(),
  discountPercent: integer('discount_percent').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  startDate: text('start_date'),
  endDate: text('end_date'),
  createdAt: text('created_at').notNull(),
});

export const emailSignups = sqliteTable('email_signups', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: text('created_at').notNull(),
});

export const searchLogs = sqliteTable('search_logs', {
  id: text('id').primaryKey(),
  query: text('query').notNull(),
  createdAt: text('created_at').notNull(),
});

export const clickLogs = sqliteTable('click_logs', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull(),
  createdAt: text('created_at').notNull(),
});

export const adminUsers = sqliteTable('admin_users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').notNull(),
});

export const settings = sqliteTable('settings', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type Offer = typeof offers.$inferSelect;
export type NewOffer = typeof offers.$inferInsert;
export type EmailSignup = typeof emailSignups.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
