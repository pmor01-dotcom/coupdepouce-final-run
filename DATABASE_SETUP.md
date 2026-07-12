# Database Setup Guide

## ✅ Development Setup (Complete)

The database is now fully configured for development using SQLite:

- **Database File**: `prisma/dev.db`
- **Schema**: Compatible with SQLite (strings instead of enums)
- **Connection**: Working via `lib/prisma.ts`
- **Migrations**: Applied and synced

## 🚀 Production Setup Instructions

### Option 1: PostgreSQL (Recommended for Production)

1. **Update Prisma Schema**:
   ```bash
   # Edit prisma/schema.prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Restore Enum Types** (for PostgreSQL):
   ```prisma
   enum Role {
     CLIENT
     ARTISAN
   }
   
   enum DemandStatus {
     OPEN
     IN_PROGRESS
     COMPLETED
     CANCELLED
   }
   // ... other enums
   ```

3. **Set Environment Variables**:
   ```bash
   DATABASE_URL="postgresql://username:password@host:port/database"
   ```

4. **Run Migrations**:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

### Option 2: Continue with SQLite (Simple)

1. **Deploy the dev.db file** to your server
2. **Update DATABASE_URL** in production:
   ```bash
   DATABASE_URL="file:./dev.db"
   ```

## 📋 Database Schema Overview

### Tables Created:
- **users**: Client and artisan accounts
- **demands**: Client job requests
- **proposals**: Artisan proposals for demands
- **messages**: Communication between users
- **subscriptions**: Payment subscriptions

### Key Features:
- ✅ User roles (CLIENT/ARTISAN)
- ✅ Demand status tracking
- ✅ Proposal management
- ✅ Messaging system
- ✅ Subscription handling

## 🔧 Development Commands

```bash
# Generate Prisma Client
npx prisma generate

# Push schema changes to database
npx prisma db push

# View database
npx prisma studio

# Reset database (development only)
npx prisma migrate reset --force
```

## 🚨 Important Notes

1. **Development**: Currently using SQLite for easy local development
2. **Production**: Recommend PostgreSQL for better performance and features
3. **Enums**: SQLite uses strings, PostgreSQL supports proper enums
4. **Backups**: Regular database backups recommended for production
5. **Security**: Use environment variables for database credentials

## 📁 Files Modified/Created

- ✅ `prisma/schema.prisma` - Database schema
- ✅ `lib/prisma.ts` - Database connection
- ✅ `.env.local` - Environment configuration
- ✅ `prisma/dev.db` - SQLite database file

The database is ready for development and can be easily migrated to production PostgreSQL when needed.
