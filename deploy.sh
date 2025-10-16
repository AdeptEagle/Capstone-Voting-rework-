#!/bin/bash

echo "🚀 Starting Railway Deployment for Voting System"
echo "================================================"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Deploy Backend
echo "📦 Deploying Backend Service..."
cd backend-nestjs

echo "🔧 Setting Backend Environment Variables..."
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set JWT_SECRET=your-super-secure-jwt-secret-key-2024
railway variables set CLOUDINARY_CLOUD_NAME=damprbvmu
railway variables set CLOUDINARY_API_KEY=826829973838841
railway variables set CLOUDINARY_API_SECRET=fyWDTS0mcgN2ootzdZYdhK1ca4I
railway variables set FRONTEND_URL=https://ballotblitz.up.railway.app

echo "🚀 Deploying Backend..."
railway up

# Get backend URL
BACKEND_URL=$(railway domain)
echo "✅ Backend deployed at: $BACKEND_URL"

# Deploy Frontend
echo "📦 Deploying Frontend Service..."
cd ../frontend

echo "🔧 Setting Frontend Environment Variables..."
railway variables set VITE_API_BASE_URL=https://ballotblitz-server.up.railway.app
railway variables set VITE_WS_URL=https://ballotblitz-server.up.railway.app

echo "🚀 Deploying Frontend..."
railway up

# Get frontend URL
FRONTEND_URL=$(railway domain)
echo "✅ Frontend deployed at: $FRONTEND_URL"

# Setup Database
echo "🗄️ Setting up Database..."
cd ../backend-nestjs
echo "Running migrations..."
railway run npx prisma migrate deploy
echo "Seeding database..."
railway run npx prisma db seed

echo "🎉 Deployment Complete!"
echo "======================="
echo "Backend: https://ballotblitz-server.up.railway.app"
echo "Frontend: https://ballotblitz.up.railway.app"
echo "Health Check: https://ballotblitz-server.up.railway.app/health"
