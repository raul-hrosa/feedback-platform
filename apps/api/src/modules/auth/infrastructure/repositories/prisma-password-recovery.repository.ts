import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../../core/database/database.service';
import { PasswordRecovery } from '../../domain/entities/password-recovery.entity';
import { PasswordRecoveryRepository } from '../../domain/repositories/password-recovery.repository';

@Injectable()
export class PrismaPasswordRecoveryRepository implements PasswordRecoveryRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(data: {
    userId: string;
    token: string;
    expiresAt: Date;
  }): Promise<PasswordRecovery> {
    const record = await this.db.passwordRecovery.create({ data });
    return this.toEntity(record);
  }

  async findByToken(token: string): Promise<PasswordRecovery | null> {
    const record = await this.db.passwordRecovery.findUnique({ where: { token } });
    if (!record) return null;
    return this.toEntity(record);
  }

  async markAsUsed(id: string, usedAt: Date): Promise<void> {
    await this.db.passwordRecovery.update({ where: { id }, data: { usedAt } });
  }

  private toEntity(record: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    usedAt: Date | null;
    createdAt: Date;
  }): PasswordRecovery {
    return new PasswordRecovery(
      record.id,
      record.userId,
      record.token,
      record.expiresAt,
      record.usedAt,
      record.createdAt,
    );
  }
}
