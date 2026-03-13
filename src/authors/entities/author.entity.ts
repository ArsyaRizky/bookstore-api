import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Book } from '../../books/entities/book.entity.js';

@Entity('authors')
export class Author {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Book, (book) => book.author)
  books: Book[];
}
