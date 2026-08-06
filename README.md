# MyHomelyCake — Cake Ordering Website (Trivandrum)

A fast, lightweight, SEO-optimized ordering website for **MyHomelyCake**, a single-shop home bakery serving Trivandrum, Kerala. Built with Next.js App Router, Tailwind CSS, and Drizzle ORM paired with Neon Postgres (with local SQLite fallback).

---

## Key Features

- **Zero Friction Ordering**: Customers can browse, select cake weights, and place instant orders with just their Name & Mobile Phone — no accounts, passwords, or payment gateways needed.
- **Dynamic Weight-Based Pricing**: Admin sets base weight and price; prices auto-scale dynamically for all weight variants (500g, 1kg, 2kg, etc.).
- **Local Cart & Wishlist**: Client-side `localStorage` persistence for shopping cart & saved wishlist items.
- **Admin Panel (`/admin-manage`)**: Authenticated portal to manage orders (tap-to-call links & WhatsApp generator), catalog products, occasion offers, and email signups.
- **Analytics & Engagement**: Logs search queries, product clicks, and weekly order counts for executive dashboard reporting.
- **SEO Optimized**: Open Graph tags, JSON-LD `LocalBusiness`/`Bakery` schema for Trivandrum, dynamic `sitemap.xml` and `robots.txt`.

---

## Tech Stack

- **Framework:** Next.js 14+ (App Router, React Server Components, TypeScript)
- **Styling:** Tailwind CSS (Soft Warm Beige `#FAF7F2` theme with Rich Chocolate `#2C1A14` & Rose/Amber accents)
- **Database & ORM:** Drizzle ORM with Neon Serverless Postgres (and local SQLite fallback for instant offline testing)
- **Auth:** Admin JWT cookie authentication with `bcryptjs` password hashing
- **Notifications:** Resend Email API + WhatsApp direct message generator

---

## Quick Start & Local Running

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Seed Database
Run the seed script to populate 22 Trivandrum specialty cakes, default occasion offers, sample analytics, and the default admin user:
```bash
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Admin Portal Access

- **Admin URL:** `http://localhost:3000/admin-manage`
- **Default Email:** `admin@myhomelycakes.com`
- **Default Password:** `Admin@123456!`

> **Security Note:** Log into `/admin-manage/settings` to change your password and admin contact preferences after first login.

---

## Vercel & Neon Deployment Steps

1. Create a serverless Postgres database on [Neon.tech](https://neon.tech).
2. Connect your repository to **Vercel**.
3. Add `DATABASE_URL`, `JWT_SECRET`, `ADMIN_DEFAULT_EMAIL`, `ADMIN_DEFAULT_PASSWORD`, `ADMIN_WHATSAPP_NUMBER`, and `RESEND_API_KEY` under Vercel Project Environment Variables.
4. Deploy on Vercel!
