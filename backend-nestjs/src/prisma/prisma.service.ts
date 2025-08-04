import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    try {
      console.log('🔄 Initializing database...');
      
      // Check if we're in development mode and need to set up the database
      if (process.env.NODE_ENV !== 'production') {
        await this.initializeDatabase();
      }
      
      await this.$connect();
      console.log('✅ Database connected successfully');
      
      // Create default superadmin if it doesn't exist
      await this.createDefaultSuperAdmin();
    } catch (error) {
      console.error('❌ Database initialization failed:', error.message);
      throw error;
    }
  }

  async initializeDatabase() {
    try {
      console.log('🔧 Setting up database schema...');
      
      // Check if Prisma migrations directory exists
      const migrationsPath = join(process.cwd(), 'prisma', 'migrations');
      if (!existsSync(migrationsPath)) {
        console.log('⚠️  No migrations found, creating initial migration...');
        this.runPrismaCommand('migrate dev --name init');
      } else {
        console.log('📦 Running existing migrations...');
        this.runPrismaCommand('migrate deploy');
      }
      
      console.log('✅ Database schema setup completed');
    } catch (error) {
      console.error('❌ Database schema setup failed:', error.message);
      
      // Fallback: try to push the schema directly
      try {
        console.log('🔄 Attempting schema push as fallback...');
        this.runPrismaCommand('db push');
        console.log('✅ Schema push completed');
      } catch (pushError) {
        console.error('❌ Schema push also failed:', pushError.message);
        throw pushError;
      }
    }
  }

  private runPrismaCommand(command: string) {
    try {
      const result = execSync(`npx prisma ${command}`, {
        cwd: process.cwd(),
        stdio: 'pipe',
        encoding: 'utf8',
      });
      console.log(result);
    } catch (error) {
      console.error(`❌ Prisma command failed: ${command}`);
      console.error(error.message);
      throw error;
    }
  }

  async createDefaultSuperAdmin() {
    try {
      // Check if default superadmin already exists
      const existingSuperAdmin = await this.admin.findFirst({
        where: {
          OR: [
            { username: 'superadmin' },
            { email: 'superadmin@votingsystem.com' },
          ],
        },
      });

      if (!existingSuperAdmin) {
        // Create default superadmin
        const hashedPassword = await bcrypt.hash('superadmin123', 10);
        
        await this.admin.create({
          data: {
            id: 'SUPERADMIN-1',
            username: 'superadmin',
            email: 'superadmin@votingsystem.com',
            password: hashedPassword,
            role: 'SUPERADMIN',
          },
        });

        console.log('✅ Default Super Admin created successfully!');
        console.log('👤 Username: superadmin');
        console.log('🔐 Password: superadmin123');
        console.log('📧 Email: superadmin@votingsystem.com');
        console.log('⚠️  Please change the password after first login!');
      } else {
        console.log('✅ Default Super Admin already exists');
      }
    } catch (error) {
      console.error('❌ Error creating default super admin:', error.message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Database disconnected');
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'test') {
      const tablenames = await this.$queryRaw<
        Array<{ tablename: string }>
      >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

      const tables = tablenames
        .map(({ tablename }) => tablename)
        .filter((name) => name !== '_prisma_migrations')
        .map((name) => `"public"."${name}"`)
        .join(', ');

      try {
        await this.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
      } catch (error) {
        console.log({ error });
      }
    }
  }
} 