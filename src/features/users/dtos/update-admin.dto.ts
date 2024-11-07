import { IsEmail } from 'class-validator';

export class UpdateAdminDto {
  @IsEmail()
  email: string;
}
