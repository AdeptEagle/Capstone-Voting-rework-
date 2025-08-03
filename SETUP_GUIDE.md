# 🛠️ Complete Setup Guide

Step-by-step guide to get your Modern Voting System fully operational.

## ✅ **Current Status**

- ✅ **Frontend**: Next.js 14 installed and building successfully
- ✅ **Backend**: NestJS installed and Prisma client generated
- ✅ **Dependencies**: All packages installed correctly
- ✅ **Build Process**: Both applications compile without errors

## 🔧 **Next Steps to Complete Setup**

### 1. **Database Setup**

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL locally
# Download from: https://www.postgresql.org/download/

# Create database
createdb voting_system

# Set environment variable
export DATABASE_URL="postgresql://localhost:5432/voting_system"
```

#### Option B: Docker PostgreSQL (Recommended)
```bash
# Start PostgreSQL with Docker
docker run --name voting-db \
  -e POSTGRES_DB=voting_system \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15-alpine

# Set environment variable
export DATABASE_URL="postgresql://postgres:password@localhost:5432/voting_system"
```

### 2. **Environment Configuration**

#### Backend Environment (.env)
```bash
# Navigate to backend
cd backend-nestjs

# Create .env file
cp env.example .env

# Edit .env with your settings:
```

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/voting_system"

# JWT Secret (generate a strong one)
JWT_SECRET="your-super-secret-jwt-key-change-this"

# Server
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:3000"
```

#### Frontend Environment (.env.local)
```bash
# Navigate to frontend
cd frontend-nextjs

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
```

### 3. **Database Migration**

```bash
# Navigate to backend
cd backend-nestjs

# Push schema to database
npx prisma db push

# Generate Prisma client (if not done already)
npx prisma generate
```

### 4. **Start Applications**

#### Option A: Use Startup Script
```powershell
# Run the startup script
.\start-dev.ps1
```

#### Option B: Manual Startup
```bash
# Terminal 1 - Backend
cd backend-nestjs
npm run start:dev

# Terminal 2 - Frontend
cd frontend-nextjs
npm run dev
```

## 🚀 **Access Your Applications**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs
- **Prisma Studio**: http://localhost:5555 (run `npx prisma studio`)

## 🧪 **Test Your Setup**

### 1. **Health Check**
```bash
# Test backend health
curl http://localhost:3001/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

### 2. **Database Connection**
```bash
# Test database connection
npx prisma db push

# Open Prisma Studio
npx prisma studio
```

### 3. **Frontend Test**
- Open http://localhost:3000
- You should see the landing page with modern UI

## 🔐 **Default Credentials**

Once you set up the database and run migrations, you can use these default credentials:

### SuperAdmin
- **Username**: `superadmin`
- **Password**: `superadmin123`

### Admin
- **Username**: `admin1`
- **Password**: `admin123`

### Voter
- **Email**: Any seeded voter email
- **Password**: `voter123`

## 🚨 **Troubleshooting**

### Common Issues

#### 1. **Database Connection Failed**
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Test connection
psql -h localhost -U postgres -d voting_system
```

#### 2. **Prisma Client Not Generated**
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

#### 3. **Port Already in Use**
```bash
# Check what's using the port
lsof -i :3001
lsof -i :3000

# Kill process if needed
kill -9 <PID>
```

#### 4. **Environment Variables Not Loaded**
```bash
# Check if .env file exists
ls -la backend-nestjs/.env

# Restart the application after changing .env
```

### Debug Commands

```bash
# Backend logs
cd backend-nestjs
npm run start:dev

# Frontend logs
cd frontend-nextjs
npm run dev

# Database logs
npx prisma studio
```

## 📊 **Verification Checklist**

- [ ] PostgreSQL database running
- [ ] Environment variables configured
- [ ] Database schema pushed
- [ ] Prisma client generated
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Health endpoint responds
- [ ] Frontend loads landing page
- [ ] API documentation accessible

## 🎯 **Next Development Steps**

1. **Create Authentication Pages**
   - Login/Register forms
   - Admin login
   - Password reset

2. **Build Core Features**
   - Election management
   - Candidate management
   - Voting interface
   - Results display

3. **Add Advanced Features**
   - Real-time updates
   - Email notifications
   - Analytics dashboard
   - Mobile responsiveness

## 🆘 **Need Help?**

- **Documentation**: Check README.md and QUICK_SETUP.md
- **Issues**: Open an issue in the repository
- **Community**: Join our Discord/Telegram

---

**Happy Coding! 🚀** 