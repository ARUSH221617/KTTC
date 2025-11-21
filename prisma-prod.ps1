# prisma-prod.ps1 - Complete Prisma workflow for production with PostgreSQL

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("migrate", "push", "studio", "generate", "deploy")]
    [string]$Command = "deploy"
)

# Save original DATABASE_URL
$originalDatabaseUrl = $env:DATABASE_URL

# Set environment variables for PostgreSQL
$env:DATABASE_URL = $env:POSTGRES_URL

try {
    if ($Command -eq "migrate") {
        Write-Host "Running Prisma migrate for PostgreSQL development..."
        npx prisma migrate dev
    } elseif ($Command -eq "push") {
        Write-Host "Running Prisma db push for PostgreSQL..."
        npx prisma db push
    } elseif ($Command -eq "studio") {
        Write-Host "Starting Prisma Studio for PostgreSQL..."
        npx prisma studio
    } elseif ($Command -eq "generate") {
        Write-Host "Generating Prisma client for PostgreSQL..."
        npx prisma generate
    } elseif ($Command -eq "deploy") {
        Write-Host "Deploying Prisma migrations for production..."
        npx prisma migrate deploy
    }
} finally {
    # Restore original DATABASE_URL
    if ($originalDatabaseUrl) {
        $env:DATABASE_URL = $originalDatabaseUrl
    } else {
        Remove-Item Env:\DATABASE_URL -ErrorAction SilentlyContinue
    }
}

Write-Host "Production Prisma command completed: $Command"