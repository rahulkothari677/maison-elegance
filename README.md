# 🛍️ MAISON ÉLÉGANCE — Premium Clothing Web App

A production-grade, full-stack e-commerce platform built with Next.js 16, featuring a luxury shopping experience, real-time order tracking, and a complete admin dashboard.

![MAISON ÉLÉGANCE](https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80)

---

## ✨ Features

### Customer-Facing
- 🎨 **Premium UI** — Playfair Display + Inter typography, warm ivory + antique gold palette
- 🌓 **Dark / Light Mode** — Theme toggle with `next-themes`, persists across sessions
- 📐 **Mega Menu** — Rich 3-column dropdown with featured imagery on hover
- 👁️ **Quick View Modal** — Preview products without leaving the page
- 🛍️ **Slide-out Cart Drawer** — Auto-opens on Add to Bag, free-shipping progress bar
- 🔍 **Image Zoom Lens** — Hover product images for 2× cursor-tracked zoom
- 📖 **Editorial Lookbook** — Parallax-scrolling chapters on the home page
- 💌 **Concierge Chat** — Floating personal-stylist widget with smart auto-replies
- ❤️ **Wishlist** — Saved items, synced to server when authenticated
- ⭐ **Product Reviews** — Star ratings, distribution bars, submit your own
- 📦 **Order Tracking** — Real-time status updates via socket.io + polling fallback
- 🏆 **Loyalty Program** — Silver/Gold/Platinum tiers with auto-promotion
- 👤 **Full Profile Dashboard** — 9 tabs: Overview, Orders, Addresses, Payment, Wishlist, Loyalty, Recently Viewed, Notifications, Settings

### Admin Dashboard (admin-only)
- 📊 **Overview** — Revenue chart, stat cards, recent orders, top products
- 📦 **Products** — Full CRUD: create, edit, delete with all product fields
- 🛒 **Orders** — Filter by status, inline status updates, expandable details
- 👥 **Customers** — All users with tier, lifetime spend, loyalty points

### Real-Time
- ⚡ **Socket.io mini-service** — Standalone bun process on ports 3003 + 3004
- 📡 **Live updates** — Order status changes broadcast instantly to all clients
- 🔄 **Polling fallback** — Customer polls every 30s, admin every 8s

### Backend
- 🔐 **NextAuth.js v4** — Credentials provider, JWT sessions, bcrypt password hashing
- 🗄️ **Prisma + SQLite** — 9 models: User, Account, Session, Product, Order, OrderItem, Address, Review, WishlistItem
- 🌐 **11 REST API routes** — Auth, products, orders, addresses, wishlist, reviews, user, admin

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | Prisma ORM + SQLite |
| Auth | NextAuth.js v4 (JWT + bcrypt) |
| State | Zustand (client) + TanStack Query-ready |
| Animation | Framer Motion |
| Real-time | Socket.io (mini-service) |
| Icons | Lucide React |
| Fonts | Playfair Display + Inter (next/font) |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** or **Bun** (recommended — much faster)
- Git

### Option A: Using Bun (recommended)

```bash
# 1. Install dependencies
bun install

# 2. Set up environment variables
cp .env.example .env
# Edit .env if needed (defaults work out of the box)

# 3. Create the database + push schema
bun run db:push

# 4. Seed the database (12 products + demo user + sample orders)
bun run scripts/seed.ts

# 5. Start the dev server
bun run dev
```

### Option B: Using npm

```bash
npm install
npm run db:push
node --experimental-strip-types scripts/seed.ts
npm run dev
```

### 6. Start the real-time order tracker (optional but recommended)

In a separate terminal:

```bash
cd mini-services/order-tracker
bun install
bun run dev
```

This runs the socket.io server on port 3003 (websocket) and port 3004 (HTTP webhook).

### 7. Open the app

Visit `http://localhost:3000`

---

## 🔑 Demo Credentials

After seeding, you can sign in with:

| Email | Password | Role |
|---|---|---|
| `isabella.laurent@example.com` | `demo1234` | Admin (Gold tier, $15.7k lifetime spend) |

