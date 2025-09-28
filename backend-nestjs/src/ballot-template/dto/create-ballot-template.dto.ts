import { IsString, IsOptional, IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBallotTemplateDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  templateData: {
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
