import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddPositionDto {
  @ApiProperty({ description: 'Position ID to add to the election' })
  @IsString()
  @IsNotEmpty()
  positionId: string;
} 