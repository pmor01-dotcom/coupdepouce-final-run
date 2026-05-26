# Supabase Connection Troubleshooting

## Step 1: Get Exact Connection String

1. **Go to your Supabase project dashboard**
2. **Click Settings** (gear icon left sidebar)
3. **Click "Database"**
4. **Scroll down to "Connection string"**
5. **Copy the "URI" exactly as shown**
6. **Look for this format:**
```
postgresql://postgres.[PROJECT_ID]:[PASSWORD]@[HOST]:5432/postgres
```

## Step 2: Common Connection Issues

### Issue 1: Wrong Password
- Make sure you're using the **exact password** from project creation
- Not your Supabase account password

### Issue 2: Project Not Ready
- New projects take 2-3 minutes to provision
- Check if database status is "Active" in dashboard

### Issue 3: Wrong Region/Host
- Verify the host matches your project region
- Example hosts:
  - `aws-0-eu-west-1.pooler.supabase.co`
  - `db.abcdefg.supabase.co`
  - `aws-0-us-east-1.pooler.supabase.co`

## Step 3: Alternative Connection Methods

### Method A: Direct SQL (Manual Setup)
1. **Go to Supabase SQL Editor**
2. **Click "New query"**
3. **Paste this SQL:**

```sql
-- Create all tables manually
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

CREATE TABLE "messages" (
    "id" SERIAL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "sender_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "receiver_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "proposal_id" INTEGER REFERENCES "proposals"("id") ON DELETE CASCADE,
    "demand_id" INTEGER REFERENCES "demands"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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
```

### Method B: Test Connection First
1. **Test with simple connection:**
```bash
npx prisma db pull
```

2. **If that works, then try:**
```bash
npx prisma generate
npx prisma db push
```

## Step 4: Quick Fix Options

### Option 1: Use Supabase SQL Editor (Recommended)
- Skip Prisma migration for now
- Set up tables manually in Supabase
- Then connect your app

### Option 2: Reset Connection String
- Get fresh connection string from Supabase
- Update .env file completely
- Try migration again

### Option 3: Use Pooler Connection
- Some Supabase projects need pooler URL
- Format: `postgresql://postgres.[PROJECT_ID]:[PASSWORD]@[PROJECT_ID].pooler.supabase.co:6543/postgres`

## What to Do Now

1. **Check your Supabase dashboard** - is the database active?
2. **Get the exact connection string** from Settings > Database
3. **Try the manual SQL setup** if Prisma keeps failing
4. **Let me know the exact error** you see in Supabase

The manual SQL setup will get your database working immediately, then we can fix the Prisma connection later.
