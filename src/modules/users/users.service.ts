import bcrypt from 'bcrypt';
import { UsersRepository } from '@/modules/users/users.repository';
import { NotFoundError, ConflictError, ValidationError } from '@/shared/errors';
import type { CreateUserDto, UpdateUserDto, UserListResponse, UserQuery, UserResponse } from '@/modules/users/users.schema';
import { FastifyRequest } from 'fastify';
import { deleteFile, uploadImage } from '@/utils/upload/upload';
import { formatThaiShort } from '@/utils/time/time';
import { User } from '@/db/schema/users';

const repo = new UsersRepository();

function mapUserToResponse(user: User): UserResponse {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    avatar: user.avatar,
    createdAt: formatThaiShort(user.createdAt),
    updatedAt: formatThaiShort(user.updatedAt),
  };
}

export class UsersService {
  async getAll(query: UserQuery): Promise<UserListResponse> {
    const { rows, total } = await repo.findAll(query);
    const users = rows.map(mapUserToResponse);
    return { rows: users, total };
  }

  async getById(id: number): Promise<UserResponse> {
    const user = await repo.findById(id);
    if (!user) throw new NotFoundError('User not found');
    return mapUserToResponse(user);
  }

  async create(data: CreateUserDto): Promise<UserResponse> {
    // ตรวจ email ซ้ำ
    const existing = await repo.findByEmail(data.email);
    if (existing) throw new ConflictError('Email already in use');

    // hash password ก่อน save
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await repo.create({ ...data, password: hashedPassword });
    return mapUserToResponse(user);
  }

  async update(id: number, data: UpdateUserDto): Promise<UserResponse> {
    const existing = await repo.findById(id);
    if (!existing) throw new NotFoundError('User');

    // ถ้าจะเปลี่ยน email ตรวจซ้ำด้วย
    if (data.email && data.email !== existing.email) {
      const emailTaken = await repo.findByEmail(data.email);
      if (emailTaken) throw new ConflictError('Email already in use');
    }

    const user = await repo.update(id, data);
    return mapUserToResponse(user);
  }

  async uploadAvatar(id: number, req: FastifyRequest): Promise<void> {
    const user = await repo.findById(id);
    if (!user) throw new NotFoundError('User');

    const file = await req.file();
    if (!file) throw new ValidationError('No file uploaded');

    const buffer = await file.toBuffer();
    const mimetype = file.mimetype;
    const filename = file.filename;
    const result = await uploadImage({
      buffer,
      originalName: filename,
      mimeType: mimetype,
      resize: 'thumbnail',  // ← ควรใส่
    });

    if (user.avatar) await deleteFile(user.avatar);  // ← ควรมี

    await repo.updateAvatar(id, result.path);
  }

  async delete(id: number): Promise<void> {
    const existing = await repo.findById(id);
    if (!existing) throw new NotFoundError('User');

    await repo.delete(id);
  }
}
