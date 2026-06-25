import { PasswordRecovery } from '../entities/password-recovery.entity';

export interface PasswordRecoveryRepository {
  create(data: { userId: string; token: string; expiresAt: Date }): Promise<PasswordRecovery>;
  findByToken(token: string): Promise<PasswordRecovery | null>;
  markAsUsed(id: string, usedAt: Date): Promise<void>;
}
