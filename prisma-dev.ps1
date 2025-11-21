# prisma-dev.ps1 - Complete Prisma workflow for development with SQLite

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("migrate", "push", "studio", "generate", "init")]
    [string]$Command = "migrate"
)

# Set environment variables for SQLite
$originalDatabaseUrl = $env:DATABASE_URL
$env:DATABASE_URL = "file:./dev.db"

# Switch schema to SQLite configuration
.\swap-schema.ps1 sqlite

try {
    if ($Command -eq "migrate") {
        Write-Host "Running Prisma migrate for SQLite..."
        npx prisma migrate dev
    } elseif ($Command -eq "push") {
        Write-Host "Running Prisma db push for SQLite..."
        npx prisma db push
    } elseif ($Command -eq "studio") {
        Write-Host "Starting Prisma Studio for SQLite..."
        npx prisma studio
    } elseif ($Command -eq "generate") {
        Write-Host "Generating Prisma client for SQLite..."
        npx prisma generate
    } elseif ($Command -eq "init") {
        Write-Host "Initializing SQLite database..."
        # Create the SQLite file if it doesn't exist
        if (!(Test-Path "dev.db")) {
            # Create an empty SQLite database file
            $connectionString = "Data Source=dev.db"
            # Create SQLite file using System.Data.SQLite (if available) or just touch the file
            # We'll just touch the file to create it
            New-Item -ItemType File -Path "dev.db" -Force | Out-Null
            Write-Host "Created dev.db file"
        }
        npx prisma db push
    }
} finally {
    # Always restore the original schema after operations
    .\restore-schema.ps1
    # Restore original DATABASE_URL
    if ($originalDatabaseUrl) {
        $env:DATABASE_URL = $originalDatabaseUrl
    } else {
        Remove-Item Env:\DATABASE_URL -ErrorAction SilentlyContinue
    }
}

Write-Host "Development Prisma command completed: $Command"