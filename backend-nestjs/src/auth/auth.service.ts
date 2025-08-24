import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { IdGeneratorService } from '../utils/id-generator.service';
import { EmailService } from '../services/email.service';
import { VotingGateway } from '../websocket/voting.gateway';
import * as bcrypt from 'bcryptjs';
import { Response } from 'express';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private idGenerator: IdGeneratorService,
    private emailService: EmailService,
    private votingGateway: VotingGateway,
  ) {}

  async checkAuthStatus(req: any) {
    try {
      // Extract token from HTTP-only cookie
      const token = req.cookies?.access_token;
      
      if (!token) {
        return {
          isAuthenticated: false,
          role: null,
          user: null
        };
      }

      // Verify token
      const decoded = this.jwtService.verify(token);
      
      if (decoded.role === 'SUPERADMIN' || decoded.role === 'ADMIN') {
        // Get admin info
        const admin = await this.prisma.admin.findUnique({
          where: { id: decoded.sub }
        });

        if (!admin) {
          return {
            isAuthenticated: false,
            role: null,
            user: null
          };
        }

        return {
          isAuthenticated: true,
          role: admin.role,
          user: {
            id: admin.id,
            username: admin.username,
            email: admin.email
          }
        };
      } else {
        // Get voter info
        const voter = await this.prisma.voter.findUnique({
          where: { id: decoded.sub },
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
              },
            },
          },
        });

        if (!voter) {
          return {
            isAuthenticated: false,
            role: null,
            user: null
          };
        }

        return {
          isAuthenticated: true,
          role: 'user',
          user: {
            id: voter.id,
            name: voter.name,
            email: voter.email,
            studentId: voter.studentId,
            hasVoted: voter.hasVoted,
            department: voter.department,
            course: voter.course
          }
        };
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      return {
        isAuthenticated: false,
        role: null,
        user: null
      };
    }
  }

  async adminLogin(adminLoginDto: { username: string; password: string }, res: Response) {
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
      type: 'admin'
    };

    const token = this.jwtService.sign(payload);

    // Set HTTP-only cookie instead of returning token in body
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
    });

    return {
      message: 'Admin login successful',
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  async userLogin(userLoginDto: { studentId: string; password: string }, res: Response) {
    const { studentId, password } = userLoginDto;

    const voter = await this.prisma.voter.findUnique({
      where: { studentId },
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
          },
        },
      },
    });

    if (!voter) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, voter.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { 
      sub: voter.id, 
      studentId: voter.studentId, 
      type: 'voter'
    };

    const token = this.jwtService.sign(payload);

    // Set HTTP-only cookie instead of returning token in body
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
    });

    return {
      message: 'User login successful',
      voter: {
        id: voter.id,
        name: voter.name,
        email: voter.email,
        studentId: voter.studentId,
        hasVoted: voter.hasVoted,
        department: voter.department,
        course: voter.course,
      },
    };
  }

  async userRegister(userRegisterDto: {
    name: string;
    email: string;
    studentId: string;
    password: string;
    departmentId?: string;
    courseId?: string;
  }, res: Response) {
    const { name, email, studentId, password, departmentId, courseId } = userRegisterDto;

    // Check if voter already exists
    const existingVoter = await this.prisma.voter.findFirst({
      where: {
        OR: [
          { email },
          { studentId },
        ],
      },
    });

    if (existingVoter) {
      throw new ConflictException('User already exists');
    }

    // Generate custom ID
    const voterId = await this.idGenerator.generateVoterId();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create voter with optional fields
    const voterData: any = {
      id: voterId,
      name,
      email,
      studentId,
      password: hashedPassword,
    };

    // Only include optional fields if they exist
    if (departmentId) {
      voterData.departmentId = departmentId;
    }
    if (courseId) {
      voterData.courseId = courseId;
    }

    // Create voter
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
          },
        },
      },
    });

    // Emit real-time voter registration event
    console.log('🔌 [AuthService] Emitting voter-registered WebSocket event...');
    try {
      this.votingGateway.emitVoterRegistered({
        id: voter.id,
        studentId: voter.studentId,
        name: voter.name,
        email: voter.email,
        hasVoted: voter.hasVoted,
        department: voter.department,
        course: voter.course,
        createdAt: voter.createdAt,
      });
      console.log('✅ [AuthService] voter-registered event emitted successfully');

      // Also emit admin action for voter management
      this.votingGateway.emitAdminAction('voter-management', {
        action: 'voter-created',
        voterId: voter.id,
        voterName: voter.name,
      });
      console.log('✅ [AuthService] admin-action event emitted successfully');
    } catch (error) {
      console.error('❌ [AuthService] Error emitting WebSocket events:', error);
    }

    const payload = { 
      sub: voter.id, 
      studentId: voter.studentId, 
      type: 'voter'
    };

    const token = this.jwtService.sign(payload);

    // Set HTTP-only cookie instead of returning token in body
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
    });

    return {
      message: 'User registration successful',
      voter: {
        id: voter.id,
        name: voter.name,
        email: voter.email,
        studentId: voter.studentId,
        hasVoted: voter.hasVoted,
        department: voter.department,
        course: voter.course,
      },
    };
  }

  async requestPasswordReset(requestPasswordResetDto: { email: string; userType: 'voter' | 'admin' }) {
    const { email, userType } = requestPasswordResetDto;

    // Check if user exists
    let user;
    if (userType === 'voter') {
      user = await this.prisma.voter.findUnique({ where: { email } });
    } else {
      user = await this.prisma.admin.findUnique({ where: { email } });
    }

    if (!user) {
      // Don't reveal if user exists or not for security
      return {
        message: 'If an account with this email exists, a password reset link has been sent.',
      };
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    try {
      // Try to delete any existing tokens for this email first
      await this.prisma.passwordResetToken.deleteMany({
        where: { email },
      });

      // Create new reset token
      await this.prisma.passwordResetToken.create({
        data: {
          id: await this.idGenerator.generatePasswordResetTokenId(), // Use correct method
          email,
          token: resetToken,
          expiresAt,
        },
      });

      // Send password reset email
      await this.emailService.sendPasswordResetEmail(email, resetToken, userType);

      return {
        message: 'If an account with this email exists, a password reset link has been sent.',
      };
    } catch (error) {
      // If the unique constraint doesn't exist yet, try a simpler approach
      console.log('Database constraint issue, trying alternative approach...');
      
      // Create token with a simple approach
      await this.prisma.passwordResetToken.create({
        data: {
          id: await this.idGenerator.generatePasswordResetTokenId(), // Use correct method
          email,
          token: resetToken,
          expiresAt,
        },
      });

      // Send password reset email
      await this.emailService.sendPasswordResetEmail(email, resetToken, userType);

      return {
        message: 'If an account with this email exists, a password reset link has been sent.',
      };
    }
  }

  async verifyResetToken(token: string) {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      throw new UnauthorizedException('Invalid reset token');
    }

    if (resetToken.expiresAt < new Date()) {
      // Clean up expired token
      await this.prisma.passwordResetToken.delete({
        where: { token },
      });
      throw new UnauthorizedException('Reset token has expired');
    }

    return {
      valid: true,
      message: 'Token is valid',
    };
  }

  async resetPassword(resetPasswordDto: { token: string; newPassword: string }) {
    const { token, newPassword } = resetPasswordDto;

    // Find the reset token
    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: { token },
    });

    if (!resetToken) {
      throw new UnauthorizedException('Invalid reset token');
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Reset token has expired');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password based on email
    const email = resetToken.email;
    
    // Try to update voter first
    let user = await this.prisma.voter.findUnique({ where: { email } });
    let userType: 'voter' | 'admin' = 'voter';
    
    if (user) {
      await this.prisma.voter.update({
        where: { email },
        data: { password: hashedPassword },
      });
    } else {
      // Try admin
      const adminUser = await this.prisma.admin.findUnique({ where: { email } });
      if (adminUser) {
        await this.prisma.admin.update({
          where: { email },
          data: { password: hashedPassword },
        });
        userType = 'admin';
      } else {
        throw new UnauthorizedException('User not found');
      }
    }

    // Delete the used reset token
    await this.prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    // Send password changed confirmation email
    try {
      await this.emailService.sendPasswordChangedEmail(email, userType);
    } catch (error) {
      console.error('Failed to send password changed email:', error);
      // Don't fail the password reset if email fails
    }

    return {
      message: 'Password has been successfully reset. Please check your email for confirmation.',
    };
  }

  async cleanupExpiredTokens() {
    const deletedCount = await this.prisma.passwordResetToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return {
      message: `Cleaned up ${deletedCount.count} expired tokens`,
      deletedCount: deletedCount.count,
    };
  }

  async logout(res: Response) {
    // Clear the HTTP-only cookie
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return {
      message: 'Logout successful',
    };
  }

  async validateAdminToken(body: { token: string }) {
    try {
      const payload = this.jwtService.verify(body.token);
      return { valid: true, payload };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  async testEmailConnection(): Promise<boolean> {
    return this.emailService.testConnection();
  }
} 