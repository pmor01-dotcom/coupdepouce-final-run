-- Step 2: Create Demands table
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

-- Step 3: Create Proposals table
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
