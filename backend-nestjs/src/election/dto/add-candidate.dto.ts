import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCandidateDto {
  @ApiProperty({ description: 'Candidate ID to add to the election' })
  @IsString()
  @IsNotEmpty()
  candidateId: string;
} 