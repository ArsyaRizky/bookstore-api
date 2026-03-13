import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BooksService } from './books.service';
import { Book } from './entities/book.entity';
import { AuthorsService } from '../authors/authors.service';

describe('BooksService', () => {
  let service: BooksService;
  let repo: jest.Mocked<Partial<Repository<Book>>>;
  let authorsService: jest.Mocked<Partial<AuthorsService>>;

  const mockBook: Book = {
    id: 1,
    title: 'Test Book',
    authorId: 1,
    isbn: '978-0-1234-5678-9',
    price: 19.99,
    stock: 100,
    publishedDate: '2023-01-01',
    createdAt: new Date(),
    author: { id: 1, name: 'Author', bio: null, createdAt: new Date(), books: [] },
  };

  const mockQueryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[mockBook], 1]),
  };

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    authorsService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: getRepositoryToken(Book), useValue: repo },
        { provide: AuthorsService, useValue: authorsService },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated books with no filters', async () => {
      const result = await service.findAll({});
      expect(result).toEqual({ data: [mockBook], total: 1 });
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('should apply authorId filter', async () => {
      await service.findAll({ authorId: 1 });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'book.authorId = :authorId',
        { authorId: 1 },
      );
    });

    it('should apply title search filter', async () => {
      await service.findAll({ q: 'Test' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'book.title LIKE :q',
        { q: '%Test%' },
      );
    });

    it('should apply minPrice filter', async () => {
      await service.findAll({ minPrice: 10 });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'book.price >= :minPrice',
        { minPrice: 10 },
      );
    });

    it('should apply maxPrice filter', async () => {
      await service.findAll({ maxPrice: 50 });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'book.price <= :maxPrice',
        { maxPrice: 50 },
      );
    });

    it('should apply custom offset and limit', async () => {
      await service.findAll({ offset: 20, limit: 5 });
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(20);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
    });

    it('should apply all filters together', async () => {
      await service.findAll({
        authorId: 1,
        q: 'Harry',
        minPrice: 5,
        maxPrice: 30,
        offset: 10,
        limit: 20,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(4);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
    });
  });

  describe('findOne', () => {
    it('should return a book with author relation', async () => {
      repo.findOne!.mockResolvedValue(mockBook);
      const result = await service.findOne(1);
      expect(result).toEqual(mockBook);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['author'],
      });
    });

    it('should throw NotFoundException when book not found', async () => {
      repo.findOne!.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const dto = {
      title: 'New Book',
      authorId: 1,
      isbn: '978-0-9999-9999-9',
      price: 29.99,
      stock: 50,
    };

    it('should validate author and create a book', async () => {
      authorsService.findOne!.mockResolvedValue(mockBook.author);
      repo.create!.mockReturnValue(mockBook);
      repo.save!.mockResolvedValue(mockBook);

      const result = await service.create(dto);

      expect(authorsService.findOne).toHaveBeenCalledWith(1);
      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockBook);
    });

    it('should throw BadRequestException when author does not exist', async () => {
      authorsService.findOne!.mockRejectedValue(new NotFoundException());
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    const dto = { title: 'Updated Title' };

    it('should update and return the book', async () => {
      const updatedBook = { ...mockBook, ...dto };
      repo.findOne!.mockResolvedValue({ ...mockBook });
      repo.save!.mockResolvedValue(updatedBook);

      const result = await service.update(1, dto);

      expect(repo.save).toHaveBeenCalled();
      expect(result).toEqual(updatedBook);
    });

    it('should validate author when authorId is provided', async () => {
      repo.findOne!.mockResolvedValue({ ...mockBook });
      authorsService.findOne!.mockResolvedValue(mockBook.author);
      repo.save!.mockResolvedValue(mockBook);

      await service.update(1, { authorId: 2 });

      expect(authorsService.findOne).toHaveBeenCalledWith(2);
    });

    it('should throw BadRequestException when new authorId is invalid', async () => {
      repo.findOne!.mockResolvedValue({ ...mockBook });
      authorsService.findOne!.mockRejectedValue(new NotFoundException());

      await expect(service.update(1, { authorId: 999 })).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when book not found', async () => {
      repo.findOne!.mockResolvedValue(null);
      await expect(service.update(999, dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove the book', async () => {
      repo.findOne!.mockResolvedValue(mockBook);
      repo.remove!.mockResolvedValue(mockBook);

      await service.remove(1);

      expect(repo.remove).toHaveBeenCalledWith(mockBook);
    });

    it('should throw NotFoundException when book not found', async () => {
      repo.findOne!.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
