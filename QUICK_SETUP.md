# ⚡ Quick Setup Guide

Get your Modern Voting System running in 5 minutes!

## 🚀 Prerequisites

- Node.js 18+
- PostgreSQL 15+ (or Docker)
- Git

## 📦 Quick Start

### 1. Clone & Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd voting-system

# Install backend dependencies
cd backend-nestjs
npm install

# Install frontend dependencies
cd ../frontend-nextjs
npm install
```

### 2. Database Setup

#### Option A: Local PostgreSQL
```bash
# Create database
createdb voting_system

# Set environment variable
export DATABASE_URL="postgresql://localhost:5432/voting_system"
```

#### Option B: Docker (Recommended)
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

### 3. Backend Setup

```bash
# Navigate to backend
cd backend-nestjs

# Create environment file
cp env.example .env

# Edit .env with your settings
# DATABASE_URL=postgresql://postgres:password@localhost:5432/voting_system
# JWT_SECRET=your-super-secret-jwt-key

# Setup database
npm run db:generate
npm run db:push

# Start backend
npm run start:dev
```

### 4. Frontend Setup

```bash
# Navigate to frontend
cd frontend-nextjs

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# Start frontend
npm run dev
```

### 5. Access Your App

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api

## 🎯 Default Credentials

### SuperAdmin
- **Username**: `superadmin`
- **Password**: `superadmin123`
- **Access**: Full system control

### Admin
- **Username**: `admin1`
- **Password**: `admin123`
- **Access**: Election management

### Voter
- **Email**: Any seeded voter email
- **Password**: `voter123`
- **Access**: Voting interface

## 🔧 Development Commands

### Backend
```bash
cd backend-nestjs

# Development
npm run start:dev

# Build
npm run build

# Test
npm run test

# Database
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:studio      # Open Prisma Studio
```

### Frontend
```bash
cd frontend-nextjs

# Development
npm run dev

# Build
npm run build

# Test
npm run test

# Type check
npm run type-check
```

## 🐳 Docker Setup (Alternative)

### Complete Stack with Docker Compose

```bash
# Start everything with Docker
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Individual Services

```bash
# Database only
docker run --name voting-db \
  -e POSTGRES_DB=voting_system \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15-alpine

# Backend with Docker
cd backend-nestjs
docker build -t voting-backend .
docker run -p 3001:3001 --env-file .env voting-backend
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Database Connection
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Test connection
psql -h localhost -U postgres -d voting_system
```

#### 2. Port Conflicts
```bash
# Check what's using port 3001
lsof -i :3001

# Kill process if needed
kill -9 <PID>
```

#### 3. Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run dev
```

#### 4. Prisma Issues
```bash
# Reset Prisma
npx prisma generate
npx prisma db push

# If database is corrupted
npx prisma migrate reset
```

### Environment Variables

#### Backend (.env)
```env
# Required
DATABASE_URL="postgresql://postgres:password@localhost:5432/voting_system"
JWT_SECRET="your-super-secret-jwt-key"

# Optional
PORT=3001
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## 📊 Health Checks

### Backend Health
```bash
# Test API health
curl http://localhost:3001/health

# Test database connection
curl http://localhost:3001/health/db
```

### Frontend Health
```bash
# Check if Next.js is running
curl http://localhost:3000

# Check API connection
curl http://localhost:3000/api/health
```

## 🚀 Production Ready

### Environment Variables for Production

```env
# Backend (.env)
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET="your-super-secret-jwt-key-change-this"
NODE_ENV=production
CORS_ORIGIN="https://your-frontend-domain.vercel.app"

# Frontend (.env.local)
NEXT_PUBLIC_API_URL="https://your-backend-domain.railway.app"
```

### Build for Production

```bash
# Backend
cd backend-nestjs
npm run build
npm run start:prod

# Frontend
cd frontend-nextjs
npm run build
npm run start
```

## 📚 Next Steps

1. **Explore the Codebase**
   - Check `backend-nestjs/src/` for API structure
   - Check `frontend-nextjs/src/` for UI components

2. **Customize the System**
   - Modify Prisma schema in `prisma/schema.prisma`
   - Update UI components in `frontend-nextjs/src/components/`
   - Add new API endpoints in `backend-nestjs/src/`

3. **Deploy to Production**
   - Follow the [Deployment Guide](./DEPLOYMENT_GUIDE.md)
   - Set up monitoring and logging
   - Configure security settings

4. **Add Features**
   - Real-time updates with WebSockets
   - Email notifications
   - Advanced analytics
   - Mobile app

## 🆘 Need Help?

- **Documentation**: Check the main [README.md](./README.md)
- **Deployment**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Issues**: Open an issue in the repository
- **Community**: Join our Discord/Telegram

---

**Happy Coding! 🚀** 