import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({
    description: 'Admin username',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  Admin_Username: string;

  @ApiProperty({
    description: 'Admin password',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
} 