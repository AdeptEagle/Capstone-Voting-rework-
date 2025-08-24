import { IsString, IsOptional, MinLength, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCandidateDto {
  @ApiProperty({ description: 'Candidate name', example: 'John Doe' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ description: 'Candidate email', example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Student ID', example: 'STU123456' })
  @IsString()
  @MinLength(3)
  studentId: string;

  @ApiProperty({ description: 'Position ID', example: 'clx1234567890' })
  @IsString()
  positionId: string;

  @ApiProperty({ description: 'Department ID (required)', example: 'clx1234567890' })
  @IsString()
  departmentId: string;

  @ApiProperty({ description: 'Course ID (required)', example: 'clx1234567890' })
  @IsString()
  courseId: string;

  @ApiProperty({ description: 'Candidate manifesto', example: 'I will work for student welfare', required: false })
  @IsString()
  @IsOptional()
  manifesto?: string;

  @ApiProperty({ description: 'Candidate photo URL', example: '/uploads/images/candidate-photo.jpg', required: false })
  @IsString()
  @IsOptional()
  photo?: string;
} 