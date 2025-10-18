import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsIn } from 'class-validator';

export class RequestPasswordResetDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  ResetToken_Email: string;

  @ApiProperty({
    description: 'Type of user (voter or admin)',
    example: 'voter',
    enum: ['voter', 'admin'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['voter', 'admin'])
  userType: 'voter' | 'admin';

  @ApiProperty({
    description: 'Additional verification field - Username for admin, Student ID for voter',
    example: 'admin123',
  })
  @IsString()
  @IsNotEmpty()
  verificationField: string;
} 