# ===========================================
# SCHEMA ROLLBACK SCRIPT
# ===========================================
# Use this script to quickly rollback schema changes
# Run this if you encounter any issues during field renaming
# ===========================================

Write-Host "🔄 Starting Schema Rollback Process..." -ForegroundColor Yellow

# Check if backup exists
$backupFile = "database-backups/schema-backup-20250826-renaming-before.prisma"
if (-not (Test-Path $backupFile)) {
    Write-Host "❌ Backup file not found: $backupFile" -ForegroundColor Red
    Write-Host "Please ensure the backup file exists before running rollback." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Backup file found: $backupFile" -ForegroundColor Green

# Stop the application if running
Write-Host "🛑 Stopping application processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait a moment for processes to stop
Start-Sleep -Seconds 2

# Backup current schema (just in case)
$currentSchema = "prisma/schema.prisma"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$currentBackup = "database-backups/schema-current-$timestamp.prisma"

if (Test-Path $currentSchema) {
    Copy-Item $currentSchema $currentBackup
    Write-Host "✅ Current schema backed up to: $currentBackup" -ForegroundColor Green
}

# Restore the original schema
Write-Host "📋 Restoring original schema..." -ForegroundColor Yellow
Copy-Item $backupFile $currentSchema

if (Test-Path $currentSchema) {
    Write-Host "✅ Schema restored successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to restore schema!" -ForegroundColor Red
    exit 1
}

# Reset Prisma client and database
Write-Host "🔄 Resetting Prisma client and database..." -ForegroundColor Yellow

try {
    # Generate Prisma client
    Write-Host "📦 Generating Prisma client..." -ForegroundColor Yellow
    npx prisma generate
    
    # Reset database (WARNING: This will clear all data!)
    Write-Host "⚠️  WARNING: This will reset the database and clear all data!" -ForegroundColor Red
    $confirm = Read-Host "Are you sure you want to continue? (yes/no)"
    
    if ($confirm -eq "yes") {
        Write-Host "🗄️  Resetting database..." -ForegroundColor Yellow
        npx prisma migrate reset --force
        Write-Host "✅ Database reset completed!" -ForegroundColor Green
    } else {
        Write-Host "⏭️  Skipping database reset. You may need to manually handle migrations." -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Error during Prisma operations: $_" -ForegroundColor Red
    Write-Host "You may need to manually run: npx prisma generate" -ForegroundColor Yellow
}

Write-Host "🎉 Schema rollback completed!" -ForegroundColor Green
Write-Host "📁 Original schema restored from: $backupFile" -ForegroundColor Cyan
Write-Host "📁 Current schema backed up to: $currentBackup" -ForegroundColor Cyan
Write-Host "🔄 You can now restart your application with the original schema." -ForegroundColor Green

# ===========================================
# ROLLBACK COMPLETE
# ===========================================
