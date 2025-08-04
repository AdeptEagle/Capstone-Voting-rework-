# Voting System Database Setup Script for Windows
# This script automatically sets up the database and starts the application

Write-Host "🚀 Voting System Database Setup for Windows" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# Check if we're in the correct directory
if (-not (Test-Path "prisma\schema.prisma")) {
    Write-Host "❌ Error: Prisma schema not found. Please run this script from the backend-nestjs directory." -ForegroundColor Red
    exit 1
}

try {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to install dependencies"
    }

    Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
    npx prisma generate
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to generate Prisma client"
    }

    Write-Host "🗄️  Setting up database schema..." -ForegroundColor Yellow
    
    # Check if migrations exist
    if (-not (Test-Path "prisma\migrations")) {
        Write-Host "📦 Creating initial migration..." -ForegroundColor Yellow
        npx prisma migrate dev --name init
    } else {
        Write-Host "📦 Running existing migrations..." -ForegroundColor Yellow
        npx prisma migrate deploy
    }
    
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to set up database schema"
    }

    Write-Host ""
    Write-Host "✅ Database setup completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Your database is ready to use!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Start the server: npm run start:dev" -ForegroundColor White
    Write-Host "   2. Access the API: http://localhost:3001" -ForegroundColor White
    Write-Host "   3. View documentation: http://localhost:3001/api" -ForegroundColor White
    Write-Host "   4. Login with default superadmin:" -ForegroundColor White
    Write-Host "      Username: superadmin" -ForegroundColor White
    Write-Host "      Password: superadmin123" -ForegroundColor White
    Write-Host ""
    
    # Ask if user wants to start the server
    $startServer = Read-Host "Do you want to start the server now? (y/n)"
    if ($startServer -eq "y" -or $startServer -eq "Y") {
        Write-Host "🚀 Starting the server..." -ForegroundColor Green
        npm run start:dev
    }

} catch {
    Write-Host "❌ Database setup failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   1. Make sure PostgreSQL is running" -ForegroundColor White
    Write-Host "   2. Check your DATABASE_URL in .env file" -ForegroundColor White
    Write-Host "   3. Ensure you have proper database permissions" -ForegroundColor White
    Write-Host "   4. Try running: npx prisma db push" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 For more help, see DATABASE_SETUP.md" -ForegroundColor Cyan
    exit 1
} 