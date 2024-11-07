import { IsNumber, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  @Min(1)
  vinylId: number;

  @IsNumber()
  @Min(1)
  count: number;
}
