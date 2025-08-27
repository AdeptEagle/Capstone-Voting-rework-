import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ description: 'Department name', example: 'Computer Science' })
  @IsString()
  @MinLength(2)
  Department_Name: string;

  @ApiProperty({ description: 'Department description', example: 'Department of Computer Science and Engineering', required: false })
  @IsString()
  @IsOptional()
  Department_Description?: string;

  @ApiProperty({ description: 'Custom department ID (optional)', example: 'CCS', required: false })
  @IsString()
  @IsOptional()
  customId?: string;
} 