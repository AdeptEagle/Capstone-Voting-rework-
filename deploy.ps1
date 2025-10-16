# Railway Deployment Script - Corrected Version
Write-Host "Starting Railway Deployment..." -ForegroundColor Green

# Check Railway CLI
Write-Host "Checking Railway CLI..." -ForegroundColor Yellow
try {
    railway --version
    Write-Host "Railway CLI found" -ForegroundColor Green
} catch {
    Write-Host "Installing Railway CLI..." -ForegroundColor Yellow
    npm install -g @railway/cli
}

# Login to Railway
Write-Host "Logging into Railway..." -ForegroundColor Yellow
railway login

# Deploy Backend
Write-Host "Deploying Backend..." -ForegroundColor Yellow
Set-Location "C:\Users\Eagle\Desktop\Capstone-Voting-rework-\backend-nestjs"

Write-Host "Linking to Railway project..." -ForegroundColor Cyan
railway link

# If no service exists, create one
Write-Host "Checking for existing service..." -ForegroundColor Cyan
railway status

Write-Host "Setting Backend Variables..." -ForegroundColor Cyan
railway variables --set "NODE_ENV=production"
railway variables --set "PORT=3001"
railway variables --set "JWT_SECRET=your-super-secure-jwt-secret-key-2024"
railway variables --set "CLOUDINARY_CLOUD_NAME=damprbvmu"
railway variables --set "CLOUDINARY_API_KEY=826829973838841"
railway variables --set "CLOUDINARY_API_SECRET=fyWDTS0mcgN2ootzdZYdhK1ca4I"
railway variables --set "FRONTEND_URL=https://frontend-production-xyz.up.railway.app"

Write-Host "Deploying Backend..." -ForegroundColor Yellow
railway up

# Get backend URL
$BACKEND_URL = railway domain
Write-Host "Backend deployed at: $BACKEND_URL" -ForegroundColor Green

# Deploy Frontend
Write-Host "Deploying Frontend..." -ForegroundColor Yellow
Set-Location "C:\Users\Eagle\Desktop\Capstone-Voting-rework-\frontend"

Write-Host "Creating new service for frontend..." -ForegroundColor Cyan
railway service
railway link

Write-Host "Setting Frontend Variables..." -ForegroundColor Cyan
railway variables --set "VITE_API_BASE_URL=https://backend-production-015c.up.railway.app"
railway variables --set "VITE_WS_URL=https://backend-production-015c.up.railway.app"

Write-Host "Deploying Frontend..." -ForegroundColor Yellow
railway up

# Get frontend URL
$FRONTEND_URL = railway domain
Write-Host "Frontend deployed at: $FRONTEND_URL" -ForegroundColor Green

# Setup Database
Write-Host "Setting up Database..." -ForegroundColor Yellow
Set-Location "C:\Users\Eagle\Desktop\Capstone-Voting-rework-\backend-nestjs"
Write-Host "Running migrations..." -ForegroundColor Cyan
railway run npx prisma migrate deploy
Write-Host "Seeding database..." -ForegroundColor Cyan
railway run npx prisma db seed

Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "Backend: https://ballotblitz-server.up.railway.app" -ForegroundColor White
Write-Host "Frontend: https://ballotblitz.up.railway.app" -ForegroundColor White
Write-Host "Health Check: https://ballotblitz-server.up.railway.app/health" -ForegroundColor White
