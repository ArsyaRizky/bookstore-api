import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateBookDto {
  @ApiProperty({ example: 'Harry Potter and the Philosopher\'s Stone' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  authorId: number;

  @ApiProperty({ example: '978-0-7475-3269-9' })
  @IsString()
  @IsNotEmpty()
  isbn: string;

  @ApiProperty({ example: 19.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({ example: '1997-06-26', required: false })
  @IsString()
  @IsOptional()
  publishedDate?: string;
}
