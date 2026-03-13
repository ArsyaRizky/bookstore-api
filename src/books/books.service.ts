import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity.js';
import { CreateBookDto } from './dto/create-book.dto.js';
import { UpdateBookDto } from './dto/update-book.dto.js';
import { FilterBooksDto } from './dto/filter-books.dto.js';
import { AuthorsService } from '../authors/authors.service.js';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
    private readonly authorsService: AuthorsService,
  ) {}

  async findAll(
    filter: FilterBooksDto,
  ): Promise<{ data: Book[]; total: number }> {
    const qb = this.booksRepository.createQueryBuilder('book');

    if (filter.authorId) {
      qb.andWhere('book.authorId = :authorId', { authorId: filter.authorId });
    }

    if (filter.q) {
      qb.andWhere('book.title LIKE :q', { q: `%${filter.q}%` });
    }

    if (filter.minPrice !== undefined) {
      qb.andWhere('book.price >= :minPrice', { minPrice: filter.minPrice });
    }

    if (filter.maxPrice !== undefined) {
      qb.andWhere('book.price <= :maxPrice', { maxPrice: filter.maxPrice });
    }

    const offset = filter.offset ?? 0;
    const limit = filter.limit ?? 10;

    qb.skip(offset).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.booksRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return book;
  }

  async create(dto: CreateBookDto): Promise<Book> {
    await this.validateAuthor(dto.authorId);
    const book = this.booksRepository.create(dto);
    return this.booksRepository.save(book);
  }

  async update(id: number, dto: UpdateBookDto): Promise<Book> {
    const book = await this.findOne(id);
    if (dto.authorId) {
      await this.validateAuthor(dto.authorId);
    }
    Object.assign(book, dto);
    return this.booksRepository.save(book);
  }

  async remove(id: number): Promise<void> {
    const book = await this.findOne(id);
    await this.booksRepository.remove(book);
  }

  private async validateAuthor(authorId: number): Promise<void> {
    try {
      await this.authorsService.findOne(authorId);
    } catch {
      throw new BadRequestException('Invalid authorId: author does not exist');
    }
  }
}
