# Swap Prisma schema between PostgreSQL and SQLite configurations
# Usage: .\swap-schema.ps1 postgresql or .\swap-schema.ps1 sqlite

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("postgresql", "sqlite")]
    [string]$DatabaseType
)

$schemaPath = ".\db\schema.prisma"
$backupPath = ".\db\schema.prisma.backup"

# Backup the original schema before modification
Copy-Item -Path $schemaPath -Destination $backupPath -Force

if ($DatabaseType -eq "postgresql") {
    $content = "datasource db {
  provider = `"postgresql`"
  url      = env(`"DATABASE_URL`")
}

generator client {
  provider        = `"prisma-client-js`"
}"
} else {
    $content = "datasource db {
  provider = `"sqlite`"
  url      = env(`"DATABASE_URL`")
}

generator client {
  provider        = `"prisma-client-js`"
}"
}

# Write content without BOM
$utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($schemaPath, $content, $utf8WithoutBom)

Write-Host "Schema switched to $DatabaseType configuration"