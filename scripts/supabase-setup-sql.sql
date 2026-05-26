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
