# 🎂 MyHomelyCake — Trivandrum Home Bakery Web App

A fast, modern, mobile-first e-commerce web application for **MyHomelyCake**, a specialty home bakery in Trivandrum, Kerala. Built with Next.js 15, Tailwind CSS, Drizzle ORM, and SQLite / Turso DB.

---

## ✨ Features

- **⚡ Instant Ordering**: Zero-friction checkout supporting both Google OAuth login and direct guest checkout.
- **📱 Mobile-First Design**: Full-bleed quick-view product modals, smooth swipe gallery, and touch-locked drawer overlays.
- **🎂 Dynamic Pricing**: Automatic price calculation across weight variants (500g, 1kg, 2kg, etc.).
- **🔔 Live Admin Dashboard (`/admin-manage`)**:
  - Real-time incoming order sound alerts.
  - Date Range sales filter (Today, Yesterday, Last 7 Days, Custom Range).
  - Product catalog stock toggle & instant price editor.
- **🔍 Quick Search & Wishlist**: Real-time cake search modal and client-side saved wishlist.
- **🚀 Ultra Fast**: Built with React Server Components, hardware-accelerated 60fps animations, and image optimization.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: Tailwind CSS (Warm Bakery Palette)
- **Database & ORM**: Drizzle ORM (SQLite / Turso LibSQL Cloud DB)
- **Authentication**: NextAuth.js (Google OAuth) + JWT Admin Auth
- **Icons & UI**: Lucide React Icons

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your_nextauth_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
ADMIN_PASSWORD=admin
```

### 3. Seed Database
```bash
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## 🔐 Admin Panel Access

- **URL**: `http://localhost:3001/admin-manage`
- **Default Username**: `admin`
- **Default Password**: *(Set in `.env.local`)*

---

## 📦 Deployment

Easily deployable to **Vercel** or any Node.js host. Connect your repository to Vercel and add environment variables for production.