Or create a new account from the sign-in modal — new users get 100 bonus loyalty points.

---

## 📂 Project Structure

```
maison-elegance/
├── prisma/
│   └── schema.prisma              # 9-model database schema
├── scripts/
│   ├── seed.ts                    # Seeds products + demo user
│   └── run-order-tracker.sh       # Auto-restart wrapper
├── mini-services/
│   └── order-tracker/             # Socket.io mini-service
│       ├── index.ts
│       └── package.json
├── src/
│   ├── app/
│   │   ├── api/                   # 11 REST endpoints
│   │   │   ├── auth/[...nextauth]/
│   │   │   ├── auth/register/
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── addresses/
│   │   │   ├── wishlist/
│   │   │   ├── user/
│   │   │   └── admin/             # Admin-only routes
│   │   ├── layout.tsx
│   │   ├── page.tsx               # Main entry, view-state router
│   │   └── globals.css
│   ├── components/
│   │   ├── clothing/              # All app components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── HomeView.tsx
│   │   │   ├── ShopView.tsx
│   │   │   ├── ProductView.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductReviews.tsx
│   │   │   ├── CartView.tsx
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── CheckoutView.tsx
│   │   │   ├── WishlistView.tsx
│   │   │   ├── ProfileView.tsx
│   │   │   ├── OrderSuccessView.tsx
│   │   │   ├── AdminView.tsx
│   │   │   ├── AuthModal.tsx
│   │   │   ├── MegaMenu.tsx
│   │   │   ├── QuickView.tsx
│   │   │   ├── ConciergeChat.tsx
│   │   │   ├── BackToTop.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── theme-provider.tsx
│   │   └── next-auth-provider.tsx
│   ├── lib/
│   │   ├── auth.ts                # NextAuth config + admin helpers
│   │   ├── db.ts                  # Prisma client
│   │   ├── data.ts                # Product catalog (seed source)
│   │   ├── store.ts               # Zustand store
│   │   ├── use-user-data.ts       # API data hooks
│   │   ├── use-realtime.ts        # Socket.io + polling hooks
│   │   └── utils.ts
│   └── hooks/
├── .env                           # DATABASE_URL + NEXTAUTH_SECRET
├── package.json
└── README.md
```

---

## 🗄️ Database Schema

9 models defined in `prisma/schema.prisma`:

- **User** — id, email, name, passwordHash, tier, loyaltyPoints, lifetimeSpend, ...
- **Account** / **Session** / **VerificationToken** — NextAuth OAuth support
- **Product** — Full catalog with materials, craftsmanship, care, sustainability, fit
- **Order** + **OrderItem** — Order with denormalized items for history
- **Address** — User shipping addresses (multiple, with default flag)
- **Review** — Product reviews with rating + auto-recalculation on submit
- **WishlistItem** — User ↔ Product many-to-many

---

## 🌐 API Routes

### Public
- `GET /api/products?category=&sort=&minPrice=&maxPrice=&sizes=&colors=`
- `GET /api/products/[slug]`
- `GET /api/products/[slug]/reviews`
- `POST /api/auth/register`
- `GET/POST /api/auth/[...nextauth]`

### Authenticated
- `GET /api/user` — Get profile
- `PATCH /api/user` — Update profile
- `GET/POST /api/addresses` — List + create
- `PATCH/DELETE /api/addresses/[id]`
- `GET/POST /api/orders` — List user orders + create new order
- `GET/POST /api/wishlist` — List + add
- `DELETE /api/wishlist/[productId]`
- `POST /api/products/[slug]/reviews` — Submit review (auth required)

### Admin-only (`requireAdmin()` middleware)
- `GET /api/admin/stats` — Dashboard stats + 7-day revenue chart
- `GET/POST /api/admin/products` — List + create
- `PATCH/DELETE /api/admin/products/[id]`
- `GET /api/admin/orders?status=` — List with filter
- `PATCH /api/admin/orders/[id]` — Update status (broadcasts via socket)
- `GET /api/admin/customers`

---

## ⚡ Real-Time Order Tracking

The socket.io mini-service runs as a separate process:

