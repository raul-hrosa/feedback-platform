import { ForbiddenException, UnprocessableEntityException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { HASH_SERVICE, PASSWORD_RECOVERY_REPOSITORY, USER_REPOSITORY } from '../../auth.constants';
import { PasswordRecovery } from '../../domain/entities/password-recovery.entity';
import { User } from '../../domain/entities/user.entity';
import { UserStatus } from '../../domain/enums/user-status.enum';
import { ResetPasswordUseCase } from './reset-password.use-case';

const makeRecovery = (
  overrides: Partial<{
    expiresAt: Date;
    usedAt: Date | null;
  }> = {},
) =>
  new PasswordRecovery(
    'recovery-id-1',
    'user-id-1',
    'valid-token-uuid',
    overrides.expiresAt ?? new Date(Date.now() + 15 * 60 * 1000),
    overrides.usedAt !== undefined ? overrides.usedAt : null,
    new Date(),
  );

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;
  let mockPasswordRecoveryRepository: {
    create: jest.Mock;
    findByToken: jest.Mock;
    markAsUsed: jest.Mock;
  };
  let mockUserRepository: {
    findByEmail: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    updatePassword: jest.Mock;
  };
  let mockHashService: { hash: jest.Mock; compare: jest.Mock };

  beforeEach(async () => {
    mockPasswordRecoveryRepository = {
      create: jest.fn(),
      findByToken: jest.fn(),
      markAsUsed: jest.fn(),
    };
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updatePassword: jest.fn(),
    };
    mockHashService = { hash: jest.fn(), compare: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ResetPasswordUseCase,
        { provide: PASSWORD_RECOVERY_REPOSITORY, useValue: mockPasswordRecoveryRepository },
        { provide: USER_REPOSITORY, useValue: mockUserRepository },
        { provide: HASH_SERVICE, useValue: mockHashService },
      ],
    }).compile();

    useCase = moduleRef.get<ResetPasswordUseCase>(ResetPasswordUseCase);
  });

  it('should reset the password when token is valid', async () => {
    mockPasswordRecoveryRepository.findByToken.mockResolvedValue(makeRecovery());
    mockUserRepository.findById.mockResolvedValue(
      new User(
        'user-id-1',
        'user@email.com',
        'hashed_pw',
        UserStatus.ACTIVE,
        new Date(),
        new Date(),
        null,
      ),
    );
    mockHashService.hash.mockResolvedValue('new_hashed_pw');
    mockUserRepository.updatePassword.mockResolvedValue(undefined);
    mockPasswordRecoveryRepository.markAsUsed.mockResolvedValue(undefined);

    await expect(
      useCase.execute({ token: 'valid-token-uuid', password: 'NewPassword1' }),
    ).resolves.toBeUndefined();

    expect(mockHashService.hash).toHaveBeenCalledWith('NewPassword1');
    expect(mockUserRepository.updatePassword).toHaveBeenCalledWith('user-id-1', 'new_hashed_pw');
    expect(mockPasswordRecoveryRepository.markAsUsed).toHaveBeenCalledWith(
      'recovery-id-1',
      expect.any(Date),
    );
  });

  it('should throw UnprocessableEntityException when token is not found', async () => {
    mockPasswordRecoveryRepository.findByToken.mockResolvedValue(null);

    await expect(
      useCase.execute({ token: 'nonexistent-token', password: 'NewPassword1' }),
    ).rejects.toThrow(UnprocessableEntityException);

    expect(mockUserRepository.updatePassword).not.toHaveBeenCalled();
  });

  it('should throw UnprocessableEntityException when token is expired', async () => {
    mockPasswordRecoveryRepository.findByToken.mockResolvedValue(
      makeRecovery({ expiresAt: new Date(Date.now() - 1000) }),
    );

    await expect(
      useCase.execute({ token: 'valid-token-uuid', password: 'NewPassword1' }),
    ).rejects.toThrow(UnprocessableEntityException);

    expect(mockUserRepository.updatePassword).not.toHaveBeenCalled();
  });

  it('should throw UnprocessableEntityException when token is already used', async () => {
    mockPasswordRecoveryRepository.findByToken.mockResolvedValue(
      makeRecovery({ usedAt: new Date() }),
    );

    await expect(
      useCase.execute({ token: 'valid-token-uuid', password: 'NewPassword1' }),
    ).rejects.toThrow(UnprocessableEntityException);

    expect(mockUserRepository.updatePassword).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when user is inactive', async () => {
    mockPasswordRecoveryRepository.findByToken.mockResolvedValue(makeRecovery());
    mockUserRepository.findById.mockResolvedValue(
      new User(
        'user-id-1',
        'user@email.com',
        'hashed_pw',
        UserStatus.INACTIVE,
        new Date(),
        new Date(),
        null,
      ),
    );

    await expect(
      useCase.execute({ token: 'valid-token-uuid', password: 'NewPassword1' }),
    ).rejects.toThrow(ForbiddenException);

    expect(mockUserRepository.updatePassword).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when user is soft-deleted', async () => {
    mockPasswordRecoveryRepository.findByToken.mockResolvedValue(makeRecovery());
    mockUserRepository.findById.mockResolvedValue(
      new User(
        'user-id-1',
        'user@email.com',
        'hashed_pw',
        UserStatus.ACTIVE,
        new Date(),
        new Date(),
        new Date(),
      ),
    );

    await expect(
      useCase.execute({ token: 'valid-token-uuid', password: 'NewPassword1' }),
    ).rejects.toThrow(ForbiddenException);

    expect(mockUserRepository.updatePassword).not.toHaveBeenCalled();
  });
});
