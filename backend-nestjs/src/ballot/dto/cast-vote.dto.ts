import { IsString, IsArray, IsNotEmpty, ValidateNested, IsOptional, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class VoteSelectionDto {
  @ApiProperty({ description: 'Position ID', example: 'POS-123456' })
  @IsString()
  @IsNotEmpty()
  positionId: string;

  @ApiProperty({ description: 'Candidate ID', example: 'CAND-123456' })
  @IsString()
  @IsNotEmpty()
  candidateId: string;
}

export class CastVoteDto {
  @ApiProperty({ description: 'Ballot ID', example: 'BALLOT-123456' })
  @IsString()
  @IsNotEmpty()
  ballotId: string;

  @ApiProperty({ 
    description: 'Array of vote selections', 
    type: [VoteSelectionDto],
    example: [
      { positionId: 'POS-123456', candidateId: 'CAND-123456' },
      { positionId: 'POS-789012', candidateId: 'CAND-789012' }
    ]
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => VoteSelectionDto)
  votes: VoteSelectionDto[];

  @ApiProperty({ description: 'Verification code (optional)', example: 'ABC123', required: false })
  @IsString()
  @IsOptional()
  verificationCode?: string;
}
