import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsIn } from 'class-validator';

export class RequestPasswordResetDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Type of user (voter or admin)',
    example: 'voter',
    enum: ['voter', 'admin'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['voter', 'admin'])
  userType: 'voter' | 'admin';
} 