import { User } from '../../domain/entities/user.entity';
import { UserStatus } from '../../domain/enums/user-status.enum';

jest.mock('../../../../core/database/database.service', () => ({
  DatabaseService: jest.fn(),
}));

import { PrismaUserRepository } from './prisma-user.repository';

const makeDbRecord = () => ({
  id: 'id-1',
  email: 'user@email.com',
  passwordHash: 'hashed_pw',
  status: 'ACTIVE' as const,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
});

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let mockDb: { user: { findUnique: jest.Mock; create: jest.Mock } };

  beforeEach(() => {
    mockDb = { user: { findUnique: jest.fn(), create: jest.fn() } };
    repository = new PrismaUserRepository(
      mockDb as unknown as import('../../../../core/database/database.service').DatabaseService,
    );
  });

  describe('findByEmail', () => {
    it('should return a User entity when record exists', async () => {
      mockDb.user.findUnique.mockResolvedValue(makeDbRecord());

      const result = await repository.findByEmail('user@email.com');

      expect(result).toBeInstanceOf(User);
      expect(result?.email).toBe('user@email.com');
      expect(result?.status).toBe(UserStatus.ACTIVE);
      expect(mockDb.user.findUnique).toHaveBeenCalledWith({ where: { email: 'user@email.com' } });
    });

    it('should return null when record does not exist', async () => {
      mockDb.user.findUnique.mockResolvedValue(null);

      const result = await repository.findByEmail('notfound@email.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should persist and return a User entity', async () => {
      mockDb.user.create.mockResolvedValue(makeDbRecord());

      const result = await repository.create({
        email: 'user@email.com',
        passwordHash: 'hashed_pw',
      });

      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe('id-1');
      expect(result.status).toBe(UserStatus.ACTIVE);
      expect(mockDb.user.create).toHaveBeenCalledWith({
        data: { email: 'user@email.com', passwordHash: 'hashed_pw' },
      });
    });
  });

  describe('findById', () => {
    it('should return a User entity when record exists', async () => {
      mockDb.user.findUnique.mockResolvedValue(makeDbRecord());

      const result = await repository.findById('id-1');

      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe('id-1');
      expect(result?.status).toBe(UserStatus.ACTIVE);
      expect(mockDb.user.findUnique).toHaveBeenCalledWith({ where: { id: 'id-1' } });
    });

    it('should return null when record does not exist', async () => {
      mockDb.user.findUnique.mockResolvedValue(null);

      const result = await repository.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });
});
