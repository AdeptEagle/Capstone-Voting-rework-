import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto, UpdateAdminDto } from './dto';
import { IdGeneratorService } from '../utils/id-generator.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private idGenerator: IdGeneratorService
  ) {}

  async getAllAdmins() {
    return this.prisma.admin.findMany({
      select: {
        id: true,
        Admin_Username: true,
        Admin_Email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async createAdmin(createAdminDto: CreateAdminDto) {
    const { Admin_Username, Admin_Email, password } = createAdminDto;

    // Check if admin already exists
    const existingAdmin = await this.prisma.admin.findFirst({
      where: {
        OR: [
          { Admin_Username: Admin_Username },
          { Admin_Email: Admin_Email },
        ],
      },
    });

    if (existingAdmin) {
      throw new ConflictException('Admin with this username or email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate custom ID with configurable format
    const customId = await this.idGenerator.generateAdminId('simple'); // Can be 'simple', 'padded', or 'year'

    const admin = await this.prisma.admin.create({
      data: {
        id: customId,
        Admin_Username: Admin_Username,
        Admin_Email: Admin_Email,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    return {
      message: 'Admin created successfully!',
      admin: {
        id: admin.id,
        Admin_Username: admin.Admin_Username,
        Admin_Email: admin.Admin_Email,
        role: admin.role,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      },
    };
  }

  // New method for admin to customize ID format
  async createAdminWithCustomId(createAdminDto: CreateAdminDto, idFormat: 'simple' | 'padded' | 'year' = 'simple') {
    const { Admin_Username, Admin_Email, password } = createAdminDto;

    // Check if admin already exists
    const existingAdmin = await this.prisma.admin.findFirst({
      where: {
        OR: [
          { Admin_Username: Admin_Username },
          { Admin_Email: Admin_Email },
        ],
      },
    });

    if (existingAdmin) {
      throw new ConflictException('Admin with this username or email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate custom ID with specified format
    const customId = await this.idGenerator.generateAdminId(idFormat);

    const admin = await this.prisma.admin.create({
      data: {
        id: customId,
        Admin_Username: Admin_Username,
        Admin_Email: Admin_Email,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    return {
      message: 'Admin created successfully!',
      admin: {
        id: admin.id,
        Admin_Username: admin.Admin_Username,
        Admin_Email: admin.Admin_Email,
        role: admin.role,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      },
    };
  }

  // Get ID format examples
  async getIdFormatExamples() {
    const examples = {
      simple: {
        admin: 'ADMIN-1',
        department: 'DEPT-1',
        course: 'COURSE-1',
        position: 'POS-1',
        candidate: 'CAND-1',
        voter: 'VOTER-1',
        election: 'ELEC-1',
        vote: 'VOTE-1',
      },
      padded: {
        admin: 'ADMIN-001',
        department: 'DEPT-001',
        course: 'COURSE-001',
        position: 'POS-001',
        candidate: 'CAND-001',
        voter: 'VOTER-001',
        election: 'ELEC-001',
        vote: 'VOTE-001',
      },
      year: {
        admin: 'ADMIN-2024-1',
        department: 'DEPT-2024-1',
        course: 'COURSE-2024-1',
        position: 'POS-2024-1',
        candidate: 'CAND-2024-1',
        voter: 'VOTER-2024-1',
        election: 'ELEC-2024-1',
        vote: 'VOTE-2024-1',
      },
    };

    return {
      message: 'ID Format Examples',
      formats: examples,
      currentCounts: {
        admin: await this.idGenerator.getModelCount('admin'),
        department: await this.idGenerator.getModelCount('department'),
        course: await this.idGenerator.getModelCount('course'),
        position: await this.idGenerator.getModelCount('position'),
        candidate: await this.idGenerator.getModelCount('candidate'),
        voter: await this.idGenerator.getModelCount('voter'),
        election: await this.idGenerator.getModelCount('election'),
        vote: await this.idGenerator.getModelCount('vote'),
      },
    };
  }

  async getAdminById(id: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        Admin_Username: true,
        Admin_Email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return admin;
  }

  async updateAdmin(id: string, updateAdminDto: UpdateAdminDto) {
    const { Admin_Username, Admin_Email, password, role } = updateAdminDto;

    // Check if admin exists
    const existingAdmin = await this.prisma.admin.findUnique({
      where: { id },
    });

    if (!existingAdmin) {
      throw new NotFoundException('Admin not found');
    }

    // Check if username or email is already taken by another admin
    if (Admin_Username || Admin_Email) {
      const conflictingAdmin = await this.prisma.admin.findFirst({
        where: {
          OR: [
            { Admin_Username: Admin_Username || existingAdmin.Admin_Username },
            { Admin_Email: Admin_Email || existingAdmin.Admin_Email },
          ],
          NOT: { id },
        },
      });

      if (conflictingAdmin) {
        throw new ConflictException('Admin with this username or email already exists');
      }
    }

    const updateData: any = {};
    if (Admin_Username) updateData.Admin_Username = Admin_Username;
    if (Admin_Email) updateData.Admin_Email = Admin_Email;
    if (role) updateData.role = role;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const admin = await this.prisma.admin.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        Admin_Username: true,
        Admin_Email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Admin updated successfully!',
      admin,
    };
  }

  async deleteAdmin(id: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    await this.prisma.admin.delete({
      where: { id },
    });

    return {
      message: 'Admin deleted successfully!',
    };
  }

  async getAdminByUsername(username: string) {
    return this.prisma.admin.findUnique({
      where: { Admin_Username: username },
    });
  }

  async getAdminByEmail(email: string) {
    return this.prisma.admin.findUnique({
      where: { Admin_Email: email },
    });
  }

  async createSuperAdmin(createAdminDto: CreateAdminDto) {
    const { Admin_Username, Admin_Email, password } = createAdminDto;

    // Check if admin already exists
    const existingAdmin = await this.prisma.admin.findFirst({
      where: {
        OR: [
          { Admin_Username: Admin_Username },
          { Admin_Email: Admin_Email },
        ],
      },
    });

    if (existingAdmin) {
      throw new ConflictException('Super Admin with this username or email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate custom ID with configurable format
    const customId = await this.idGenerator.generateAdminId('simple');

    const admin = await this.prisma.admin.create({
      data: {
        id: customId,
        Admin_Username: Admin_Username,
        Admin_Email: Admin_Email,
        password: hashedPassword,
        role: 'SUPERADMIN',
      },
    });

    return {
      message: 'Super Admin created successfully!',
      admin: {
        id: admin.id,
        Admin_Username: admin.Admin_Username,
        Admin_Email: admin.Admin_Email,
        role: admin.role,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      },
    };
  }

  async getAdminStats() {
    // Get total counts
    const totalAdmins = await this.prisma.admin.count();
    const superAdmins = await this.prisma.admin.count({
      where: { role: 'SUPERADMIN' }
    });
    const regularAdmins = await this.prisma.admin.count({
      where: { role: 'ADMIN' }
    });

    // Get recent activity
    const recentAdmins = await this.prisma.admin.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      select: {
        id: true,
        Admin_Username: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Get admin activity stats
    const adminActivity = await this.prisma.admin.findMany({
      select: {
        id: true,
        Admin_Username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            elections: true,
            departments: true,
            courses: true,
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return {
      overview: {
        totalAdmins,
        superAdmins,
        regularAdmins,
        superAdminPercentage: totalAdmins > 0 ? (superAdmins / totalAdmins * 100).toFixed(2) : '0',
        regularAdminPercentage: totalAdmins > 0 ? (regularAdmins / totalAdmins * 100).toFixed(2) : '0',
      },
      recentActivity: {
        newAdmins: recentAdmins.length,
        recentAdmins,
      },
      adminActivity,
    };
  }
} 