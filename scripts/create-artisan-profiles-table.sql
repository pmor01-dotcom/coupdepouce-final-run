-- Create artisan_profiles table for separate artisan data
CREATE TABLE "artisan_profiles" (
    "id" INTEGER PRIMARY KEY REFERENCES "users"("id") ON DELETE CASCADE,
    "trade" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phone" TEXT,
    "experience_years" INTEGER,
    "specialties" TEXT[],
    "description" TEXT,
    "photo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX "artisan_profiles_id_idx" ON "artisan_profiles"("id");
