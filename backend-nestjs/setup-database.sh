#!/bin/bash

# Voting System Database Setup Script for Unix/Linux/macOS
# This script automatically sets up the database and starts the application

echo "🚀 Voting System Database Setup"
echo "================================"
echo ""

# Check if we're in the correct directory
if [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ Error: Prisma schema not found. Please run this script from the backend-nestjs directory."
    exit 1
fi

# Function to handle errors
handle_error() {
    echo "❌ Database setup failed: $1"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   1. Make sure PostgreSQL is running"
    echo "   2. Check your DATABASE_URL in .env file"
    echo "   3. Ensure you have proper database permissions"
    echo "   4. Try running: npx prisma db push"
    echo ""
    echo "📖 For more help, see DATABASE_SETUP.md"
    exit 1
}

# Set up error handling
set -e
trap 'handle_error "$BASH_COMMAND"' ERR

echo "📦 Installing dependencies..."
npm install

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🗄️  Setting up database schema..."

# Check if migrations exist
if [ ! -d "prisma/migrations" ]; then
    echo "📦 Creating initial migration..."
    npx prisma migrate dev --name init
else
    echo "📦 Running existing migrations..."
    npx prisma migrate deploy
fi

echo ""
echo "✅ Database setup completed successfully!"
echo ""
echo "🎉 Your database is ready to use!"
echo ""
echo "📋 Next steps:"
echo "   1. Start the server: npm run start:dev"
echo "   2. Access the API: http://localhost:3001"
echo "   3. View documentation: http://localhost:3001/api"
echo "   4. Login with default superadmin:"
echo "      Username: superadmin"
echo "      Password: superadmin123"
echo ""

# Ask if user wants to start the server
read -p "Do you want to start the server now? (y/n): " startServer
if [[ $startServer == "y" || $startServer == "Y" ]]; then
    echo "🚀 Starting the server..."
    npm run start:dev
fi 