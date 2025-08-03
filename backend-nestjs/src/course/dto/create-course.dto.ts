import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ description: 'Course name', example: 'Computer Programming' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ description: 'Course code', example: 'CS101' })
  @IsString()
  @MinLength(2)
  code: string;

  @ApiProperty({ description: 'Course description', example: 'Introduction to Computer Programming', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Department ID', example: 'CCS' })
  @IsString()
  departmentId: string;

  @ApiProperty({ description: 'Custom course ID (optional)', example: 'CS101', required: false })
  @IsString()
  @IsOptional()
  customId?: string;
} 