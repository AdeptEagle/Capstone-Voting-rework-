import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateElectionAssignmentDto {
  @ApiProperty({
    description: 'Election ID',
    example: 'ELEC-1',
  })
  @IsString()
  @IsNotEmpty()
  electionId: string;

  @ApiProperty({
    description: 'Candidate ID',
    example: 'CAND-1',
  })
  @IsString()
  @IsNotEmpty()
  candidateId: string;
} 