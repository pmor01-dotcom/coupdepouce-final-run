# CoupDePouce Deployment Guide

## 1. Codebase Analysis

### Framework & Architecture
- **Framework**: Next.js 15.0.3 (React 18)
- **Architecture**: Full-stack application with App Router
- **Type**: Server-rendered with API routes (SSR + API)
- **Language**: TypeScript
- **Styling**: TailwindCSS

### Key Dependencies
- **Database**: Prisma ORM with PostgreSQL (Supabase)
- **Authentication**: Custom auth with bcryptjs
- **Real-time**: Socket.io (client & server)
- **Email**: Nodemailer
- **Payments**: Stripe (currently disabled)
- **State**: React hooks + Context providers

### Database Configuration
- **Development**: SQLite (prisma/dev.db)
- **Production**: PostgreSQL (Supabase)
- **Schema**: Users, Demands, Proposals, Messages, Subscriptions

---

## 2. Required Environment Variables

### Database
```
DATABASE_URL="postgresql://user:password@host:5432/database"
```

### Next.js Configuration
```
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

### Stripe (Optional - currently disabled)
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Email (Optional)
```
EMAIL_FROM="noreply@yourdomain.com"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

### Application
```
NODE_ENV="production"
APP_URL="https://yourdomain.com"
JWT_SECRET="generate-with-openssl-rand-base64-32"
```

---

## 3. Build Commands

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build for production
npm run build

# Start production server
npm start
```

---

## 4. Production Output Directory

- **Output**: `.next/` directory
- **Static assets**: `public/` directory
- **Server entry**: `.next/standalone/` (if using standalone output)

---

## 5. Deployment Blockers & Missing Configuration

### Critical Issues
1. **Database mismatch**: Schema uses SQLite but .env points to PostgreSQL
2. **Socket.io server**: Requires separate server process or WebSocket support
3. **Prisma migrations**: Need to be run on production database
4. **Environment variables**: Need production values

### Recommended Fixes
1. Update Prisma schema to use PostgreSQL for production
2. Configure Socket.io for production deployment
3. Set up production database and run migrations
4. Generate secure secrets for production

---

## 6. Hosting Platform Comparison

### Vercel ⭐⭐⭐⭐⭐ (RECOMMENDED)
**Pros:**
- Native Next.js support
- Automatic deployments from Git
- Built-in edge functions
- Free SSL certificates
- Easy environment variable management
- Preview deployments
- Excellent for beginners

**Cons:**
- Socket.io requires additional configuration (use Pusher or similar)
- Database hosting separate (but integrates well with Supabase)

**Verdict**: BEST CHOICE for ease of deployment and Next.js optimization

### Netlify ⭐⭐⭐⭐
**Pros:**
- Good Next.js support
- Free SSL
- Easy Git integration
- Edge functions

**Cons:**
- Socket.io support limited
- Requires additional configuration for API routes

**Verdict**: Good alternative, but Vercel has better Next.js support

### Render ⭐⭐⭐⭐
**Pros:**
- Supports full-stack apps
- Built-in PostgreSQL
- Good for Socket.io
- Free tier available

**Cons:**
- Slower cold starts
- Less optimized for Next.js than Vercel

**Verdict**: Good if you need Socket.io and want database included

### Railway ⭐⭐⭐
**Pros:**
- Full-stack support
- Built-in PostgreSQL
- Good for complex apps

**Cons:**
- More complex setup
- Higher learning curve
- Less beginner-friendly

**Verdict**: Good for advanced users, overkill for this project

### IONOS ⭐⭐
**Pros:**
- Traditional hosting
- Full control

**Cons:**
- NO native Next.js support
- Requires manual Node.js setup
- NO automatic SSL
- NO Git deployment
- Socket.io configuration complex
- High maintenance burden
- NOT beginner-friendly

**Verdict**: NOT RECOMMENDED - too complex for Next.js deployment

---

## 7. Recommended Deployment: Vercel + Supabase

### Why This Combination?
- **Vercel**: Best Next.js hosting, zero-config deployment
- **Supabase**: PostgreSQL database, real-time features, auth ready
- **Cost**: Both have generous free tiers
- **Ease**: Beginner-friendly with excellent documentation

---

## 8. Step-by-Step Deployment Checklist

### Phase 1: Preparation
- [ ] Update Prisma schema to use PostgreSQL
- [ ] Generate secure secrets (NEXTAUTH_SECRET, JWT_SECRET)
- [ ] Set up Supabase project
- [ ] Get Supabase database connection string
- [ ] Create production environment variables file

### Phase 2: Database Setup
- [ ] Update `prisma/schema.prisma` datasource to PostgreSQL
- [ ] Run `npx prisma db push` to sync schema to Supabase
- [ ] Verify database connection
- [ ] Seed initial data if needed

### Phase 3: Code Preparation
- [ ] Remove/disable Socket.io for Vercel (or switch to Pusher)
- [ ] Update all localhost URLs to production domain
- [ ] Test build locally: `npm run build`
- [ ] Test production start: `npm start`

### Phase 4: Vercel Deployment
- [ ] Create Vercel account
- [ ] Connect GitHub repository
- [ ] Import project to Vercel
- [ ] Configure environment variables in Vercel dashboard
- [ ] Deploy

### Phase 5: Post-Deployment
- [ ] Test all API endpoints
- [ ] Test authentication flow
- [ ] Test database operations
- [ ] Set up custom domain (optional)
- [ ] Configure DNS records

---

## 9. Optimizing for Beginner Deployment

### Simplified Approach
1. **Use Vercel** - Automatic deployment from GitHub
2. **Use Supabase** - Managed PostgreSQL with free tier
3. **Disable Socket.io temporarily** - Requires additional setup
4. **Use built-in auth** - No additional services needed

### Minimum Required Setup
- GitHub account (for Vercel deployment)
- Vercel account (free)
- Supabase account (free)
- Domain name (optional, Vercel provides free subdomain)

---

## 10. Production Deployment Plan

### Option A: Vercel (Recommended - Easiest)
```bash
# 1. Push code to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Deploy via Vercel dashboard
# - Import repository
# - Add environment variables
# - Click Deploy
```

### Option B: Render (Good for Socket.io)
```bash
# 1. Create build script
# 2. Deploy to Render with PostgreSQL
# 3. Configure environment variables
# 4. Deploy
```

### Option C: Self-hosted (IONOS - Not Recommended)
```bash
# Requires:
# - VPS setup
# - Node.js installation
# - Nginx configuration
# - SSL certificate setup
# - Process manager (PM2)
# - Manual deployments
# HIGHLY DISCOURAGED for beginners
```

---

## 11. Critical Configuration Changes Needed

### Update Prisma Schema
```prisma
// Change from:
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

