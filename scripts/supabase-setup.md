# Supabase Cloud Database Setup Guide

## Step 1: Create Supabase Account

1. **Go to https://supabase.com/**
2. **Click "Sign Up"** (top right)
3. **Sign up with GitHub** (recommended) or email
4. **Verify your email** if required

## Step 2: Create New Project

1. **Click "New Project"** (dashboard)
2. **Choose organization** (or create new one)
3. **Project settings:**
   - **Project Name**: `coupdepouce-app`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you (e.g., Europe West)
   - **Click "Create new project"**

## Step 3: Get Database Connection String

1. **Wait for project to be ready** (2-3 minutes)
2. **Go to Settings** (gear icon left sidebar)
3. **Click "Database"**
4. **Find "Connection string"**
5. **Copy the "URI"** (starts with `postgresql://`)

## Step 4: Update Your .env File

Replace your DATABASE_URL in `.env`:

```env
# Replace with your actual Supabase connection string
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

**Example format:**
```
DATABASE_URL="postgresql://postgres.abc123:yourpassword@aws-0-eu-west-1.pooler.supabase.co:6543/postgres"
```

## Step 5: Set Up Database Schema

### Option A: Use Prisma Migrate (Recommended)

1. **Open terminal in your project**
2. **Run migration:**
```bash
npx prisma migrate dev --name init
```

### Option B: Use Supabase SQL Editor

1. **Go to Supabase dashboard**
2. **Click "SQL Editor"** (left sidebar)
3. **Click "New query"**
4. **Paste this SQL:**

```sql
-- Create Users table
CREATE TABLE "users" (
    "id" SERIAL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL CHECK ("role" IN ('CLIENT', 'ARTISAN')),
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "department" TEXT,
    "metier" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_name" TEXT,
    "siret" TEXT,
    "insurance_number" TEXT,
    "experience_years" INTEGER,
    "work_hours" JSONB,
    "business_address" TEXT
);

-- Create Demands table
CREATE TABLE "demands" (
    "id" SERIAL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "budget_range" TEXT,
    "urgency" TEXT NOT NULL DEFAULT 'NORMAL' CHECK ("urgency" IN ('NORMAL', 'URGENT', 'VERY_URGENT')),
    "status" TEXT NOT NULL DEFAULT 'OPEN' CHECK ("status" IN ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    "client_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- Create Proposals table
CREATE TABLE "proposals" (
    "id" SERIAL PRIMARY KEY,
    "message" TEXT NOT NULL,
    "proposed_price" TEXT NOT NULL,
    "estimated_duration" TEXT,
    "availability" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING' CHECK ("status" IN ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN')),
    "demand_id" INTEGER NOT NULL REFERENCES "demands"("id") ON DELETE CASCADE,
    "artisan_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- Create Messages table
CREATE TABLE "messages" (
    "id" SERIAL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "sender_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "receiver_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "proposal_id" INTEGER REFERENCES "proposals"("id") ON DELETE CASCADE,
    "demand_id" INTEGER REFERENCES "demands"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Subscriptions table
CREATE TABLE "subscriptions" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "plan_type" TEXT NOT NULL DEFAULT 'MONTHLY' CHECK ("plan_type" IN ('MONTHLY', 'YEARLY')),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE' CHECK ("status" IN ('ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING')),
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3) NOT NULL,
    "auto_renew" BOOLEAN NOT NULL DEFAULT true,
    "payment_method" TEXT,
    "stripe_subscription_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "demands_client_id_idx" ON "demands"("client_id");
CREATE INDEX "proposals_demand_id_idx" ON "proposals"("demand_id");
CREATE INDEX "proposals_artisan_id_idx" ON "proposals"("artisan_id");
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");
CREATE INDEX "messages_receiver_id_idx" ON "messages"("receiver_id");
```

5. **Click "Run"** to execute

## Step 6: Test Database Connection

1. **Run Prisma commands:**
```bash
npx prisma generate
npx prisma db push
```

2. **Test with Prisma Studio:**
```bash
npx prisma studio
```

## Step 7: Verify Everything Works

1. **Start your development server:**
```bash
npm run dev
```

2. **Test signup/login** to ensure data is saved to Supabase

## Additional Supabase Features

### Enable Row Level Security (RLS)
1. **Go to Authentication** in Supabase dashboard
2. **Enable RLS** for better security
3. **Create policies** for data access

### View Database Tables
1. **Click "Table Editor"** in Supabase dashboard
2. **Browse your data** in real-time
3. **Add/edit records** manually if needed

### API Documentation
1. **Go to API** in Supabase dashboard
2. **View auto-generated REST API**
3. **Get API keys** for external access

## Troubleshooting

### Connection Issues
- **Check DATABASE_URL**: Ensure it matches Supabase exactly
- **Verify password**: Use the same password from project creation
- **Check firewall**: Ensure port 5432 is accessible

### Migration Issues
- **Use SQL Editor**: Manually run schema if Prisma fails
- **Check table names**: Ensure they match Prisma schema
- **Verify data types**: Make sure JSONB is supported

### Performance Tips
- **Enable connection pooling**: Use Supabase's pooler
- **Add indexes**: For frequently queried columns
- **Monitor usage**: Check Supabase dashboard for limits

## Free Tier Limits

- **Database size**: 500MB
- **Bandwidth**: 2GB/month
- **API calls**: 50,000/month
- **Active users**: 50,000

Perfect for development and small production apps!
