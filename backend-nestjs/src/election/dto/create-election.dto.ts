import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateElectionDto {
  @ApiProperty({ description: 'Election title' })
  @IsString()
  Election_Title: string;

  @ApiProperty({ description: 'Election description' })
  @IsOptional()
  @IsString()
  Election_Description?: string;

  @ApiProperty({ description: 'Election start date' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'Election end date' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ description: 'Is election active', default: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 