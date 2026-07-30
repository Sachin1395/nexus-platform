import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateWorkspaceDto {
  @ApiProperty({
    example: 'Nexus Platform',
    description: 'Workspace name',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  name!: string;

  @ApiPropertyOptional({
    example: 'Production grade developer platform',
    description: 'Workspace description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  description?: string;
}