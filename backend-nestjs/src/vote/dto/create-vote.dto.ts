import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVoteDto {
  @ApiProperty({ description: 'Voter ID' })
  @IsString()
  voterId: string;

  @ApiProperty({ description: 'Candidate ID' })
  @IsString()
  candidateId: string;

  @ApiProperty({ description: 'Election ID' })
  @IsString()
  electionId: string;

  @ApiProperty({ description: 'Position ID' })
  @IsString()
  positionId: string;

  @ApiProperty({ description: 'IP Address of voter', required: false })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({ description: 'User agent string', required: false })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiProperty({ description: 'Session identifier', required: false })
  @IsOptional()
  @IsString()
  sessionId?: string;
} 