#!/bin/bash

# Deployment Fix Script for P3005 Error
echo "🔧 Fixing Prisma P3005 migration error..."

# Set environment variables
export NODE_ENV=production
export PORT=8080

# Function to check if database has tables
check_database_tables() {
    npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public' AND table_name NOT LIKE '_prisma_migrations%';" 2>/dev/null | grep -o '[0-9]*' | head -1 || echo "0"
}

# Function to check if migrations table exists
check_migrations_table() {
    npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '_prisma_migrations';" 2>/dev/null | grep -o '[0-9]*' | head -1 || echo "0"
}

echo "🔍 Checking database state..."

# Check if we have a migrations table
MIGRATIONS_EXIST=$(check_migrations_table)
echo "Migrations table exists: $MIGRATIONS_EXIST"

# Check if we have other tables
TABLES_COUNT=$(check_database_tables)
echo "Other tables count: $TABLES_COUNT"

if [ "$MIGRATIONS_EXIST" = "1" ]; then
    echo "✅ Migrations table exists. Running migrate deploy..."
    npx prisma migrate deploy
elif [ "$TABLES_COUNT" -gt "0" ]; then
    echo "⚠️  Database has existing tables but no migrations table. Baselining database..."
    echo "📊 Marking existing migrations as applied..."
    npx prisma migrate resolve --applied "20250802190102_init_with_custom_ids" || echo "Migration already applied or not found"
    npx prisma migrate resolve --applied "20250803181817_add_audit_system" || echo "Migration already applied or not found"
    echo "📊 Running remaining migrations..."
    npx prisma migrate deploy
else
    echo "📊 Database is empty. Running migrations..."
    npx prisma migrate deploy
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Start the application
echo "🌟 Starting application..."
npm run start:prod

