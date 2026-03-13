import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterBooksDto {
  @ApiProperty({ required: false, description: 'Filter by author ID' })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  authorId?: number;

  @ApiProperty({ required: false, description: 'Search by title' })
  @IsString()
  @IsOptional()
  q?: string;

  @ApiProperty({ required: false, description: 'Minimum price' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  minPrice?: number;

  @ApiProperty({ required: false, description: 'Maximum price' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  maxPrice?: number;

  @ApiProperty({ required: false, description: 'Offset for pagination', default: 0 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  offset?: number;

  @ApiProperty({ required: false, description: 'Limit for pagination', default: 10 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number;
}
