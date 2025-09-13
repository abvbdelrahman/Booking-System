import { IsEnum, IsInt, IsNumber, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  bookingId: number;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(['PENDING', 'SUCCESS', 'FAILED'] as const)
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
}
