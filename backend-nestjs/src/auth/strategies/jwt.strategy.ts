import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Extract from HTTP-only cookie
        (request: Request) => {
          const token = request?.cookies?.access_token;
          return token;
        },
        // Fallback to Authorization header (for API testing)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'voting-system-jwt-secret-key-2024',
    });
  }

  async validate(payload: any) {
    // Validate the payload
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      id: payload.sub, // Controllers expect req.user.id
      userId: payload.sub, // Keep for backward compatibility
      studentId: payload.studentId || null, // Handle admin tokens that don't have studentId
      username: payload.username,
      role: payload.role,
      type: payload.type,
    };
  }
} 