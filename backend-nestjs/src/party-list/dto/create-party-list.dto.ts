import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsHexColor } from 'class-validator';

export class CreatePartyListDto {
  @ApiProperty({ description: 'Name of the party list' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the party list', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Hex color code for the party list', required: false })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiProperty({ description: 'Logo URL for the party list', required: false })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({ description: 'Logo URL for the party list (alternative field)', required: false })
  @IsOptional()
  @IsString()
  logoUrl?: string;
}
