import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from './entities/author.entity.js';
import { CreateAuthorDto } from './dto/create-author.dto.js';
import { UpdateAuthorDto } from './dto/update-author.dto.js';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author)
    private readonly authorsRepository: Repository<Author>,
  ) {}

  async findAll(): Promise<Author[]> {
    return this.authorsRepository.find();
  }

  async findOne(id: number): Promise<Author> {
    const author = await this.authorsRepository.findOne({ where: { id } });
    if (!author) {
      throw new NotFoundException('Author not found');
    }
    return author;
  }

  async create(dto: CreateAuthorDto): Promise<Author> {
    const author = this.authorsRepository.create(dto);
    return this.authorsRepository.save(author);
  }

  async update(id: number, dto: UpdateAuthorDto): Promise<Author> {
    const author = await this.findOne(id);
    Object.assign(author, dto);
    return this.authorsRepository.save(author);
  }

  async remove(id: number): Promise<void> {
    const author = await this.findOne(id);
    await this.authorsRepository.remove(author);
  }
}
