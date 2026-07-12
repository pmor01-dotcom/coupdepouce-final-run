# PostgreSQL Installation Guide for Windows

## Method 1: Official PostgreSQL Installer (Recommended)

### Step 1: Download PostgreSQL
1. Go to https://www.postgresql.org/download/windows/
2. Click "Download the installer"
3. Select the latest stable version (e.g., PostgreSQL 16)
4. Download the Windows x86-64 installer

### Step 2: Run the Installer
1. Right-click the installer and "Run as administrator"
2. Click "Next" through the welcome screen
3. Choose installation directory (default: `C:\Program Files\PostgreSQL\16`)
4. Select components to install (keep defaults)
5. Set data directory (default: `C:\Program Files\PostgreSQL\16\data`)
6. **Important**: Set password for `postgres` user (remember this password!)
7. Set port to `5432` (default)
8. Select locale (default: `Default locale`)
9. Click "Next" and then "Install"

### Step 3: Verify Installation
1. Open Command Prompt as administrator
2. Run: `psql --version`
3. Should show PostgreSQL version

### Step 4: Start PostgreSQL Service
1. Open Windows Services (services.msc)
2. Find "postgresql-x64-16" service
3. Ensure it's running (Start if not running)
4. Set startup type to "Automatic"

## Method 2: Using Chocolatey Package Manager

### Step 1: Install Chocolatey (if not installed)
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

### Step 2: Install PostgreSQL
```powershell
choco install postgresql --params '/Password:yourpassword'
```

## Method 3: Using Docker (Alternative)

### Step 1: Install Docker Desktop
1. Download from https://www.docker.com/products/docker-desktop/
2. Install and restart computer

### Step 2: Run PostgreSQL Container
```powershell
docker run --name coupdepouce-db -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_DB=coupdepouce_db -p 5432:5432 -d postgres:latest
```

## Post-Installation Setup

### Step 1: Create Database
```sql
-- Using psql command line
psql -U postgres -c "CREATE DATABASE coupdepouce_db;"

-- Or using pgAdmin (GUI tool included with installation)
```

### Step 2: Update .env File
Update your `.env` file with your database credentials:
```
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/coupdepouce_db"
```

### Step 3: Test Connection
```bash
npx prisma db push
```

## Common Issues & Solutions

### Issue: "psql: command not found"
**Solution**: Add PostgreSQL to PATH
1. Go to Environment Variables
2. Add `C:\Program Files\PostgreSQL\16\bin` to PATH
3. Restart terminal

### Issue: Service won't start
**Solution**: Check port conflicts
1. Open Task Manager
2. Kill processes using port 5432
3. Restart PostgreSQL service

### Issue: Connection refused
**Solution**: Check firewall
1. Allow PostgreSQL through Windows Firewall
2. Ensure service is running

## Verification Commands

### Check PostgreSQL Version
```bash
psql --version
```

### List Databases
```bash
psql -U postgres -l
```

### Connect to Database
```bash
psql -U postgres -d coupdepouce_db
```

### Check Service Status
```bash
sc query postgresql-x64-16
```

## Next Steps After Installation

1. Update your `.env` file with correct DATABASE_URL
2. Run `npx prisma migrate dev --name init`
3. Run `npx prisma generate`
4. Test with `npx prisma studio`

## Recommended Tools

- **pgAdmin**: GUI tool for database management (included with installer)
- **DBeaver**: Free universal database tool
- **Postico**: Modern PostgreSQL client (paid)
