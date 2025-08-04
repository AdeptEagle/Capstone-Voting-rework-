import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AssignCandidateDto {
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