#!/bin/bash

# Railway Deployment Script
echo "🚀 Starting Railway deployment..."

# Set environment variables for Railway
export NODE_ENV=production
export PORT=8080

# Run database migrations
echo "📊 Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Start the application
echo "🌟 Starting application..."
npm run start:prod
