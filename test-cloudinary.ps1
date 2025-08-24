# Test Cloudinary Integration Script
# This script tests if Cloudinary is properly configured

Write-Host "☁️ Testing Cloudinary Integration..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "backend-nestjs")) {
    Write-Host "❌ Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Change to backend directory
Set-Location "backend-nestjs"

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file with your Cloudinary credentials" -ForegroundColor Yellow
    Write-Host "See CLOUDINARY_SETUP.md for instructions" -ForegroundColor Yellow
    exit 1
}

# Check if Cloudinary variables are set
$envContent = Get-Content ".env" -Raw
if ($envContent -notmatch "CLOUDINARY_CLOUD_NAME" -or 
    $envContent -notmatch "CLOUDINARY_API_KEY" -or 
    $envContent -notmatch "CLOUDINARY_API_SECRET") {
    Write-Host "❌ Cloudinary configuration missing from .env file!" -ForegroundColor Red
    Write-Host "Please add the following to your .env file:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "# ===== CLOUDINARY CONFIGURATION =====" -ForegroundColor Gray
    Write-Host "CLOUDINARY_CLOUD_NAME=`"your-cloud-name`"" -ForegroundColor Gray
    Write-Host "CLOUDINARY_API_KEY=`"your-api-key`"" -ForegroundColor Gray
    Write-Host "CLOUDINARY_API_SECRET=`"your-api-secret`"" -ForegroundColor Gray
    Write-Host ""
    Write-Host "See CLOUDINARY_SETUP.md for detailed instructions" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ .env file found with Cloudinary configuration" -ForegroundColor Green
Write-Host ""

# Check if dependencies are installed
if (-not (Test-Path "node_modules/cloudinary")) {
    Write-Host "📦 Installing Cloudinary dependency..." -ForegroundColor Yellow
    npm install cloudinary
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Cloudinary dependency" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Cloudinary dependency installed" -ForegroundColor Green
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

Write-Host "🚀 Running Cloudinary test..." -ForegroundColor Cyan
Write-Host ""

# Run the test
npm run test:cloudinary

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 Cloudinary integration test completed successfully!" -ForegroundColor Green
    Write-Host "💡 You can now upload images and they will be stored in Cloudinary" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Cloudinary integration test failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above and ensure your credentials are correct" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

