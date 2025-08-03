import { IsString } from 'class-validator';
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
} 