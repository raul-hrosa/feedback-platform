import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { USER_REPOSITORY } from '../../auth.constants';
import { User } from '../../domain/entities/user.entity';
import { UserStatus } from '../../domain/enums/user-status.enum';
import { JwtStrategy } from './jwt.strategy';

jest.mock('passport-jwt', () => ({
  ExtractJwt: { fromAuthHeaderAsBearerToken: () => () => null },
  Strategy: class MockStrategy {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor(_options: unknown, _verify: unknown) {}
  },
}));

const makeUser = (status = UserStatus.ACTIVE, deletedAt: Date | null = null) =>
  new User('id-1', 'user@email.com', 'hashed_pw', status, new Date(), new Date(), deletedAt);

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let mockUserRepository: { findById: jest.Mock; findByEmail: jest.Mock; create: jest.Mock };

  beforeEach(async () => {
    mockUserRepository = { findById: jest.fn(), findByEmail: jest.fn(), create: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [JwtStrategy, { provide: USER_REPOSITORY, useValue: mockUserRepository }],
    }).compile();

    strategy = moduleRef.get<JwtStrategy>(JwtStrategy);
  });

  it('validate() returns AuthenticatedUser without passwordHash for a valid active user', async () => {
    mockUserRepository.findById.mockResolvedValue(makeUser());

    const result = await strategy.validate({ sub: 'id-1', email: 'user@email.com' });

    expect(result).toEqual({
      id: 'id-1',
      email: 'user@email.com',
      status: UserStatus.ACTIVE,
      createdAt: expect.any(Date),
    });
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('validate() throws UnauthorizedException when user is not found', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(strategy.validate({ sub: 'id-1', email: 'user@email.com' })).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('validate() throws ForbiddenException when user is inactive', async () => {
    mockUserRepository.findById.mockResolvedValue(makeUser(UserStatus.INACTIVE));

    await expect(strategy.validate({ sub: 'id-1', email: 'user@email.com' })).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('validate() throws ForbiddenException when user is soft-deleted', async () => {
    mockUserRepository.findById.mockResolvedValue(makeUser(UserStatus.ACTIVE, new Date()));

    await expect(strategy.validate({ sub: 'id-1', email: 'user@email.com' })).rejects.toThrow(
      ForbiddenException,
    );
  });
});
