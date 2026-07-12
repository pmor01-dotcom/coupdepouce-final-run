-- Step 4: Create Messages table
CREATE TABLE "messages" (
    "id" SERIAL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "sender_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "receiver_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "proposal_id" INTEGER REFERENCES "proposals"("id") ON DELETE CASCADE,
    "demand_id" INTEGER REFERENCES "demands"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Step 5: Create Subscriptions table
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
