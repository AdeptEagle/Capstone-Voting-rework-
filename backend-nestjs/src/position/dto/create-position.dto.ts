import { IsString, IsOptional, MinLength, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePositionDto {
  @ApiProperty({ description: 'Position title', example: 'Student Council President' })
  @IsString()
  @MinLength(2)
  title: string;

  @ApiProperty({ description: 'Position description', example: 'Leader of the student council', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Vote limit for this position', example: 1, default: 1, minimum: 1, maximum: 10 })
  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  voteLimit?: number;
} 