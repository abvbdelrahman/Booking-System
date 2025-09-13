import { IsEnum, IsInt, IsOptional } from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  userId: number;

  @IsInt()
  serviceId: number;

  @IsOptional()
  @IsEnum(['PENDING', 'CONFIRMED', 'CANCELLED'], {
    message: 'status must be one of PENDING, CONFIRMED, CANCELLED',
  } as any)
  status?: string;
}
