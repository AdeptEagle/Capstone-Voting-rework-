import { IsString, IsEmail, IsEnum, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateAdminDto {
  @ApiProperty({ description: 'Admin username', example: 'admin123' })
  @IsString()
  @MinLength(3)
  Admin_Username: string;

  @ApiProperty({ description: 'Admin email', example: 'admin@example.com' })
  @IsEmail()
  Admin_Email: string;

  @ApiProperty({ description: 'Admin password', example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Admin role', enum: Role, example: Role.ADMIN })
  @IsEnum(Role)
  @IsOptional()
  role?: Role = Role.ADMIN;
} 