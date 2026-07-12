# Database Setup Instructions

## Prerequisites
1. Install PostgreSQL on your system
2. Create a database named `coupdepouce_db`

## Windows Setup with PostgreSQL

### Option 1: Using PostgreSQL Installer
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer with default settings
3. Set a password for the postgres user
4. Install pgAdmin (included with installer)

### Option 2: Using Docker
```bash
docker run --name coupdepouce-db -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_DB=coupdepouce_db -p 5432:5432 -d postgres:latest
```

## Database Configuration

### 1. Create the database
```sql
-- Using psql or pgAdmin
CREATE DATABASE coupdepouce_db;
```

### 2. Update .env file
Update the DATABASE_URL in your .env file:
```
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/coupdepouce_db"
```

### 3. Run migrations
```bash
npx prisma migrate dev --name init
```

### 4. Generate Prisma client
```bash
npx prisma generate
```

## Verification
To verify the database is working:
```bash
npx prisma db push
npx prisma studio
```

## Common Issues
- Make sure PostgreSQL service is running
- Check that the database name matches
- Verify the connection string credentials
- Ensure port 5432 is available
