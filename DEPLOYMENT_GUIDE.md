# 🚀 Deployment Guide

Complete guide for deploying the Modern Voting System to production.

## 📋 Prerequisites

- GitHub repository with your code
- Vercel account (free tier available)
- Railway/Render account (free tier available)
- PostgreSQL database (Railway/Render/Supabase)

## 🎯 Deployment Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Vercel)      │◄──►│  (Railway/      │◄──►│  (PostgreSQL)   │
│   Next.js 14    │    │   Render)       │    │                 │
│                 │    │   NestJS        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎨 Frontend Deployment (Vercel)

### 1. Prepare Frontend

```bash
# Navigate to frontend
cd frontend-nextjs

# Install dependencies
npm install

# Build locally to test
npm run build
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Option B: GitHub Integration
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend-nextjs`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3. Environment Variables

In Vercel dashboard, add these environment variables:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

## 🔧 Backend Deployment (Railway)

### 1. Prepare Backend

```bash
# Navigate to backend
cd backend-nestjs

# Install dependencies
npm install

# Test build
npm run build
```

### 2. Deploy to Railway

#### Option A: Railway CLI
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

#### Option B: GitHub Integration
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Configure settings:
   - **Root Directory**: `backend-nestjs`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start:prod`

### 3. Environment Variables

In Railway dashboard, add these environment variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# Server
PORT=3001
NODE_ENV=production

# CORS
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

### 4. Database Setup

Railway provides PostgreSQL. After deployment:

```bash
# Connect to Railway shell
railway shell

# Run database migrations
npx prisma db push

# Generate Prisma client
npx prisma generate
```

## 🗄️ Database Setup

### Option A: Railway PostgreSQL (Recommended)

1. In Railway dashboard, add PostgreSQL service
2. Copy the connection string to your environment variables
3. The database will be automatically provisioned

### Option B: Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings > Database
4. Add to your environment variables

### Option C: Render PostgreSQL

1. In Render dashboard, create PostgreSQL service
2. Copy connection string to environment variables

## 🔒 Security Configuration

### 1. Environment Variables

**Never commit these to Git:**

```env
# Production JWT Secret (generate a strong one)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database URL
DATABASE_URL=postgresql://user:password@host:5432/database

# CORS Origins
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### 2. Generate Strong JWT Secret

```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. CORS Configuration

Update your backend CORS settings:

```typescript
// In main.ts
app.enableCors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
});
```

## 🚀 Alternative Deployment (Render)

### Backend on Render

1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `backend-nestjs`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Environment**: Node

### Database on Render

1. Create PostgreSQL service in Render
2. Use the provided connection string
3. Add to environment variables

## 📊 Monitoring & Analytics

### 1. Vercel Analytics

```bash
# Install Vercel Analytics
npm install @vercel/analytics

# Add to your app
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. Railway Monitoring

Railway provides built-in monitoring:
- Request logs
- Error tracking
- Performance metrics
- Resource usage

### 3. Custom Logging

```typescript
// Add to your NestJS app
import { Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  someMethod() {
    this.logger.log('This is a log message');
    this.logger.error('This is an error message');
  }
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: |
          cd frontend-nextjs
          npm install
          npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./frontend-nextjs

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: |
          cd backend-nestjs
          npm install
          npm run build
      # Railway/Render will auto-deploy on push
```

## 🧪 Testing Deployment

### 1. Health Check

```bash
# Test backend health
curl https://your-backend-url.railway.app/health

# Test frontend
curl https://your-frontend-url.vercel.app
```

### 2. Database Connection

```bash
# Test database connection
railway shell
npx prisma db push
```

### 3. API Testing

```bash
# Test authentication
curl -X POST https://your-backend-url.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check build logs
vercel logs
railway logs

# Test locally first
npm run build
```

#### 2. Database Connection
```bash
# Check database status
railway service list

# Test connection
npx prisma db push
```

#### 3. CORS Errors
- Verify CORS_ORIGIN in environment variables
- Check frontend URL matches backend CORS settings

#### 4. JWT Issues
- Ensure JWT_SECRET is set in production
- Check token expiration settings

### Debug Commands

```bash
# Railway
railway logs
railway shell

# Vercel
vercel logs
vercel inspect

# Database
npx prisma studio
npx prisma db push
```

## 📈 Performance Optimization

### 1. Frontend (Next.js)

```typescript
// Enable static generation
export const dynamic = 'force-static'

// Optimize images
import Image from 'next/image'

// Enable caching
export const revalidate = 3600 // 1 hour
```

### 2. Backend (NestJS)

```typescript
// Enable compression
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(compression());
  await app.listen(3001);
}
bootstrap();
```

### 3. Database

```sql
-- Add indexes for performance
CREATE INDEX idx_votes_election_id ON votes(election_id);
CREATE INDEX idx_votes_voter_id ON votes(voter_id);
CREATE INDEX idx_candidates_position_id ON candidates(position_id);
```

## 🔐 Security Checklist

- [ ] Strong JWT secret generated
- [ ] HTTPS enforced in production
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] Database connection encrypted
- [ ] Rate limiting implemented
- [ ] Input validation enabled
- [ ] Error messages sanitized
- [ ] Audit logging enabled

## 📊 Monitoring Setup

### 1. Uptime Monitoring

```bash
# Add to your package.json
{
  "scripts": {
    "health": "curl -f https://your-backend-url.railway.app/health"
  }
}
```

### 2. Error Tracking

```typescript
// Add Sentry or similar
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## 🎉 Success!

Your modern voting system is now deployed with:

- ✅ **Frontend**: Next.js 14 on Vercel
- ✅ **Backend**: NestJS on Railway/Render  
- ✅ **Database**: PostgreSQL in the cloud
- ✅ **Security**: JWT, CORS, HTTPS
- ✅ **Performance**: CDN, compression, caching
- ✅ **Monitoring**: Logs, metrics, health checks

**Next Steps:**
1. Test all functionality
2. Set up monitoring alerts
3. Configure backup strategies
4. Plan scaling strategies

---

**Happy Deploying! 🚀** 