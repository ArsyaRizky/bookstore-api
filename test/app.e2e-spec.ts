import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { AllExceptionsFilter } from './../src/common/filters/all-exceptions.filter';

describe('Bookstore API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    const registerDto = {
      email: `e2e-test-${Date.now()}@example.com`,
      password: 'password123',
      fullName: 'E2E Test User',
    };

    it('POST /auth/register - should register a new customer', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('email', registerDto.email);
          expect(res.body).toHaveProperty('fullName', registerDto.fullName);
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('POST /auth/register - should reject invalid data', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'not-an-email' })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('error');
          expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
        });
    });

    it('POST /auth/login - should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'wrong' })
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('error');
          expect(res.body.error).toHaveProperty('code', 'UNAUTHORIZED');
        });
    });
  });

  describe('Protected routes without auth', () => {
    it('GET /authors - should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/authors')
        .expect(401);
    });

    it('GET /books - should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/books')
        .expect(401);
    });

    it('POST /authors - should return 401 without token', () => {
      return request(app.getHttpServer())
        .post('/authors')
        .send({ name: 'Test Author' })
        .expect(401);
    });

    it('POST /books - should return 401 without token', () => {
      return request(app.getHttpServer())
        .post('/books')
        .send({ title: 'Test Book', authorId: 1, isbn: '123', price: 10, stock: 5 })
        .expect(401);
    });
  });
});
