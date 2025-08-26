# Database Seeding Script for Voting System
# This script seeds the database with comprehensive test data

Write-Host "🌱 Starting Voting System Database Seeding..." -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

try {
    # Check if we're in the correct directory
    if (-not (Test-Path "prisma/schema.prisma")) {
        Write-Host "❌ Error: Prisma schema not found. Please run this script from the backend-nestjs directory." -ForegroundColor Red
        exit 1
    }

    # Install dependencies if needed
    Write-Host "📦 Checking dependencies..." -ForegroundColor Yellow
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
        npm install
    }

    # Generate Prisma client
    Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
    npx prisma generate

    # Run the seed script
    Write-Host "🌱 Running database seed script..." -ForegroundColor Yellow
    npm run db:seed

    Write-Host ""
    Write-Host "✅ Database seeding completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Start the server: npm run start:dev" -ForegroundColor White
    Write-Host "   2. Access the API: http://localhost:3001" -ForegroundColor White
    Write-Host "   3. View documentation: http://localhost:3001/api" -ForegroundColor White
    Write-Host ""
    Write-Host "🔑 Default login credentials:" -ForegroundColor Cyan
    Write-Host "   Superadmin: superadmin / superadmin123" -ForegroundColor White
    Write-Host "   Admin: admin / admin123" -ForegroundColor White
    Write-Host "   Voters: password123 (use any voter email)" -ForegroundColor White
    Write-Host ""
    Write-Host "🎯 The election is active and ready for voting!" -ForegroundColor Green

} catch {
    Write-Host "❌ Database seeding failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   1. Make sure PostgreSQL is running" -ForegroundColor White
    Write-Host "   2. Check your DATABASE_URL in .env file" -ForegroundColor White
    Write-Host "   3. Ensure you have proper database permissions" -ForegroundColor White
    Write-Host "   4. Try running: npx prisma db push" -ForegroundColor White
    exit 1
}

