import { IsNumber, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSaleItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;
}

export class CreateSaleDto {
  @IsOptional()
  @IsNumber()
  customerId?: number;

  @IsNumber()
  userId: number;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsString()
  paymentMethod: string;

  @IsOptional()
  @IsNumber()
  amountReceived?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];
}
