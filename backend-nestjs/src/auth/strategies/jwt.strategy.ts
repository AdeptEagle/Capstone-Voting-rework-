import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { randomBytes, createCipher, createDecipher } from 'crypto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Extract from HTTP-only cookie and decrypt
        (request: Request) => {
          const encryptedToken = request?.cookies?.access_token;
          console.log('🔍 JWT Strategy - Encrypted token received:', encryptedToken ? 'Present' : 'Missing');
          
          if (!encryptedToken) return null;
          
          try {
            // 🔐 DECRYPT THE TOKEN (if it's encrypted)
            console.log('🔍 JWT Strategy - Attempting token decryption...');
            
            // Check if token is encrypted (starts with VS.)
            if (encryptedToken.startsWith('VS.')) {
              const decryptedToken = this.decryptToken(encryptedToken);
              console.log('✅ JWT Strategy - Encrypted token decrypted successfully');
              return decryptedToken;
            } else {
              // Token is not encrypted, return as-is
              console.log('✅ JWT Strategy - Token is not encrypted, using as-is');
              return encryptedToken;
            }
          } catch (error) {
            console.error('❌ JWT Strategy - Token decryption failed:', error);
            console.error('❌ JWT Strategy - Encrypted token format:', encryptedToken.substring(0, 50) + '...');
            
            // If decryption fails, try using the token as-is (might be unencrypted)
            console.log('🔄 JWT Strategy - Trying token as-is (unencrypted)...');
            return encryptedToken;
          }
        },
        // Fallback to Authorization header (for API testing)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || (() => {
        throw new Error('JWT_SECRET environment variable is required');
      })(),
    });
  }

  // 🔐 ADD DECRYPTION METHOD TO STRATEGY
  private decryptToken(encryptedToken: string): string {
    console.log('🔍 DecryptToken - Input token format check...');
    
    // Check if token has the expected format (VS.iv.encrypted)
    if (!encryptedToken.startsWith('VS.')) {
      console.error('❌ DecryptToken - Token does not start with VS.');
      throw new Error('Invalid token format - missing VS. prefix');
    }
    
    const parts = encryptedToken.split('.');
    if (parts.length !== 3) {
      console.error('❌ DecryptToken - Token does not have 3 parts:', parts.length);
      throw new Error('Invalid token format - expected 3 parts');
    }
    
    const algorithm = 'aes-256-cbc';
    const key = require('crypto').scryptSync(process.env.JWT_SECRET || 'fallback', 'salt', 32);
    
    const [, ivHex, encrypted] = parts;
    console.log('🔍 DecryptToken - IV length:', ivHex.length, 'Encrypted length:', encrypted.length);
    
    const iv = Buffer.from(ivHex, 'hex');
    
    const decipher = require('crypto').createDecipheriv(algorithm, key, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    console.log('✅ DecryptToken - Successfully decrypted token');
    return decrypted;
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