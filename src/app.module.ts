import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module.js';
import { AuthorsModule } from './authors/authors.module.js';
import { BooksModule } from './books/books.module.js';
import { AuthModule } from './auth/auth.module.js';
import { User } from './users/entities/user.entity.js';
import { Author } from './authors/entities/author.entity.js';
import { Book } from './books/entities/book.entity.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mssql',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: parseInt(config.get<string>('DB_PORT', '1433'), 10),
        username: config.get<string>('DB_USERNAME', 'sa'),
        password: config.get<string>('DB_PASSWORD', 'admindb'),
        database: config.get<string>('DB_DATABASE', 'bookstore'),
        entities: [User, Author, Book],
        synchronize: true,
        options: {
          trustServerCertificate: true,
        },
      }),
    }),
    UsersModule,
    AuthorsModule,
    BooksModule,
    AuthModule,
  ],
})
export class AppModule {}
