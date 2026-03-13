import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/book.entity.js';
import { BooksService } from './books.service.js';
import { BooksController } from './books.controller.js';
import { AuthorsModule } from '../authors/authors.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Book]), AuthorsModule],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
