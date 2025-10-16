import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { IdGeneratorService } from '../utils/id-generator.service';
import { EmailService } from '../services/email.service';
import { VotingGateway } from '../websocket/voting.gateway';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || (() => {
        throw new Error('JWT_SECRET environment variable is required');
      })(),
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, IdGeneratorService, EmailService, VotingGateway],
  exports: [AuthService],
})
export class AuthModule {} 