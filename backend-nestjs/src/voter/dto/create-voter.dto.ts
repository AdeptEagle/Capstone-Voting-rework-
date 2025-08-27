import { IsString, IsEmail, IsOptional, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVoterDto {
  @ApiProperty({ description: 'Voter name' })
  @IsString()
  Voter_Name: string;

  @ApiProperty({ description: 'Voter email' })
  @IsEmail()
  Voter_Email: string;

  @ApiProperty({ description: 'Student ID (format: YYYY-NNNNN, e.g., 2024-00001)', example: '2024-00001' })
  @IsString()
  @MinLength(10)
  @Matches(/^\d{4}-\d{5}$/, { message: 'Student ID must be in format YYYY-NNNNN (e.g., 2024-00001)' })
  Voter_StudentId: string;

  @ApiProperty({ description: 'Password' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Department ID (required)' })
  @IsString()
  departmentId: string;

  @ApiProperty({ description: 'Course ID (required)' })
  @IsString()
  courseId: string;
} 