```
┌──────────────────────┐       POST /broadcast       ┌──────────────────────┐
│  Next.js API route   │  ─────────────────────────► │  Order Tracker       │
│  /api/admin/orders/  │                              │  (port 3004 webhook) │
│       [id]           │                              │  (port 3003 socket)  │
└──────────────────────┘                              └──────────┬───────────┘
                                                                 │
                                                                 │ emit
                                                                 ▼
                                                       ┌──────────────────────┐
                                                       │  Connected clients   │
                                                       │  • Admin dashboard   │
                                                       │  • Customer browser  │
                                                       └──────────────────────┘
```

### Fallback
If socket.io fails, the app gracefully degrades:
- Admin Orders tab polls `/api/admin/orders` every 8s
- Customer global listener polls `/api/orders` every 30s and shows toast on status change

---

## 🎨 Design System

### Color Palette
- **Background** (light): Warm ivory `oklch(0.985 0.008 80)`
- **Foreground** (light): Deep espresso `oklch(0.18 0.012 50)`
- **Accent**: Antique gold `oklch(0.72 0.085 75)`
- **Primary**: Espresso `oklch(0.22 0.014 50)`

### Typography
- **Headings**: Playfair Display (serif, 400-700)
- **Body**: Inter (sans-serif, 400-700)
- **Mono**: Geist Mono (for order numbers, SKUs)

### Spacing
- Max width: 1440px
- Section padding: `py-20 lg:py-28`
- Letter spacing: `tracking-luxe` (0.25em) for labels

---

## 🚢 Deployment

### Deploy to Vercel (recommended for the Next.js app)

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Add environment variables:
   - `DATABASE_URL` — Use Vercel Postgres or a hosted SQLite (Turso)
   - `NEXTAUTH_SECRET` — Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` — Your Vercel URL (e.g. `https://your-app.vercel.app`)
4. Deploy

### Deploy the socket.io service separately

The mini-service can't run on Vercel (serverless). Options:
- **Railway** — easiest, supports WebSockets
- **Render** — free tier available
- **Fly.io** — good for low-latency global
- **Self-hosted** VPS

Set `XTransformPort` Caddy config OR connect directly to the service URL.

### Database options for production
- **Turso** (libSQL — SQLite-compatible, distributed)
- **Vercel Postgres** (free tier)
- **Supabase** (Postgres + auth + storage)
- **Neon** (serverless Postgres)

Update `prisma/schema.prisma` datasource provider if switching from SQLite.

---

## 🧪 Development

```bash
# Lint
bun run lint

# Reset database ( wipes all data )
bun run db:reset

# Re-seed
bun run scripts/seed.ts

# View database with Prisma Studio
bunx prisma studio
```

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `bun run dev` | Start Next.js dev server (port 3000) |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push schema to SQLite DB |
| `bun run db:generate` | Regenerate Prisma Client |
| `bun run db:migrate` | Create a Prisma migration |
| `bun run db:reset` | Reset DB (destructive) |
| `bun run scripts/seed.ts` | Seed 12 products + demo user |

---

## 🤝 Admin Access

To make a user an admin, edit `src/lib/auth.ts`:

```typescript
const ADMIN_EMAILS = [
  "isabella.laurent@example.com",  // demo
  "admin@maison-elegance.com",
  "your-email@example.com",        // ← add yours here
];
```

Then sign in with that email — the "Admin Dashboard" option appears in the account menu dropdown.

---

## 📝 License

MIT — feel free to use this as a starter for your own e-commerce projects.

---

## 🙌 Credits

Built with ❤️ using Z.ai's fullstack development platform. Product images from [Unsplash](https://unsplash.com).

---

## 💬 Questions?

If you ran into any issues setting this up, check:
1. **Database not seeding?** Make sure `DATABASE_URL` in `.env` points to a writable path
2. **Socket.io not connecting?** Make sure the mini-service is running on port 3003
3. **Can't sign in?** Re-run `bun run scripts/seed.ts` to recreate the demo user
4. **Admin menu missing?** Add your email to `ADMIN_EMAILS` in `src/lib/auth.ts`

Happy building! 🛍️
