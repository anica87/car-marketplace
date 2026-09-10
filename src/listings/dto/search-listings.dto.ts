import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class SearchListingsDto {
  // Param 1: text match on the car's make (e.g. "Toyota")
  @IsOptional()
  @IsString()
  make?: string;

  // Param 2: exact match on listing city (e.g. "Belgrade")
  @IsOptional()
  @IsString()
  city?: string;

  // Param 3: price range — both optional, either or both can be set
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  maxPrice?: number;

  // Pagination (not one of the 3 "search" params, but needed for real usage)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit?: number = 20;
}