// To:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Disable Socket.io for Vercel
Socket.io requires a persistent server connection. For Vercel:
- Comment out Socket.io imports
- Remove Socket.io server initialization
- Consider switching to Pusher or similar for real-time features

### Update Next.js Config
```typescript
// next.config.ts
const nextConfig = {
  output: 'standalone', // For containerized deployments
  // Add other production optimizations
}
```

---

## 12. Final Recommendation

**USE VERCEL + SUPABASE**

This combination provides:
- ✅ Easiest deployment
- ✅ Best Next.js performance
- ✅ Free tiers available
- ✅ Automatic SSL
- ✅ Git-based deployments
- ✅ Excellent documentation
- ✅ Beginner-friendly

**AVOID IONOS** for this project - it requires too much manual configuration and is not optimized for Next.js applications.

---

## 13. Quick Start Deployment Commands

```bash
# 1. Prepare for production
npm install
npx prisma generate

# 2. Update database schema
npx prisma db push

# 3. Build
npm run build

# 4. Test locally
npm start

# 5. Deploy to Vercel (via dashboard or CLI)
npm i -g vercel
vercel
```

---

## 14. Troubleshooting Common Issues

### Build Errors
- Check Node.js version (use 18.x or 20.x)
- Clear `.next` cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Database Connection
- Verify DATABASE_URL format
- Check Supabase connection pooling settings
- Ensure Prisma client is generated

### Environment Variables
- Never commit `.env` files
- Use Vercel dashboard for production env vars
- Prefix public vars with `NEXT_PUBLIC_`

---

## 15. Post-Deployment Monitoring

- Set up Vercel Analytics
- Monitor error logs in Vercel dashboard
- Check Supabase database usage
- Set up uptime monitoring (UptimeRobot or similar)
