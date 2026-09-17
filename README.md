# 🎂 MyHomelyCake — Handcrafted Bakery Web Application

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.33-C5F74F?style=for-the-badge&logo=drizzle)](https://orm.drizzle.team/)
[![Turso](https://img.shields.io/badge/Turso_LibSQL-EdgeDB-00E599?style=for-the-badge&logo=turso)](https://turso.tech/)

> *"Me and God only know how this website works, and now welcome you to wasting your hours on this website."*

**MyHomelyCake** is a modern, fast, mobile-responsive e-commerce and store management platform designed for an artisanal home bakery based in **Thiruvananthapuram (Trivandrum), Kerala**. Built with Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Drizzle ORM, Turso LibSQL database, Cloudinary, and NextAuth.js.

---

## 🌟 Key Features

### 🛍️ Customer Experience
- 🍰 **Interactive Product Catalog**: Browse handcrafted cakes with category filtering, search, and dynamic weight variant selections (500g, 700g, 1kg, 2kg).
- 📅 **Custom Delivery Scheduling**: Built-in Date Picker with quick "Today" / "Tomorrow" options and 12-Hour AM/PM Time Slot selector.
- ✍️ **Cake Personalization**: Dedicated fields for custom cake inscriptions and special baking/dietary notes.
- 🔐 **Flexible Authentication**:
  - **Google OAuth**: One-click sign-in powered by NextAuth.js.
  - **Guest Checkout**: Instant checkout flow for quick ordering without forced account registration.
- 📦 **Order Tracking Dashboard**: Real-time order progress tracking for registered customers.
- 🎁 **Loyalty Rewards Program**: Earn and redeem bakery rewards points directly at checkout.

### 🛡️ Admin Management Portal (`/admin-manage`)
- 🔔 **Real-Time Order Audio Alerts**: Instant sound notifications and auto-refreshing feeds when new orders arrive.
- 🔄 **Order Pipeline Workflow**: Update order states effortlessly (`Received` ➔ `Baking` ➔ `Out for Delivery` ➔ `Delivered`).
- 🏷️ **Product & Pricing Management**: Manage cake items, base prices, weight variant pricing, availability status, and photo galleries.
- 🏬 **Outlets & Team Management**: Dynamic content manager for bakery physical locations (Kowdiar, Pattom, Kazhakkoottam, Vellayambalam) and baker bios.
- 📊 **Sales Analytics**: Live revenue reports and order volume filters (Today, Yesterday, Last 7 Days, Custom Date Range).

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, React 19 Server Components) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) (Custom Warm Bakery Theme) |
| **Database** | [Turso DB](https://turso.tech/) (LibSQL Edge SQLite) with local SQLite fallback |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) |
| **Authentication** | [NextAuth.js](https://next-auth.js.org/) (Google OAuth + Admin JWT) |
| **Media Storage** | [Cloudinary](https://cloudinary.com/) (Cloud Asset Management) |
| **Email Services** | [Nodemailer](https://nodemailer.com/) / [Resend](https://resend.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |

---

## 📁 Project Structure

```text
my-homely-cakes/
├── public/                    # Static branding assets & icons
├── src/
│   ├── app/                   # Next.js App Router pages & API routes
│   │   ├── (customer)/        # Storefront views (Shop, About, Orders)
│   │   ├── admin-manage/      # Admin dashboard & management portal
│   │   └── api/               # Serverless API endpoints
│   ├── components/            # Reusable UI components & modals
│   │   └── ui/                # DatePicker, TimePicker, Skeletons
│   ├── context/               # React Context (CartContext)
│   ├── db/                    # Drizzle ORM schema, migrations & seeders
│   └── lib/                   # Auth options, Cloudinary helper, price math
├── drizzle.config.ts          # Drizzle ORM config
├── next.config.mjs            # Next.js runtime configuration
├── tailwind.config.ts         # Custom Tailwind theme tokens
└── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v18.17.0` or higher
- **npm** (or `pnpm` / `yarn`)

### 2. Installation
Clone the repo and install dependencies:
```bash
git clone https://github.com/IsacSmile/my-homely-cakes-main.git
cd my-homely-cakes-main
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:
```env
# App Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your_nextauth_secret_key

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Turso Cloud Database (Optional for Production; defaults to local SQLite)
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token

# Cloudinary Storage Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin Access Credentials
ADMIN_DEFAULT_EMAIL=myhomelycakes@gmail.com
ADMIN_DEFAULT_PASSWORD=your_admin_password
```

### 4. Database Initialization & Seeding
Populate the database with sample products, categories, outlets, and the admin user:
```bash
npm run db:seed
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3001](http://localhost:3001) in your browser to view the storefront, or navigate to [http://localhost:3001/admin-manage](http://localhost:3001/admin-manage) for the admin portal.

---

## 🔐 Admin Panel Access

- **Path**: `/admin-manage`
- **Default Email**: Set via `ADMIN_DEFAULT_EMAIL`
- **Features**: Live incoming orders, status pipeline toggles, product price & stock editor, revenue reporting, store outlet locator editor.

---

## 📦 Deployment

This project is configured for seamless deployment on **Vercel**:

1. Push your changes to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Set the Environment Variables listed in `.env.local`.
4. Deploy! Next.js will build the production application automatically.

---

## 📄 License

Private repository owned by **MyHomelyCake Trivandrum**. All rights reserved.

---

Crafted with ❤️ by **Faiz.I**
