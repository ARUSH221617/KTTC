# Prisma Multi-Environment Setup

This project is configured to use different databases in development and production:

- **Development**: SQLite (file:./dev.db)
- **Production**: PostgreSQL (from environment variables)

## Setup Instructions

### For Development (SQLite)

1. Make sure your `.env.development` file exists with:
   ```
   DATABASE_PROVIDER=sqlite
   DATABASE_URL=file:./dev.db
   ```

2. To run Prisma commands with SQLite, you need to temporarily change the schema. Run these commands:

   For PowerShell users (with execution policy enabled):
   ```powershell
   .\swap-schema.ps1 sqlite
   DATABASE_URL="file:./dev.db" npx prisma generate
   .\restore-schema.ps1
   ```

   For PowerShell users (if execution policy is restricted):
   ```powershell
   # First, enable script execution (run as Administrator):
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

   For Command Line users:
   ```cmd
   # Set environment and run commands
   set DATABASE_URL=file:./dev.db
   # temporarily edit db\schema.prisma and change provider to "sqlite"
   npx prisma generate
   # restore db\schema.prisma to use provider = "postgresql"
   ```

### For Production (PostgreSQL)

1. Make sure your production environment has:
   ```
   DATABASE_PROVIDER=postgresql
   DATABASE_URL=your_postgres_connection_string
   ```

2. Run Prisma commands normally:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

## Scripts Included

- `swap-schema.ps1`: Temporarily changes schema to use SQLite or PostgreSQL
- `restore-schema.ps1`: Restores the original PostgreSQL schema
- `prisma-dev.ps1`: Complete workflow for development environment
- `prisma-prod.ps1`: Complete workflow for production environment

## Alternative Approach

If you have issues running the scripts, you can manually:

1. Copy `db\schema.prisma` to `db\schema.prisma.bak`
2. Edit `db\schema.prisma` and change `provider = "postgresql"` to `provider = "sqlite"`
3. Set `DATABASE_URL=file:./dev.db`
4. Run your Prisma commands
5. Restore the original schema from the backup

## Environment Files

- `.env.development`: Used for development with SQLite
- `.env.production`: Used for production with PostgreSQL
- `.env`: Default environment (currently configured for PostgreSQL)