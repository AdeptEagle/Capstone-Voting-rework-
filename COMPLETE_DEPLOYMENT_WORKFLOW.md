# 🚀 Complete Deployment Workflow Guide
## Local Development ↔ Production Deployment

---

## 📋 **Table of Contents**
1. [Understanding Environment Configuration](#understanding-environment-configuration)
2. [Local Development Workflow](#local-development-workflow)
3. [Production Deployment Workflow](#production-deployment-workflow)
4. [Environment Switching Techniques](#environment-switching-techniques)
5. [Troubleshooting Common Issues](#troubleshooting-common-issues)
6. [Advanced Deployment Scenarios](#advanced-deployment-scenarios)

---

## 🔧 **Understanding Environment Configuration**

### **How Environment Variables Work**

Your application now uses **Vite's environment variable system**:

```javascript
// In your code, you can access:
import.meta.env.VITE_API_BASE_URL  // Your API URL
import.meta.env.VITE_WS_URL        // Your WebSocket URL
import.meta.env.MODE               // 'development' or 'production'
```

### **Environment Files Structure**
```
frontend/
├── .env.development     # Local development settings
├── .env.production      # Production settings
├── .env.local          # Local overrides (optional)
└── src/config/
    ├── environment.js  # Environment utilities
    └── constants.js    # Centralized configuration
```

---

## 🏠 **Local Development Workflow**

### **Step 1: Start Your Backend**
```bash
# Terminal 1 - Backend
cd backend-nestjs
npm run start:dev
# Backend runs on http://localhost:3001
```

### **Step 2: Start Your Frontend**
```bash
# Terminal 2 - Frontend
cd frontend
npm run dev
# Frontend runs on http://localhost:5174
```

### **What Happens Automatically:**
- ✅ Uses `.env.development` file
- ✅ API calls go to `http://localhost:3001`
- ✅ WebSocket connects to `http://localhost:3001`
- ✅ Images load from `http://localhost:3001/uploads/`

### **Your Current .env.development:**
```bash
VITE_API_BASE_URL=http://localhost:3001
VITE_WS_URL=http://localhost:3001
```

---

## 🚀 **Production Deployment Workflow**

### **Method 1: Using Environment Files**

#### **Step 1: Update Production Environment**
```bash
cd frontend

# Update .env.production with your actual domain
echo "VITE_API_BASE_URL=https://api.yourdomain.com" > .env.production
echo "VITE_WS_URL=https://api.yourdomain.com" >> .env.production
```

#### **Step 2: Build for Production**
```bash
# This automatically uses .env.production
npm run build
```

#### **Step 3: Deploy the Build**
```bash
# The dist/ folder contains your production build
# Deploy dist/ to your web server (nginx, apache, etc.)
```

### **Method 2: Using Environment Variables**

#### **Step 1: Set Environment Variables**
```bash
# Windows (PowerShell)
$env:VITE_API_BASE_URL="https://api.yourdomain.com"
$env:VITE_WS_URL="https://api.yourdomain.com"

# Linux/Mac
export VITE_API_BASE_URL="https://api.yourdomain.com"
export VITE_WS_URL="https://api.yourdomain.com"
```

#### **Step 2: Build with Environment Variables**
```bash
npm run build
```

### **Method 3: Docker Deployment**

#### **Create docker-compose.prod.yml:**
```yaml
version: '3.8'
services:
  frontend:
    build: 
      context: ./frontend
      args:
        - VITE_API_BASE_URL=https://api.yourdomain.com
        - VITE_WS_URL=https://api.yourdomain.com
    ports:
      - "80:80"
  
  backend:
    build: ./backend-nestjs
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/voting_system
      - FRONTEND_URL=https://yourdomain.com
    ports:
      - "3001:3001"
    depends_on:
      - db
  
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=voting_system
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

#### **Deploy with Docker:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔄 **Environment Switching Techniques**

### **Technique 1: Quick Local Testing with Production Build**

```bash
# Test production build locally
cd frontend
VITE_API_BASE_URL=http://localhost:3001 npm run build
npm run preview
# Now you can test the production build locally
```

### **Technique 2: Multiple Environment Files**

Create different environment files:

```bash
# .env.staging
VITE_API_BASE_URL=https://staging-api.yourdomain.com
VITE_WS_URL=https://staging-api.yourdomain.com

# .env.production
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_WS_URL=https://api.yourdomain.com
```

Build for different environments:
```bash
# Staging
cp .env.staging .env.production
npm run build

# Production
cp .env.production .env.production
npm run build
```

### **Technique 3: Dynamic Environment Switching**

Create a script `switch-env.js`:
```javascript
const fs = require('fs');
const path = require('path');

const environments = {
  local: {
    VITE_API_BASE_URL: 'http://localhost:3001',
    VITE_WS_URL: 'http://localhost:3001'
  },
  staging: {
    VITE_API_BASE_URL: 'https://staging-api.yourdomain.com',
    VITE_WS_URL: 'https://staging-api.yourdomain.com'
  },
  production: {
    VITE_API_BASE_URL: 'https://api.yourdomain.com',
    VITE_WS_URL: 'https://api.yourdomain.com'
  }
};

const env = process.argv[2];
if (!environments[env]) {
  console.error('Usage: node switch-env.js [local|staging|production]');
  process.exit(1);
}

const envContent = Object.entries(environments[env])
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

fs.writeFileSync('.env.production', envContent);
console.log(`✅ Switched to ${env} environment`);
```

Usage:
```bash
node switch-env.js local      # Switch to local
node switch-env.js staging    # Switch to staging
node switch-env.js production # Switch to production
npm run build
```

---

## 🛠️ **Troubleshooting Common Issues**

### **Issue 1: Environment Variables Not Loading**

**Problem:** `import.meta.env.VITE_API_BASE_URL` is undefined

**Solution:**
```bash
# Check if .env files exist
ls -la .env*

# Check if variables start with VITE_
# ❌ Wrong: API_BASE_URL=http://localhost:3001
# ✅ Correct: VITE_API_BASE_URL=http://localhost:3001
```

### **Issue 2: Build Uses Wrong Environment**

**Problem:** Production build still uses localhost

**Solution:**
```bash
# Check which .env file is being used
cat .env.production

# Force production build
NODE_ENV=production npm run build
```

### **Issue 3: CORS Issues in Production**

**Problem:** Frontend can't connect to backend

**Solution:**
```bash
# Backend .env should have:
FRONTEND_URL=https://your-frontend-domain.com

# Frontend .env.production should have:
VITE_API_BASE_URL=https://your-backend-domain.com
```

### **Issue 4: WebSocket Connection Fails**

**Problem:** WebSocket can't connect in production

**Solution:**
```bash
# Check WebSocket URL in .env.production
VITE_WS_URL=https://your-backend-domain.com

# Ensure backend supports WebSocket on production
# Check backend CORS configuration
```

---

## 🎯 **Advanced Deployment Scenarios**

### **Scenario 1: Multi-Environment Setup**

```bash
# Create environment-specific files
echo "VITE_API_BASE_URL=https://dev-api.yourdomain.com" > .env.development
echo "VITE_API_BASE_URL=https://staging-api.yourdomain.com" > .env.staging
echo "VITE_API_BASE_URL=https://api.yourdomain.com" > .env.production

# Build for different environments
npm run build                    # Uses .env.production
cp .env.staging .env.production
npm run build                    # Uses staging config
```

### **Scenario 2: CI/CD Pipeline**

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd frontend
          npm install
          
      - name: Build for production
        run: |
          cd frontend
          echo "VITE_API_BASE_URL=https://api.yourdomain.com" > .env.production
          echo "VITE_WS_URL=https://api.yourdomain.com" >> .env.production
          npm run build
          
      - name: Deploy to server
        run: |
          # Deploy dist/ folder to your server
          rsync -avz dist/ user@server:/var/www/html/
```

### **Scenario 3: Docker Multi-Stage Build**

Create `frontend/Dockerfile`:
```dockerfile
# Build stage
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_API_BASE_URL
ARG VITE_WS_URL
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build with environment variables:
```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://api.yourdomain.com \
  --build-arg VITE_WS_URL=https://api.yourdomain.com \
  -t voting-system-frontend .
```

---

## 📊 **Environment Comparison Table**

| Aspect | Local Development | Production |
|--------|------------------|------------|
| **API URL** | `http://localhost:3001` | `https://api.yourdomain.com` |
| **WebSocket** | `http://localhost:3001` | `https://api.yourdomain.com` |
| **Images** | `http://localhost:3001/uploads/` | `https://api.yourdomain.com/uploads/` |
| **CORS** | `http://localhost:5174` | `https://yourdomain.com` |
| **Build** | `npm run dev` | `npm run build` |
| **Environment File** | `.env.development` | `.env.production` |

---

## 🎉 **Quick Reference Commands**

### **Local Development:**
```bash
# Start backend
cd backend-nestjs && npm run start:dev

# Start frontend (in another terminal)
cd frontend && npm run dev
```

### **Production Build:**
```bash
# Method 1: Using .env.production
cd frontend && npm run build

# Method 2: Using environment variables
cd frontend
VITE_API_BASE_URL=https://api.yourdomain.com npm run build
```

### **Test Production Build Locally:**
```bash
cd frontend
VITE_API_BASE_URL=http://localhost:3001 npm run build
npm run preview
```

### **Switch Environments:**
```bash
# Switch to staging
cp .env.staging .env.production
npm run build

# Switch to production
cp .env.production .env.production
npm run build
```

---

## ✅ **Best Practices**

1. **Always test production build locally** before deploying
2. **Use environment variables** instead of hardcoded URLs
3. **Keep .env files in .gitignore** for security
4. **Document your deployment process** for team members
5. **Use CI/CD pipelines** for automated deployments
6. **Monitor your application** after deployment

---

## 🚀 **You're Ready!**

Your application is now **completely environment-aware** and ready for seamless switching between local development and production deployment. No more hardcoded URLs, no more deployment headaches! 🎉
