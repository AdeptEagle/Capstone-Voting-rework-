# 🎯 Practical Examples: Local ↔ Production Switching

## **Real-World Scenarios with Step-by-Step Commands**

---

## 🏠 **Scenario 1: Daily Local Development**

### **What You Do Every Day:**
```bash
# Terminal 1: Start Backend
cd backend-nestjs
npm run start:dev
# ✅ Backend running on http://localhost:3001

# Terminal 2: Start Frontend  
cd frontend
npm run dev
# ✅ Frontend running on http://localhost:5174
# ✅ Automatically uses .env.development
```

### **What Happens Behind the Scenes:**
- Frontend reads `.env.development`:
  ```
  VITE_API_BASE_URL=http://localhost:3001
  VITE_WS_URL=http://localhost:3001
  ```
- All API calls go to `http://localhost:3001`
- WebSocket connects to `http://localhost:3001`
- Images load from `http://localhost:3001/uploads/`

---

## 🚀 **Scenario 2: Deploy to Production**

### **Step 1: Update Production Environment**
```bash
cd frontend

# Update with your actual domain
echo "VITE_API_BASE_URL=https://api.votingsystem.com" > .env.production
echo "VITE_WS_URL=https://api.votingsystem.com" >> .env.production
```

### **Step 2: Build for Production**
```bash
npm run build
# ✅ Creates optimized production build in dist/
# ✅ Uses .env.production automatically
```

### **Step 3: Deploy**
```bash
# Upload dist/ folder to your web server
# Example with rsync:
rsync -avz dist/ user@yourserver.com:/var/www/html/
```

---

## 🔄 **Scenario 3: Test Production Build Locally**

### **Before Deploying, Test Your Production Build:**
```bash
cd frontend

# Test production build with local backend
VITE_API_BASE_URL=http://localhost:3001 npm run build
npm run preview
# ✅ Now you can test production build locally
# ✅ Visit http://localhost:4173 to see production build
```

### **Why This is Important:**
- Catches production-specific issues early
- Tests optimized build performance
- Verifies environment variable loading

---

## 🐳 **Scenario 4: Docker Deployment**

### **Create Production Docker Setup:**

#### **Frontend Dockerfile:**
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
# Build with production environment variables
ARG VITE_API_BASE_URL
ARG VITE_WS_URL
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### **Build and Run:**
```bash
# Build frontend with production URLs
docker build \
  --build-arg VITE_API_BASE_URL=https://api.votingsystem.com \
  --build-arg VITE_WS_URL=https://api.votingsystem.com \
  -t voting-frontend .

# Run the container
docker run -p 80:80 voting-frontend
```

---

## 🔧 **Scenario 5: Multiple Environments**

### **Setup Staging Environment:**
```bash
cd frontend

# Create staging environment
echo "VITE_API_BASE_URL=https://staging-api.votingsystem.com" > .env.staging
echo "VITE_WS_URL=https://staging-api.votingsystem.com" >> .env.staging
```

### **Switch Between Environments:**
```bash
# Deploy to staging
cp .env.staging .env.production
npm run build
# Deploy dist/ to staging server

# Deploy to production
cp .env.production .env.production
npm run build
# Deploy dist/ to production server
```

---

## 🛠️ **Scenario 6: Troubleshooting**

### **Problem: Production Build Still Uses Localhost**

#### **Check Your Environment:**
```bash
cd frontend

# Check current .env.production
cat .env.production
# Should show: VITE_API_BASE_URL=https://api.votingsystem.com

# If it shows localhost, fix it:
echo "VITE_API_BASE_URL=https://api.votingsystem.com" > .env.production
echo "VITE_WS_URL=https://api.votingsystem.com" >> .env.production
```

#### **Force Production Build:**
```bash
# Clear any cached environment
rm -rf node_modules/.vite
npm run build
```

### **Problem: CORS Issues in Production**

#### **Backend Configuration:**
```bash
# backend-nestjs/.env
FRONTEND_URL=https://votingsystem.com
NODE_ENV=production
```

#### **Frontend Configuration:**
```bash
# frontend/.env.production
VITE_API_BASE_URL=https://api.votingsystem.com
VITE_WS_URL=https://api.votingsystem.com
```

---

## 📊 **Environment Comparison in Action**

### **Local Development:**
```bash
# What you see in browser console:
API calls: http://localhost:3001/auth/status
WebSocket: ws://localhost:3001
Images: http://localhost:3001/uploads/images/photo.jpg
```

### **Production:**
```bash
# What you see in browser console:
API calls: https://api.votingsystem.com/auth/status
WebSocket: wss://api.votingsystem.com
Images: https://api.votingsystem.com/uploads/images/photo.jpg
```

---

## 🎯 **Quick Commands Reference**

### **Daily Development:**
```bash
# Start everything
cd backend-nestjs && npm run start:dev &
cd frontend && npm run dev
```

### **Test Production Build:**
```bash
cd frontend
VITE_API_BASE_URL=http://localhost:3001 npm run build
npm run preview
```

### **Deploy to Production:**
```bash
cd frontend
echo "VITE_API_BASE_URL=https://api.yourdomain.com" > .env.production
echo "VITE_WS_URL=https://api.yourdomain.com" >> .env.production
npm run build
# Deploy dist/ folder
```

### **Switch Environments:**
```bash
# Staging
cp .env.staging .env.production && npm run build

# Production  
cp .env.production .env.production && npm run build
```

---

## ✅ **Verification Checklist**

### **Before Deploying:**
- [ ] `.env.production` has correct production URLs
- [ ] Production build tested locally with `npm run preview`
- [ ] Backend CORS configured for production domain
- [ ] Database migrations applied
- [ ] Environment variables set in production

### **After Deploying:**
- [ ] Frontend loads without errors
- [ ] API calls work (check browser network tab)
- [ ] WebSocket connects successfully
- [ ] Images load correctly
- [ ] Authentication works
- [ ] All features functional

---

## 🎉 **You're Now a Deployment Expert!**

With this setup, you can:
- ✅ **Develop locally** without any changes
- ✅ **Deploy to production** with simple commands
- ✅ **Test production builds** before deploying
- ✅ **Switch environments** easily
- ✅ **Troubleshoot issues** quickly

**No more hardcoded URLs, no more deployment headaches!** 🚀
