# ADDies Marketplace

A full-stack marketplace application built with the **tRPC Stack** for connecting customers with service vendors.
s
## Tech Stack

- **[Next.js 15](https://nextjs.org)** - React framework with App Router
- **[tRPC](https://trpc.io)** - End-to-end type-safe APIs
- **[Prisma](https://prisma.io)** - MongoDB ORM with Prisma Client
- **[NextAuth.js](https://next-auth.js.org)** - Authentication with Credentials provider
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework
- **[Zustand](https://zustand-demo.pmndrs.com)** - State management
- **[Zod](https://zod.dev)** - Schema validation

## Features

- **User Roles**: Customer, Vendor, Agent, Admin
- **Authentication**: Mobile/password login with JWT sessions
- **Bookings**: Create and manage service bookings
- **Vendor Management**: Vendor profiles and approval system
- **MongoDB Database**: All data stored in MongoDB Atlas

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- npm

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd marketplace
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your values:
```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/marketplace"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL=http://localhost:3000
```

5. Generate Prisma Client:
```bash
npx prisma generate
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── customer/          # Customer dashboard
│   └── vendor/            # Vendor dashboard
├── server/
│   ├── api/
│   │   ├── routers/       # tRPC routers
│   │   ├── trpc.ts        # tRPC context
│   │   └── root.ts        # Router aggregation
│   ├── auth/              # NextAuth configuration
│   └── db.ts              # Prisma client
├── trpc/                  # tRPC client setup
└── styles/                # Global CSS
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run typecheck` - TypeScript type checking

## Demo Credentials

| Role | Mobile | Password |
|------|--------|----------|
| Customer | 9876543210 | Customer@123 |
| Vendor | 9123456789 | Vendor@123 |
| Agent | 9988776655 | Agent@123 |
| Admin | 9000000001 | Admin@123# |

## Database Schema

Key models:
- `User` - All user types (Customer, Vendor, Agent, Admin)
- `Booking` - Service bookings with status tracking
- `VendorProfile` - Vendor-specific data
- `Category` / `SubCategory` - Service categories
- `Review` - Customer reviews for vendors

## Deployment

This application can be deployed on:
- **Vercel** (recommended)
- **Netlify**
- **Railway**
- **Render**

For MongoDB Atlas, ensure your cluster allows connections from your deployment URL.

## License

MIT