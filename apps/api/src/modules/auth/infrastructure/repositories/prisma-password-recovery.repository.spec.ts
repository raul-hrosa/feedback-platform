import { PasswordRecovery } from '../../domain/entities/password-recovery.entity';

jest.mock('../../../../core/database/database.service', () => ({
  DatabaseService: jest.fn(),
}));

import { PrismaPasswordRecoveryRepository } from './prisma-password-recovery.repository';

const makeDbRecord = (usedAt: Date | null = null) => ({
  id: 'recovery-id-1',
  userId: 'user-id-1',
  token: '550e8400-e29b-41d4-a716-446655440000',
  expiresAt: new Date('2026-01-01T00:15:00.000Z'),
  usedAt,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
});

describe('PrismaPasswordRecoveryRepository', () => {
  let repository: PrismaPasswordRecoveryRepository;
  let mockDb: {
    passwordRecovery: { create: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
  };

  beforeEach(() => {
    mockDb = {
      passwordRecovery: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    };
    repository = new PrismaPasswordRecoveryRepository(
      mockDb as unknown as import('../../../../core/database/database.service').DatabaseService,
    );
  });

  describe('create', () => {
    it('should persist and return a PasswordRecovery entity', async () => {
      mockDb.passwordRecovery.create.mockResolvedValue(makeDbRecord());

      const result = await repository.create({
        userId: 'user-id-1',
        token: '550e8400-e29b-41d4-a716-446655440000',
        expiresAt: new Date('2026-01-01T00:15:00.000Z'),
      });

      expect(result).toBeInstanceOf(PasswordRecovery);
      expect(result.id).toBe('recovery-id-1');
      expect(result.userId).toBe('user-id-1');
      expect(result.usedAt).toBeNull();
      expect(mockDb.passwordRecovery.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-id-1',
          token: '550e8400-e29b-41d4-a716-446655440000',
          expiresAt: new Date('2026-01-01T00:15:00.000Z'),
        },
      });
    });
  });

  describe('findByToken', () => {
    it('should return a PasswordRecovery entity when token exists', async () => {
      mockDb.passwordRecovery.findUnique.mockResolvedValue(makeDbRecord());

      const result = await repository.findByToken('550e8400-e29b-41d4-a716-446655440000');

      expect(result).toBeInstanceOf(PasswordRecovery);
      expect(result?.token).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(result?.usedAt).toBeNull();
      expect(mockDb.passwordRecovery.findUnique).toHaveBeenCalledWith({
        where: { token: '550e8400-e29b-41d4-a716-446655440000' },
      });
    });

    it('should return null when token does not exist', async () => {
      mockDb.passwordRecovery.findUnique.mockResolvedValue(null);

      const result = await repository.findByToken('nonexistent-token');

      expect(result).toBeNull();
    });
  });

  describe('markAsUsed', () => {
    it('should call db.passwordRecovery.update with the correct id and usedAt', async () => {
      mockDb.passwordRecovery.update.mockResolvedValue(undefined);
      const usedAt = new Date('2026-01-01T00:10:00.000Z');

      await repository.markAsUsed('recovery-id-1', usedAt);

      expect(mockDb.passwordRecovery.update).toHaveBeenCalledWith({
        where: { id: 'recovery-id-1' },
        data: { usedAt },
      });
    });
  });
});
