import { IsString, IsArray, IsNotEmpty, ValidateNested, IsOptional, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class VoteSelectionDto {
  @ApiProperty({ description: 'Position ID', example: 'POS-123456' })
  @IsString()
  @IsNotEmpty()
  positionId: string;

  @ApiProperty({ description: 'Candidate ID (null for abstain votes)', example: 'CAND-123456', required: false })
  @IsOptional()
  @IsString()
  candidateId?: string | null;

  @ApiProperty({ description: 'Indicates if this is an abstention vote', example: false, required: false })
  @IsOptional()
  isAbstention?: boolean;
}

export class CastVoteDto {
  @ApiProperty({ description: 'Ballot ID', example: 'BALLOT-123456' })
  @IsString()
  @IsNotEmpty()
  ballotId: string;

  @ApiProperty({ 
    description: 'Array of vote selections (can be empty for abstaining ballots)', 
    type: [VoteSelectionDto],
    example: [
      { positionId: 'POS-123456', candidateId: 'CAND-123456' },
      { positionId: 'POS-789012', candidateId: 'CAND-789012' }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VoteSelectionDto)
  votes: VoteSelectionDto[];

  @ApiProperty({ description: 'Verification code (optional)', example: 'ABC123', required: false })
  @IsString()
  @IsOptional()
  verificationCode?: string;

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
