import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EmailDto {
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsOptional()
  html?: string;
}
