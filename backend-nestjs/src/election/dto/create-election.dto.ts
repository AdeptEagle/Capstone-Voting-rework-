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

  @ApiProperty({ description: 'Election status', default: 'draft' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'Is election active', default: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 