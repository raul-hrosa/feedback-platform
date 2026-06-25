import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../../core/database/database.service';
import { User } from '../../domain/entities/user.entity';
import { UserStatus } from '../../domain/enums/user-status.enum';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly db: DatabaseService) {}

  async findById(id: string): Promise<User | null> {
    const record = await this.db.user.findUnique({ where: { id } });
    if (!record) return null;
    return this.toEntity(record);
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.db.user.findUnique({ where: { email } });
    if (!record) return null;
    return this.toEntity(record);
  }

  async create(data: { email: string; passwordHash: string }): Promise<User> {
    const record = await this.db.user.create({ data });
    return this.toEntity(record);
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.db.user.update({ where: { id }, data: { passwordHash } });
  }

  private toEntity(record: {
    id: string;
    email: string;
    passwordHash: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }): User {
    return new User(
      record.id,
      record.email,
      record.passwordHash,
      record.status as UserStatus,
      record.createdAt,
      record.updatedAt,
      record.deletedAt,
    );
  }
}
