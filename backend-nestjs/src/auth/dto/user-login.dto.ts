import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class UserLoginDto {
  @ApiProperty({
    description: 'Student ID (format: YYYY-NNNNN, e.g., 2024-00001)',
    example: '2024-00001',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @Matches(/^\d{4}-\d{5}$/, { message: 'Student ID must be in format YYYY-NNNNN (e.g., 2024-00001)' })
  Voter_StudentId: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
} 