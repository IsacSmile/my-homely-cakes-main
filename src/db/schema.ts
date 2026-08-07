import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
});

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  imageUrl: text('image_url').notNull(),
  images: text('images').notNull().default('[]'),
  category: text('category').notNull(),
  baseWeightG: integer('base_weight_g').notNull().default(500),
  basePrice: integer('base_price').notNull(),
  variants: text('variants').notNull().default('[500, 1000, 2000]'),
  isAvailable: integer('is_available', { mode: 'boolean' }).notNull().default(true),
  orderCount: integer('order_count').notNull().default(0),
  createdAt: text('created_at').notNull(),
});

export const cities = sqliteTable('cities', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
});

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  customerName: text('customer_name').notNull(),
  mobile: text('mobile').notNull(),
  address: text('address'),
  deliveryCity: text('delivery_city'),
  deliveryDate: text('delivery_date'),
  deliveryTime: text('delivery_time'),
  cakeMessage: text('cake_message'),
  notes: text('notes'),
  items: text('items').notNull(),
  subtotal: integer('subtotal').notNull(),
  discountAmount: integer('discount_amount').notNull().default(0),
  totalAmount: integer('total_amount').notNull(),
  status: text('status').notNull().default('new'),
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

export const teamMembers = sqliteTable('team_members', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  occupation: text('occupation').notNull(),
  photoUrl: text('photo_url').notNull(),
  bio: text('bio'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
});

export const testimonials = sqliteTable('testimonials', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  location: text('location').notNull(),
  cakeName: text('cake_name').notNull(),
  rating: integer('rating').notNull().default(5),
  quote: text('quote').notNull(),
  initials: text('initials').notNull(),
  avatarBg: text('avatar_bg').notNull().default('bg-amber-100 text-amber-900 border-amber-300'),
  sortOrder: integer('sort_order').notNull().default(0),
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

export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type City = typeof cities.$inferSelect;
export type NewCity = typeof cities.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type Offer = typeof offers.$inferSelect;
export type NewOffer = typeof offers.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;
export type EmailSignup = typeof emailSignups.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
