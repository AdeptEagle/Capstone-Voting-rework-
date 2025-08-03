# Modern Voting System

A secure, transparent, and scalable digital voting platform built with modern technologies.

## 🚀 Tech Stack

### Frontend
- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for modern styling
- **React Hook Form** for form handling
- **Zod** for validation
- **Lucide React** for icons
- **Recharts** for data visualization

### Backend
- **NestJS** with TypeScript
- **Prisma** ORM
- **PostgreSQL** database
- **JWT** authentication
- **Swagger** API documentation
- **Class Validator** for DTO validation

### Deployment
- **Vercel** for frontend hosting
- **Railway/Render** for backend hosting
- **PostgreSQL** cloud database

## 📁 Project Structure

```
voting-system/
├── frontend-nextjs/          # Next.js 14+ Frontend
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── lib/            # Utilities and API client
│   │   └── types/          # TypeScript types
│   ├── public/             # Static assets
│   └── package.json
├── backend-nestjs/          # NestJS Backend
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── admin/          # Admin management
│   │   ├── elections/      # Election management
│   │   ├── candidates/     # Candidate management
│   │   ├── votes/          # Voting logic
│   │   └── prisma/         # Database service
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
└── prisma/
    └── schema.prisma       # Shared database schema
```

## 🛠️ Quick Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- Docker (optional)

### 1. Backend Setup

```bash
# Navigate to backend
cd backend-nestjs

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your database and JWT settings

# Set up database
npm run db:generate
npm run db:push

# Start development server
npm run start:dev
```

### 2. Frontend Setup

```bash
# Navigate to frontend
cd frontend-nextjs

# Install dependencies
npm install

# Set up environment variables
# Create .env.local with NEXT_PUBLIC_API_URL=http://localhost:3001

# Start development server
npm run dev
```

### 3. Docker Setup (Alternative)

```bash
# Start with Docker Compose
docker-compose up -d

# Run database migrations
docker-compose exec app npm run db:push
```

## 🔧 Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/voting_system"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# Server
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:3000"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## 🚀 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Render)

1. Connect your GitHub repository
2. Set environment variables
3. Deploy with Docker

### Database (PostgreSQL)

- **Railway**: Built-in PostgreSQL service
- **Render**: PostgreSQL add-on
- **Supabase**: Alternative cloud database

## 📊 Features

### For Voters
- ✅ Secure authentication
- ✅ Real-time election status
- ✅ Easy voting interface
- ✅ Vote verification
- ✅ Election history

### For Administrators
- ✅ Election management
- ✅ Candidate management
- ✅ Voter registration
- ✅ Real-time results
- ✅ Vote traceability
- ✅ Department/Course management

### For Super Admins
- ✅ Admin user management
- ✅ System-wide statistics
- ✅ Advanced analytics
- ✅ Audit logs

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Password Hashing** with bcrypt
- **CORS Protection** for API security
- **Input Validation** with class-validator
- **SQL Injection Protection** with Prisma ORM
- **Rate Limiting** (implemented in production)
- **HTTPS Enforcement** in production

## 📈 Performance

- **Next.js 14** with App Router for optimal performance
- **Prisma** with connection pooling
- **PostgreSQL** indexing for fast queries
- **CDN** for static assets (Vercel)
- **Edge Functions** for global performance

## 🧪 Testing

```bash
# Backend tests
cd backend-nestjs
npm run test
npm run test:e2e

# Frontend tests
cd frontend-nextjs
npm run test
```

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:3001/api`
- **API Spec**: `http://localhost:3001/api-json`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ using Next.js, NestJS, and PostgreSQL** 