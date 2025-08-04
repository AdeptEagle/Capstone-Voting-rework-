import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS with credentials
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5174',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Add cookie parser middleware
  app.use(cookieParser());

  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation with security info
  const config = new DocumentBuilder()
    .setTitle('Voting System API v2.0')
    .setDescription(`
# 🚀 Voting System API v2.0 (NestJS)

**Major Upgrade from Node.js v0.10 → NestJS v2.0**

## 🆕 What's New in v2.0:
- **🔒 Enhanced Security**: HTTP-Only Cookies instead of localStorage
- **⚡ Better Performance**: NestJS framework with TypeScript
- **🛡️ ACID Compliance**: Database transactions for data integrity
- **📊 Advanced Analytics**: Department-based voting results
- **🎯 Vote Limits**: Configurable vote limits per position
- **🔐 Password Reset**: Email-based password recovery
- **📱 Modern Architecture**: Modular, scalable design

## 🔒 Secure Authentication System

This API uses **HTTP-Only Cookies** for secure token storage. 

### Security Features:
- **XSS Protection**: Tokens are stored in HTTP-only cookies (JavaScript cannot access)
- **CSRF Protection**: SameSite strict policy prevents cross-site attacks
- **Automatic Expiration**: Cookies expire after 24 hours
- **Secure Transmission**: HTTPS-only in production

### Authentication Flow:
1. **Login/Register**: Token automatically stored in HTTP-only cookie
2. **API Requests**: Cookies sent automatically with \`credentials: 'include'\`
3. **Logout**: HTTP-only cookie automatically cleared

### Frontend Integration:
\`\`\`javascript
// Login request
fetch('/auth/user/login', {
  method: 'POST',
  credentials: 'include', // Important for cookies
  body: JSON.stringify({ studentId: '2024-00001', password: 'password123' })
});

// Protected API request
fetch('/api/votes', {
  credentials: 'include' // Cookies sent automatically
});
\`\`\`

**Note**: No tokens are exposed in API responses for security.

## 📈 Version Comparison:
| Feature | v0.10 (Node.js) | v2.0 (NestJS) |
|---------|------------------|----------------|
| **Framework** | Express.js | NestJS + TypeScript |
| **Security** | localStorage tokens | HTTP-only cookies |
| **Database** | Basic queries | ACID transactions |
| **Analytics** | Basic results | Department-based analytics |
| **Vote Limits** | Fixed (1 vote) | Configurable limits |
| **Password Reset** | Manual admin reset | Email-based recovery |
| **Architecture** | Monolithic | Modular design |
    `)
    .setVersion('2.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token (for API testing only - production uses HTTP-only cookies)',
      },
      'bearer-auth',
    )
    .addTag('Authentication', 'Secure authentication with HTTP-only cookies')
    .addTag('Votes', 'Vote management endpoints')
    .addTag('Elections', 'Election management endpoints')
    .addTag('Voters', 'Voter management endpoints')
    .addTag('Candidates', 'Candidate management endpoints')
    .addTag('Positions', 'Position management endpoints')
    .addTag('Departments', 'Department management endpoints')
    .addTag('Courses', 'Course management endpoints')
    .addTag('Admins', 'Admin management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showRequestHeaders: true,
    },
    customSiteTitle: 'Voting System API v2.0 - Secure Documentation',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2c3e50; }
      .swagger-ui .info .description { background: #f8f9fa; padding: 15px; border-radius: 5px; }
    `,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api`);
  console.log(`🔒 Security: HTTP-only cookies enabled`);
}

bootstrap(); 