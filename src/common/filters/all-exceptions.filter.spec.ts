import {
  HttpException,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter.js';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockHost: any;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    };
  });

  it('should format BadRequestException as VALIDATION_ERROR', () => {
    const exception = new BadRequestException('Invalid input');
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: { code: 'VALIDATION_ERROR', message: 'Invalid input' },
    });
  });

  it('should format validation pipe errors (array messages)', () => {
    const exception = new BadRequestException({
      message: ['email must be an email', 'password is too short'],
      error: 'Bad Request',
    });
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'email must be an email; password is too short',
      },
    });
  });

  it('should format UnauthorizedException as UNAUTHORIZED', () => {
    const exception = new UnauthorizedException('Invalid credentials');
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' },
    });
  });

  it('should format ForbiddenException as FORBIDDEN', () => {
    const exception = new ForbiddenException('Admin role required');
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: { code: 'FORBIDDEN', message: 'Admin role required' },
    });
  });

  it('should format NotFoundException as NOT_FOUND', () => {
    const exception = new NotFoundException('Book not found');
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: { code: 'NOT_FOUND', message: 'Book not found' },
    });
  });

  it('should format ConflictException as CONFLICT', () => {
    const exception = new ConflictException('Email already exists');
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: { code: 'CONFLICT', message: 'Email already exists' },
    });
  });

  it('should format unknown exceptions as INTERNAL_ERROR', () => {
    const exception = new Error('Something broke');
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  });
});
