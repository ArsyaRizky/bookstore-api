import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAuthorDto {
  @ApiProperty({ example: 'J.K. Rowling' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'British author best known for Harry Potter', required: false })
  @IsString()
  @IsOptional()
  bio?: string;
}
