import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateVinylDto {
  @IsString()
  name: string;

  @IsString()
  authorName: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
