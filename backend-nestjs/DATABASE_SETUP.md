# Database Setup Guide

This guide explains how to automatically set up the database and tables when initializing the Voting System backend on any device.

## 🚀 Quick Start (Recommended)

### Option 1: Automatic Setup (Easiest)
The backend will automatically create the database and tables when you start it for the first time:

```bash
# Navigate to backend directory
cd backend-nestjs

# Install dependencies and start (auto-creates database)
npm run init:project
```

### Option 2: Manual Setup
If you prefer to set up the database manually:

```bash
# Navigate to backend directory
cd backend-nestjs

# Install dependencies
npm install

# Set up database
npm run setup:db

# Start the server
npm run start:dev
```

## 🔧 What Happens During Setup

### Automatic Database Initialization
When you start the application, the `PrismaService` automatically:

1. **Checks Environment**: Determines if it's in development or production mode
2. **Creates Database Schema**: 
   - If no migrations exist: Creates initial migration
   - If migrations exist: Runs all pending migrations
3. **Generates Prisma Client**: Creates the database client
4. **Creates Default Super Admin**: Sets up initial admin account
5. **Connects to Database**: Establishes connection

### Default Super Admin Account
After setup, you'll have access to a default super admin account:

- **Username**: `superadmin`
- **Password**: `superadmin123`
- **Email**: `superadmin@votingsystem.com`

⚠️ **Important**: Change the password after first login!

## 📋 Prerequisites

### 1. PostgreSQL Database
Make sure you have PostgreSQL installed and running:

```bash
# Windows (using Chocolatey)
choco install postgresql

# macOS (using Homebrew)
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Environment Configuration
Create a `.env` file in the `backend-nestjs` directory:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/voting_system_db"

# Application Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5174

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Email Configuration (for password reset)
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=your-gmail-password
```

### 3. Create Database
Create the database in PostgreSQL:

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE voting_system_db;

-- Create user (optional)
CREATE USER voting_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE voting_system_db TO voting_user;
```

## 🔄 Manual Database Commands

If you need to run database commands manually:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (without migrations)
npm run db:push

# Create and run migrations
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio

# Reset database (⚠️ WARNING: Deletes all data)
npx prisma migrate reset
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Make sure PostgreSQL is running
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL if not running
sudo systemctl start postgresql
```

#### 2. Permission Denied
```
Error: permission denied for database
```
**Solution**: Check your DATABASE_URL and user permissions
```sql
-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE voting_system_db TO your_username;
```

#### 3. Migration Conflicts
```
Error: migration conflicts detected
```
**Solution**: Reset and recreate migrations
```bash
# Reset database and migrations
npx prisma migrate reset

# Create fresh migration
npx prisma migrate dev --name init
```

#### 4. Prisma Client Not Generated
```
Error: PrismaClient is not generated
```
**Solution**: Generate the client
```bash
npx prisma generate
```

### Environment-Specific Setup

#### Windows
```powershell
# Install PostgreSQL
choco install postgresql

# Start PostgreSQL service
net start postgresql-x64-15

# Create database
psql -U postgres -c "CREATE DATABASE voting_system_db;"
```

#### macOS
```bash
# Install PostgreSQL
brew install postgresql

# Start PostgreSQL
brew services start postgresql

# Create database
createdb voting_system_db
```

#### Linux (Ubuntu/Debian)
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres createdb voting_system_db
```

## 📊 Database Schema Overview

The application creates the following tables:

- **admins**: Admin user accounts
- **departments**: Department information
- **courses**: Course information
- **positions**: Election positions
- **candidates**: Candidate information
- **voters**: Voter accounts
- **elections**: Election details
- **votes**: Vote records
- **election_positions**: Election-position relationships
- **election_candidates**: Election-candidate relationships
- **password_reset_tokens**: Password reset functionality
- **audit_logs**: System audit trail

## 🔒 Security Notes

1. **Change Default Password**: Always change the default superadmin password
2. **Environment Variables**: Never commit `.env` files to version control
3. **Database Permissions**: Use least-privilege database users in production
4. **SSL Connection**: Enable SSL for database connections in production

## 📞 Support

If you encounter issues:

1. Check the console output for detailed error messages
2. Verify your PostgreSQL installation and configuration
3. Ensure your `.env` file is properly configured
4. Check that the database exists and is accessible

For additional help, check the main README.md file or create an issue in the project repository. 