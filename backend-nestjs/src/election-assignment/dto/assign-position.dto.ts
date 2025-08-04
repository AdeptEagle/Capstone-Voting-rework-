import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AssignPositionDto {
  @ApiProperty({
    description: 'Election ID',
    example: 'ELEC-1',
  })
  @IsString()
  @IsNotEmpty()
  electionId: string;

  @ApiProperty({
    description: 'Position ID',
    example: 'POS-1',
  })
  @IsString()
  @IsNotEmpty()
  positionId: string;
} 