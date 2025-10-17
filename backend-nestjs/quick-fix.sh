#!/bin/bash

# Quick Fix for P3005 Error
echo "🔧 Quick fix for Prisma P3005 error..."

# Use db push instead of migrate deploy
echo "📊 Using db push to sync schema..."
npx prisma db push

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Start the application
echo "🌟 Starting application..."
npm run start:prod

