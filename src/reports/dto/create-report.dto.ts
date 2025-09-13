import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsInt()
  userId: number;

  @IsOptional()
  @IsInt()
  bookingId?: number;

  @IsOptional()
  @IsEnum(['PENDING', 'REVIEWED', 'RESOLVED'] as const)
  status?: 'PENDING' | 'REVIEWED' | 'RESOLVED';
}
