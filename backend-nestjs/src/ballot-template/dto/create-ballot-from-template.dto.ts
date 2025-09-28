import { IsString, IsOptional, IsDateString, IsArray } from 'class-validator';

export class CreateBallotFromTemplateDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsDateString()
  showResultsAfter?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  candidateIds?: string[];
}
