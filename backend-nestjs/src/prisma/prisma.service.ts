import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected successfully');
    
    // Create default superadmin if it doesn't exist
    await this.createDefaultSuperAdmin();
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