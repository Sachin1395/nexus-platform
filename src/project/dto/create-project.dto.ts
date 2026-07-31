import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    example: 'Backend API',
  })
  @IsString()
  @Length(3, 100)
  name!: string;

  @ApiPropertyOptional({
    example: 'NestJS backend service',
  })
  @IsOptional()
  @IsString()
  description?: string;
}