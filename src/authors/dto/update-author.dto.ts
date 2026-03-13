import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAuthorDto {
  @ApiProperty({ example: 'J.K. Rowling', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'Updated bio', required: false })
  @IsString()
  @IsOptional()
  bio?: string;
}
