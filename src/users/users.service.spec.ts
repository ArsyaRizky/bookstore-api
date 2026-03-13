import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<Partial<Repository<User>>>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedpassword',
    fullName: 'Test User',
    role: 'customer',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findByEmail', () => {
    it('should return a user when found', async () => {
      repo.findOne!.mockResolvedValue(mockUser);
      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    });

    it('should return null when user not found', async () => {
      repo.findOne!.mockResolvedValue(null);
      const result = await service.findByEmail('notfound@example.com');
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      repo.findOne!.mockResolvedValue(mockUser);
      const result = await service.findById(1);
      expect(result).toEqual(mockUser);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return null when user not found', async () => {
      repo.findOne!.mockResolvedValue(null);
      const result = await service.findById(999);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const createData = {
      email: 'new@example.com',
      password: 'password123',
      fullName: 'New User',
      role: 'customer' as const,
    };

    it('should create and return a new user with hashed password', async () => {
      repo.findOne!.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      const createdUser = { ...mockUser, email: createData.email, fullName: createData.fullName };
      repo.create!.mockReturnValue(createdUser);
      repo.save!.mockResolvedValue(createdUser);

      const result = await service.create(createData);

      expect(repo.findOne).toHaveBeenCalledWith({ where: { email: createData.email } });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(repo.create).toHaveBeenCalledWith({
        ...createData,
        password: 'hashedpassword',
      });
      expect(repo.save).toHaveBeenCalledWith(createdUser);
      expect(result).toEqual(createdUser);
    });

    it('should throw ConflictException if email already exists', async () => {
      repo.findOne!.mockResolvedValue(mockUser);
      await expect(service.create(createData)).rejects.toThrow(ConflictException);
    });
  });
});
