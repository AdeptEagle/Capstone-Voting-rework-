import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, MinLength, IsOptional, Matches } from 'class-validator';

export class UserRegisterDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Student ID (format: YYYY-NNNNN, e.g., 2024-00001)',
    example: '2024-00001',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @Matches(/^\d{4}-\d{5}$/, { message: 'Student ID must be in format YYYY-NNNNN (e.g., 2024-00001)' })
  studentId: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Department ID',
    example: 'dept_123',
    required: false,
  })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiProperty({
    description: 'Course ID',
    example: 'course_123',
    required: false,
  })
  @IsOptional()
  @IsString()
  courseId?: string;
} 