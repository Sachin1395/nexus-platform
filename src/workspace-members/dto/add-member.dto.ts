import { WorkspaceRole } from '../../../generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
} from 'class-validator';

export class AddMemberDto {
  @ApiProperty({
    example: 'john@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    enum: WorkspaceRole,
    example: WorkspaceRole.DEVELOPER,
  })
  @IsEnum(WorkspaceRole)
  role!: WorkspaceRole;
}