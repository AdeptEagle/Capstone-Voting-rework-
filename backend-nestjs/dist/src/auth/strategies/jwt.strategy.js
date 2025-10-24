"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor() {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromExtractors([
                (request) => {
                    const encryptedToken = request?.cookies?.access_token;
                    console.log('🔍 JWT Strategy - Encrypted token received:', encryptedToken ? 'Present' : 'Missing');
                    if (!encryptedToken)
                        return null;
                    try {
                        console.log('🔍 JWT Strategy - Attempting token decryption...');
                        if (encryptedToken.startsWith('VS.')) {
                            const decryptedToken = this.decryptToken(encryptedToken);
                            console.log('✅ JWT Strategy - Encrypted token decrypted successfully');
                            return decryptedToken;
                        }
                        else {
                            console.log('✅ JWT Strategy - Token is not encrypted, using as-is');
                            return encryptedToken;
                        }
                    }
                    catch (error) {
                        console.error('❌ JWT Strategy - Token decryption failed:', error);
                        console.error('❌ JWT Strategy - Encrypted token format:', encryptedToken.substring(0, 50) + '...');
                        console.log('🔄 JWT Strategy - Trying token as-is (unencrypted)...');
                        return encryptedToken;
                    }
                },
                passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || (() => {
                throw new Error('JWT_SECRET environment variable is required');
            })(),
        });
    }
    decryptToken(encryptedToken) {
        console.log('🔍 DecryptToken - Input token format check...');
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
    async validate(payload) {
        if (!payload.sub) {
            throw new common_1.UnauthorizedException('Invalid token payload');
        }
        return {
            id: payload.sub,
            userId: payload.sub,
            studentId: payload.studentId || null,
            username: payload.username,
            role: payload.role,
            type: payload.type,
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map