import { IsString, IsOptional, MinLength, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePositionDto {
  @ApiProperty({ description: 'Custom position ID', example: 'TEST', required: false })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Position title', example: 'Student Council President' })
  @IsString()
  @MinLength(2)
  Position_Title: string;

  @ApiProperty({ description: 'Position description', example: 'Leader of the student council', required: false })
  @IsString()
  @IsOptional()
  Position_Description?: string;

  @ApiProperty({ description: 'Vote limit for this position', example: 1, default: 1, minimum: 1, maximum: 10 })
  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  voteLimit?: number;

  @ApiProperty({ description: 'Display order for sorting', example: 0, default: 0, minimum: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  displayOrder?: number;
} 