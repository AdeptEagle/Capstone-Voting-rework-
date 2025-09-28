import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class UpdateBallotTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  templateData?: {
    title: string;
    description?: string;
    positions?: Array<{
      positionId: string;
      displayOrder?: number;
      isRequired?: boolean;
    }>;
    maxVotesPerUser?: number;
    allowMultipleVotes?: boolean;
    requireAllPositions?: boolean;
    showResults?: boolean;
    showLiveResults?: boolean;
  };

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
