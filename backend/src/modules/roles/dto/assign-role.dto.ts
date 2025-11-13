import { IsNotEmpty, IsUUID, IsArray, ArrayMinSize } from 'class-validator';

export class AssignRoleDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1, { message: 'At least one role must be specified' })
  roleIds: string[];
}
