import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateBookDto {
  @ApiProperty({ example: 'Updated Book Title', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  authorId?: number;

  @ApiProperty({ example: '978-0-7475-3269-9', required: false })
  @IsString()
  @IsOptional()
  isbn?: string;

  @ApiProperty({ example: 24.99, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({ example: 50, required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiProperty({ example: '1997-06-26', required: false })
  @IsString()
  @IsOptional()
  publishedDate?: string;
}
