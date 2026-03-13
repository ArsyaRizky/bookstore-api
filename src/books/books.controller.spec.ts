import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { Reflector } from '@nestjs/core';

describe('BooksController', () => {
  let controller: BooksController;
  let service: jest.Mocked<Partial<BooksService>>;

  const mockBook = {
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

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        { provide: BooksService, useValue: service },
        Reflector,
      ],
    }).compile();

    controller = module.get<BooksController>(BooksController);
  });

  describe('findAll', () => {
    it('should return paginated books', async () => {
      const expected = { data: [mockBook], total: 1 };
      service.findAll!.mockResolvedValue(expected);
      const filter = { q: 'Test' };
      const result = await controller.findAll(filter);
      expect(result).toEqual(expected);
      expect(service.findAll).toHaveBeenCalledWith(filter);
    });
  });

  describe('findOne', () => {
    it('should return a single book', async () => {
      service.findOne!.mockResolvedValue(mockBook);
      const result = await controller.findOne(1);
      expect(result).toEqual(mockBook);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create and return a book', async () => {
      const dto = {
        title: 'New Book',
        authorId: 1,
        isbn: '978-0-9999-9999-9',
        price: 29.99,
        stock: 50,
      };
      service.create!.mockResolvedValue({ ...mockBook, ...dto });
      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result.title).toBe('New Book');
    });
  });

  describe('update', () => {
    it('should update and return the book', async () => {
      const dto = { title: 'Updated Title' };
      service.update!.mockResolvedValue({ ...mockBook, ...dto });
      const result = await controller.update(1, dto);
      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result.title).toBe('Updated Title');
    });
  });

  describe('remove', () => {
    it('should remove the book', async () => {
      service.remove!.mockResolvedValue(undefined);
      await controller.remove(1);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
