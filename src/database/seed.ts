import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity.js';

export async function seedAdmin(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);
  const existingAdmin = await userRepository.findOne({
    where: { email: 'admin@bookstore.com' },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = userRepository.create({
      email: 'admin@bookstore.com',
      password: hashedPassword,
      fullName: 'System Admin',
      role: 'admin',
    });
    await userRepository.save(admin);
    console.log('Admin user seeded: admin@bookstore.com / admin123');
  } else {
    console.log('Admin user already exists, skipping seed.');
  }
}
