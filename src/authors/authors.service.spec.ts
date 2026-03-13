import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AuthorsService } from './authors.service';
import { Author } from './entities/author.entity';

describe('AuthorsService', () => {
  let service: AuthorsService;
  let repo: jest.Mocked<Partial<Repository<Author>>>;

  const mockAuthor: Author = {
    id: 1,
    name: 'J.K. Rowling',
    bio: 'British author',
    createdAt: new Date(),
    books: [],
  };

  beforeEach(async () => {
    repo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorsService,
        { provide: getRepositoryToken(Author), useValue: repo },
      ],
    }).compile();

    service = module.get<AuthorsService>(AuthorsService);
  });

  describe('findAll', () => {
    it('should return an array of authors', async () => {
      const authors = [mockAuthor];
      repo.find!.mockResolvedValue(authors);
      const result = await service.findAll();
      expect(result).toEqual(authors);
      expect(repo.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an author when found', async () => {
      repo.findOne!.mockResolvedValue(mockAuthor);
      const result = await service.findOne(1);
      expect(result).toEqual(mockAuthor);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when author not found', async () => {
      repo.findOne!.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return an author', async () => {
      const dto = { name: 'New Author', bio: 'A bio' };
      repo.create!.mockReturnValue(mockAuthor);
      repo.save!.mockResolvedValue(mockAuthor);

      const result = await service.create(dto);

      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalledWith(mockAuthor);
      expect(result).toEqual(mockAuthor);
    });
  });

  describe('update', () => {
    it('should update and return the author', async () => {
      const dto = { name: 'Updated Name' };
      const updatedAuthor = { ...mockAuthor, ...dto };
      repo.findOne!.mockResolvedValue({ ...mockAuthor });
      repo.save!.mockResolvedValue(updatedAuthor);

      const result = await service.update(1, dto);

      expect(repo.save).toHaveBeenCalled();
      expect(result).toEqual(updatedAuthor);
    });

    it('should throw NotFoundException when updating non-existent author', async () => {
      repo.findOne!.mockResolvedValue(null);
      await expect(service.update(999, { name: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove the author', async () => {
      repo.findOne!.mockResolvedValue(mockAuthor);
      repo.remove!.mockResolvedValue(mockAuthor);

      await service.remove(1);

      expect(repo.remove).toHaveBeenCalledWith(mockAuthor);
    });

    it('should throw NotFoundException when removing non-existent author', async () => {
      repo.findOne!.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
