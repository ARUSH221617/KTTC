# Restore original Prisma schema from backup
# Usage: .\restore-schema.ps1

$schemaPath = ".\db\schema.prisma"
$backupPath = ".\db\schema.prisma.backup"

if (Test-Path $backupPath) {
    Copy-Item -Path $backupPath -Destination $schemaPath -Force
    Remove-Item -Path $backupPath -Force
    Write-Host "Original schema restored"
} else {
    Write-Host "Backup file not found. Cannot restore."
}