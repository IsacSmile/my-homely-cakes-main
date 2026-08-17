# 🎂 MyHomelyCake — Handcrafted Bakery Web Application

A modern, fast, and mobile-optimized e-commerce web platform for **MyHomelyCake**, a premier artisanal home bakery operating in Thiruvananthapuram (Trivandrum), Kerala. Built with Next.js 15 (App Router), TypeScript, Tailwind CSS, Drizzle ORM, Turso LibSQL, and Cloudinary.

---

## 🌟 Key Features

### 🛍️ Customer Experience
- **Interactive Product Catalog**: Browse handcrafted cake creations with category filtering, search, and dynamic weight variant selection (e.g. 500g, 700g, 1kg, 2kg).
- **Custom Delivery Scheduling**: Intuitive custom Date Picker (with "Today" / "Tomorrow" quick buttons) and 12-Hour AM/PM Time Picker for precise delivery slot selection.
- **Message on Cake Customization**: Dedicated personalization input for custom cake text and special baking instructions.
- **Customer Authentication & Account**:
  - **Google OAuth**: One-click Google Sign-In with NextAuth.js.
  - **Guest Checkout**: Instant checkout support without forcing account creation.
  - **"My Orders" Dashboard**: Real-time customer order tracking with delivery status updates.
  - **Loyalty Rewards Program**: Automatic points earning and redemption at checkout.

### 🛡️ Admin Management Portal (`/admin-manage`)
- **Real-Time Order Audio Alerts**: Live audio notification chime for incoming orders with auto-refreshing dashboard feeds.
- **Order Lifecycle Management**: Full control to update order progress (`Received` ➔ `Baking` ➔ `Out for Delivery` ➔ `Delivered`).
- **Product & Variant Management**: Add, edit, or toggle availability for cake products, base prices, image galleries, and custom weight/price rows.
- **Outlets & Team Editor**: Dynamic content management for bakery store locations (Kowdiar, Pattom, Kazhakkoottam, Vellayambalam) and head baker staff bios.
- **Sales Analytics**: Filter orders and revenues by custom date ranges (Today, Yesterday, Last 7 Days, Custom Range).

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, Server Components) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) (Custom Warm Bakery Theme) |
| **Database** | [Turso DB](https://turso.tech/) (LibSQL Edge SQLite) with local SQLite fallback |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) |
| **Authentication** | [NextAuth.js](https://next-auth.js.org/) (Google OAuth + Admin JWT) |
| **Media Storage** | [Cloudinary](https://cloudinary.com/) (Production Cloud Asset Uploads) |
| **Email Service** | [Nodemailer](https://nodemailer.com/) / [Resend](https://resend.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |

---

## 📁 Project Structure

```text
my-homely-cakes/
├── public/                    # Static assets & branding icons
├── src/
│   ├── app/                   # Next.js App Router pages & API routes
│   │   ├── (customer)/        # Customer-facing views (Shop, About, Orders)
│   │   ├── admin-manage/      # Admin dashboard & management tools
│   │   └── api/               # Serverless API endpoints (17 routes)
│   ├── components/            # UI Components (Header, Footer, Product Modals)
│   │   └── ui/                # Custom DatePicker, TimePicker, Skeletons
│   ├── context/               # Global state (CartContext)
│   ├── db/                    # Drizzle ORM schema, migrations & seed scripts
│   └── lib/                   # Auth handlers, Cloudinary upload, pricing utilities
├── drizzle.config.ts          # Drizzle ORM configuration
├── next.config.ts             # Next.js configuration & image remote patterns
├── tailwind.config.ts         # Custom Tailwind color palette & font tokens
└── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.17.0 or higher
- **npm** or **pnpm**

### 2. Installation
Clone the repository and install dependencies:
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

# Default Admin Credentials
ADMIN_DEFAULT_EMAIL=myhomelycakes@gmail.com
ADMIN_DEFAULT_PASSWORD=your_admin_password
```

### 4. Database Setup & Seeding
Initialize the database schema and load default products, categories, outlets, and admin user:
```bash
npm run db:seed
```

### 5. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3001](http://localhost:3001) in your browser to view the customer store, or navigate to [http://localhost:3001/admin-manage](http://localhost:3001/admin-manage) for the administrative dashboard.

---

## 🔐 Admin Panel Access

- **Dashboard Path**: `/admin-manage`
- **Default Email**: Configured via `ADMIN_DEFAULT_EMAIL`
- **Features**: Live incoming orders, status pipeline toggles, product price & stock editor, revenue reporting, store outlet locator editor.

---

## 📦 Deployment

This application is ready for deployment on **Vercel** or any serverless Node.js host.

1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Add all environment variables from `.env.local` to your Vercel Project Settings.
4. Deploy! Next.js will build and deploy the production bundle automatically.

---

## 📄 License

Private repository owned by **MyHomelyCake Trivandrum**. All rights reserved.
