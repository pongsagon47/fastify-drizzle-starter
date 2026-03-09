import { hash } from 'crypto';
import { UsersRepository } from '@/modules/users/users.repository.js';
import { NotFoundError, ConflictError } from '@/shared/errors.js';
import { createMeta, paginatedResponse, successResponse } from '@/shared/response.js';
import type { CreateUserDto, UpdateUserDto, UserQuery } from '@/modules/users/users.schema.js';

const repo = new UsersRepository();

export class UsersService {
  async getAll(query: UserQuery) {
    const { rows, total } = await repo.findAll(query);
    const meta = createMeta(query.page, query.limit, total);

    return paginatedResponse(rows, meta);
  }

  async getById(id: number) {
    const user = await repo.findById(id);
    if (!user) throw new NotFoundError('User');
    return successResponse(user);
  }

  async create(data: CreateUserDto) {
    // ตรวจ email ซ้ำ
    const existing = await repo.findByEmail(data.email);
    if (existing) throw new ConflictError('Email already in use');

    // hash password ก่อน save
    const hashedPassword = hash('sha256', data.password);

    const user = await repo.create({ ...data, password: hashedPassword });
    return successResponse(user, 'User created successfully');
  }

  async update(id: number, data: UpdateUserDto) {
    const existing = await repo.findById(id);
    if (!existing) throw new NotFoundError('User');

    // ถ้าจะเปลี่ยน email ตรวจซ้ำด้วย
    if (data.email && data.email !== existing.email) {
      const emailTaken = await repo.findByEmail(data.email);
      if (emailTaken) throw new ConflictError('Email already in use');
    }

    const user = await repo.update(id, data);
    return successResponse(user, 'User updated successfully');
  }

  async delete(id: number) {
    const existing = await repo.findById(id);
    if (!existing) throw new NotFoundError('User');

    await repo.delete(id);
    return successResponse(null, 'User deleted successfully');
  }
}
