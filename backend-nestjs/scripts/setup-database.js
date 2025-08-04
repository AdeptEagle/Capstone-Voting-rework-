#!/usr/bin/env node

/**
 * Database Setup Script for Voting System
 * 
 * This script automatically sets up the database and tables when running
 * the application on a new device or environment.
 * 
 * Usage:
 *   node scripts/setup-database.js
 *   npm run setup:db
 */

const { execSync } = require('child_process');
const { existsSync } = require('fs');
const { join } = require('path');

console.log('🚀 Voting System Database Setup');
console.log('================================');

async function setupDatabase() {
  try {
    // Check if we're in the correct directory
    const prismaPath = join(process.cwd(), 'prisma', 'schema.prisma');
    if (!existsSync(prismaPath)) {
      console.error('❌ Error: Prisma schema not found. Please run this script from the backend-nestjs directory.');
      process.exit(1);
    }

    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    console.log('🗄️  Setting up database schema...');
    
    // Check if migrations exist
    const migrationsPath = join(process.cwd(), 'prisma', 'migrations');
    if (!existsSync(migrationsPath)) {
      console.log('📦 Creating initial migration...');
      execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
    } else {
      console.log('📦 Running existing migrations...');
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    }

    console.log('✅ Database setup completed successfully!');
    console.log('');
    console.log('🎉 Your database is ready to use!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Start the server: npm run start:dev');
    console.log('   2. Access the API: http://localhost:3001');
    console.log('   3. View documentation: http://localhost:3001/api');
    console.log('   4. Login with default superadmin:');
    console.log('      Username: superadmin');
    console.log('      Password: superadmin123');
    console.log('');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Make sure PostgreSQL is running');
    console.log('   2. Check your DATABASE_URL in .env file');
    console.log('   3. Ensure you have proper database permissions');
    console.log('   4. Try running: npx prisma db push');
    process.exit(1);
  }
}

// Run the setup
setupDatabase(); 