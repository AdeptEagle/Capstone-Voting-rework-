# Ballot Test Data Seeding Script
# This script seeds the database with comprehensive test data for ballot creation testing

Write-Host "🎯 === Ballot Test Data Seeding ===" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the backend-nestjs directory" -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
}

# Check if Prisma client is generated
if (-not (Test-Path "node_modules/.prisma")) {
    Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
    npm run db:generate
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Prisma client generated" -ForegroundColor Green
}

# Run the seeding script
Write-Host "🌱 Running ballot test data seeding..." -ForegroundColor Yellow
Write-Host ""

npm run seed:ballot

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 === Seeding Complete! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 What was created:" -ForegroundColor Cyan
    Write-Host "   🏢 4 Departments (CS, Engineering, Business, Arts)" -ForegroundColor White
    Write-Host "   📚 6 Courses (CS301, CS302, CS303, ENG401, BUS501, ARTS601)" -ForegroundColor White
    Write-Host "   🎯 6 Positions (President, VP, Secretary, Treasurer, PRO, Rep)" -ForegroundColor White
    Write-Host "   👨‍💼 12 Candidates (Multiple per position)" -ForegroundColor White
    Write-Host "   🗳️ 5 Test Voters (Ready for testing)" -ForegroundColor White
    Write-Host ""
    Write-Host "🔑 Test Credentials:" -ForegroundColor Cyan
    Write-Host "   👤 SuperAdmin: superadmin / superadmin123" -ForegroundColor White
    Write-Host "   🗳️ Voters: Any voter email / voter123" -ForegroundColor White
    Write-Host ""
    Write-Host "🎯 You can now test the ballot creation process!" -ForegroundColor Green
    Write-Host "   • Login as superadmin" -ForegroundColor White
    Write-Host "   • Go to Ballot Creation" -ForegroundColor White
    Write-Host "   • Create positions and assign candidates" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ === Seeding Failed ===" -ForegroundColor Red
    Write-Host "Check the error messages above for details" -ForegroundColor Yellow
    exit 1
}
