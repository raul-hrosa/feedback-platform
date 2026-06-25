import { Test } from '@nestjs/testing';
import { PASSWORD_RECOVERY_REPOSITORY, USER_REPOSITORY } from '../../auth.constants';
import { PasswordRecovery } from '../../domain/entities/password-recovery.entity';
import { User } from '../../domain/entities/user.entity';
import { UserStatus } from '../../domain/enums/user-status.enum';
import { ForgotPasswordUseCase } from './forgot-password.use-case';

const makeUser = () =>
  new User(
    'user-id-1',
    'user@email.com',
    'hashed_pw',
    UserStatus.ACTIVE,
    new Date(),
    new Date(),
    null,
  );

const makeRecovery = () =>
  new PasswordRecovery(
    'recovery-id-1',
    'user-id-1',
    '550e8400-e29b-41d4-a716-446655440000',
    new Date(Date.now() + 15 * 60 * 1000),
    null,
    new Date(),
  );

describe('ForgotPasswordUseCase', () => {
  let useCase: ForgotPasswordUseCase;
  let mockUserRepository: {
    findByEmail: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    updatePassword: jest.Mock;
  };
  let mockPasswordRecoveryRepository: {
    create: jest.Mock;
    findByToken: jest.Mock;
    markAsUsed: jest.Mock;
  };

  beforeEach(async () => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updatePassword: jest.fn(),
    };
    mockPasswordRecoveryRepository = {
      create: jest.fn(),
      findByToken: jest.fn(),
      markAsUsed: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ForgotPasswordUseCase,
        { provide: USER_REPOSITORY, useValue: mockUserRepository },
        { provide: PASSWORD_RECOVERY_REPOSITORY, useValue: mockPasswordRecoveryRepository },
      ],
    }).compile();

    useCase = moduleRef.get<ForgotPasswordUseCase>(ForgotPasswordUseCase);
  });

  it('should create a recovery token when user exists', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(makeUser());
    mockPasswordRecoveryRepository.create.mockResolvedValue(makeRecovery());
    const before = Date.now();

    await useCase.execute({ email: 'user@email.com' });

    const after = Date.now();
    expect(mockPasswordRecoveryRepository.create).toHaveBeenCalledTimes(1);
    const call = mockPasswordRecoveryRepository.create.mock.calls[0][0] as {
      userId: string;
      token: string;
      expiresAt: Date;
    };
    expect(call.userId).toBe('user-id-1');
    expect(typeof call.token).toBe('string');
    expect(call.token).toHaveLength(36);
    expect(call.expiresAt.getTime()).toBeGreaterThanOrEqual(before + 15 * 60 * 1000);
    expect(call.expiresAt.getTime()).toBeLessThanOrEqual(after + 15 * 60 * 1000);
  });

  it('should return silently without creating a token when user does not exist', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute({ email: 'notfound@email.com' })).resolves.toBeUndefined();

    expect(mockPasswordRecoveryRepository.create).not.toHaveBeenCalled();
  });
});
