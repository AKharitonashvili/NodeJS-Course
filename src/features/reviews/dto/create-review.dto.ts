import { IsNumber, IsString, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  vinylId: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  rating: number;

  @IsString()
  comment: string;
}
