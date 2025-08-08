import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { MovementType } from '../entities/stock-movement.entity';

export class CreateStockMovementDto {
  @IsString()
  productId: string;

  @IsEnum(MovementType)
  type: MovementType;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  documentNumber?: string;
}
