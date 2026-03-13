import { Test, TestingModule } from '@nestjs/testing';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';
import { Reflector } from '@nestjs/core';

describe('AuthorsController', () => {
  let controller: AuthorsController;
  let service: jest.Mocked<Partial<AuthorsService>>;

  const mockAuthor = {
    id: 1,
    name: 'J.K. Rowling',
    bio: 'British author',
    createdAt: new Date(),
    books: [],
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
      controllers: [AuthorsController],
      providers: [
        { provide: AuthorsService, useValue: service },
        Reflector,
      ],
    }).compile();

    controller = module.get<AuthorsController>(AuthorsController);
  });

  describe('findAll', () => {
    it('should return an array of authors', async () => {
      service.findAll!.mockResolvedValue([mockAuthor]);
      const result = await controller.findAll();
      expect(result).toEqual([mockAuthor]);
    });
  });

  describe('findOne', () => {
    it('should return a single author', async () => {
      service.findOne!.mockResolvedValue(mockAuthor);
      const result = await controller.findOne(1);
      expect(result).toEqual(mockAuthor);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create and return an author', async () => {
      const dto = { name: 'New Author', bio: 'A bio' };
      service.create!.mockResolvedValue({ ...mockAuthor, ...dto });
      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result.name).toBe('New Author');
    });
  });

  describe('update', () => {
    it('should update and return the author', async () => {
      const dto = { name: 'Updated Name' };
      service.update!.mockResolvedValue({ ...mockAuthor, ...dto });
      const result = await controller.update(1, dto);
      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result.name).toBe('Updated Name');
    });
  });

  describe('remove', () => {
    it('should remove the author', async () => {
      service.remove!.mockResolvedValue(undefined);
      await controller.remove(1);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
