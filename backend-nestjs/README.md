# Voting System Backend (NestJS)

This is the NestJS backend for the voting system, replacing the Express.js backend.

## Features

- **NestJS Framework**: Modern, scalable Node.js framework
- **TypeScript**: Full type safety
- **Prisma ORM**: Type-safe database client
- **PostgreSQL**: Robust database
- **JWT Authentication**: Secure token-based auth
- **Swagger Documentation**: Auto-generated API docs
- **Validation**: Class-validator for request validation

## Prerequisites

- Node.js 18+
- PostgreSQL
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend-nestjs
npm install
```

### 2. Database Setup

1. **Install PostgreSQL** if you haven't already
2. **Create a database**:
   ```sql
   CREATE DATABASE voting_system;
   ```

### 3. Environment Configuration

1. **Copy the environment file**:
   ```bash
   cp env.example .env
   ```

2. **Update the `.env` file** with your database credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/voting_system?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   NODE_ENV="development"
   PORT=3001
   ```

### 4. Database Migration

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or create migrations (recommended for production)
npm run db:migrate
```

### 5. Start Development Server

```bash
npm run start:dev
```

The server will start on `http://localhost:3001`

## API Documentation

Once the server is running, you can access:

- **Swagger UI**: `http://localhost:3001/api/docs`
- **Health Check**: `http://localhost:3001/health`

## Available Scripts

- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build the application
- `npm run start:prod` - Start production server
- `npm run test` - Run tests
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Create and apply migrations
- `npm run db:studio` - Open Prisma Studio

## Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── dto/             # Data Transfer Objects
│   ├── guards/          # JWT guards
│   ├── strategies/      # Passport strategies
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── admin/               # Admin management
├── voter/               # Voter management
├── election/            # Election management
├── candidate/           # Candidate management
├── position/            # Position management
├── department/          # Department management
├── course/              # Course management
├── vote/                # Voting functionality
├── prisma/              # Database service
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── app.module.ts        # Main application module
└── main.ts             # Application entry point
```

## Testing the API

### 1. Admin Login
```bash
curl -X POST http://localhost:3001/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123"
  }'
```

### 2. User Registration
```bash
curl -X POST http://localhost:3001/auth/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "studentId": "STU001",
    "password": "password123"
  }'
```

### 3. User Login
```bash
curl -X POST http://localhost:3001/auth/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "STU001",
    "password": "password123"
  }'
```

## Next Steps

1. **Seed Data**: Create seed scripts for initial data
2. **Complete Modules**: Implement remaining CRUD operations
3. **File Upload**: Add file upload functionality for candidate photos
4. **Email Service**: Implement password reset functionality
5. **Testing**: Add comprehensive test coverage
6. **Deployment**: Configure for production deployment

## Migration from Express.js

This NestJS backend is designed to be a drop-in replacement for the Express.js backend. The API endpoints maintain the same structure, but with improved:

- Type safety
- Validation
- Documentation
- Error handling
- Testing capabilities 