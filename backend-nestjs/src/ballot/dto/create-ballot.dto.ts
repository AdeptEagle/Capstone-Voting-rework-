import { IsString, IsOptional, IsDateString, IsBoolean, IsNumber, IsArray, IsNotEmpty, Min, Max } from 'class-validator';

export class CreateBallotDto {
  @IsString()
  @IsNotEmpty()
  Ballot_Title: string;

  @IsOptional()
  @IsString()
  Ballot_Description?: string;

  @IsDateString()
  Ballot_StartDate: string;

  @IsDateString()
  Ballot_EndDate: string;

  // Note: Vote limits are now managed per position, not per ballot
  // These fields are kept for backwards compatibility but should not be exposed in UI

  @IsOptional()
  @IsBoolean()
  Ballot_RequireAllPositions?: boolean;

  @IsOptional()
  @IsBoolean()
  Ballot_ShowResults?: boolean;

  @IsOptional()
  @IsDateString()
  Ballot_ShowResultsAfter?: string;

  @IsOptional()
  @IsBoolean()
  Ballot_ShowLiveResults?: boolean;

  @IsOptional()
  @IsBoolean()
  Ballot_AllowAbstain?: boolean;

  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  positionIds: string[];

  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  candidateIds: string[];
}
