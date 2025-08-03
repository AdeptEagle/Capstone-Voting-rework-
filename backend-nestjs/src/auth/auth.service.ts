import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { IdGeneratorService } from '../utils/id-generator.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private idGenerator: IdGeneratorService,
  ) {}

  async adminLogin(adminLoginDto: AdminLoginDto) {
    const { username, password } = adminLoginDto;

    const admin = await this.prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: admin.id,
      username: admin.username,
      role: admin.role,
      type: 'admin',
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'Admin login successful',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  async userLogin(userLoginDto: UserLoginDto) {
    const { studentId, password } = userLoginDto;

    const voter = await this.prisma.voter.findUnique({
      where: { studentId }, // Use studentId field
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        course: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!voter) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!voter.password) {
      throw new UnauthorizedException('Account not properly set up');
    }

    const isPasswordValid = await bcrypt.compare(password, voter.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: voter.id,
      studentId: voter.studentId,
      email: voter.email,
      type: 'voter',
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'User login successful',
      token,
      voter: {
        id: voter.id,
        studentId: voter.studentId,
        name: voter.name,
        email: voter.email,
        hasVoted: voter.hasVoted,
        department: voter.department,
        course: voter.course,
      },
    };
  }

  async userRegister(userRegisterDto: UserRegisterDto) {
    const { email, studentId, password, ...rest } = userRegisterDto;

    // Check if user already exists
    const existingVoter = await this.prisma.voter.findFirst({
      where: {
        OR: [
          { email },
          { studentId }, // Check if student ID already exists
        ],
      },
    });

    if (existingVoter) {
      throw new BadRequestException('User with this email or student ID already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a unique ID for the voter
    const voterId = await this.idGenerator.generateVoterId();

    // Create voter with separate id and studentId
    const voterData: any = {
      id: voterId,
      studentId,
      ...rest,
      email,
      password: hashedPassword,
    };

    // Only include departmentId and courseId if they exist
    if (rest.departmentId) {
      voterData.departmentId = rest.departmentId;
    }
    if (rest.courseId) {
      voterData.courseId = rest.courseId;
    }

    const voter = await this.prisma.voter.create({
      data: voterData,
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        course: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    const payload = {
      sub: voter.id,
      studentId: voter.studentId,
      email: voter.email,
      type: 'voter',
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'User registration successful',
      token,
      voter: {
        id: voter.id,
        studentId: voter.studentId,
        name: voter.name,
        email: voter.email,
        hasVoted: voter.hasVoted,
        department: voter.department,
        course: voter.course,
      },
    };
  }

  async validateAdminToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'admin') {
        throw new UnauthorizedException('Invalid token type');
      }

      const admin = await this.prisma.admin.findUnique({
        where: { id: payload.sub },
      });

      if (!admin) {
        throw new UnauthorizedException('Admin not found');
      }

      return {
        valid: true,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
        },
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
      };
    }
  }
} 