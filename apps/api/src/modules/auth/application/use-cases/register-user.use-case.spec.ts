import { ConflictException } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { UserStatus } from '../../domain/enums/user-status.enum';
import { UserRepository } from '../../domain/repositories/user.repository';
import { HashService } from '../ports/hash.service';
import { RegisterUserUseCase } from './register-user.use-case';

const makeUser = () =>
  new User('id-1', 'user@email.com', 'hashed_pw', UserStatus.ACTIVE, new Date(), new Date(), null);

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let hashService: jest.Mocked<HashService>;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      updatePassword: jest.fn(),
    };
    hashService = { hash: jest.fn(), compare: jest.fn() };
    useCase = new RegisterUserUseCase(userRepository, hashService);
  });

  it('should register a user and return id and email', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    hashService.hash.mockResolvedValue('hashed_pw');
    userRepository.create.mockResolvedValue(makeUser());

    const result = await useCase.execute({ email: 'user@email.com', password: '123456' });

    expect(result).toEqual({ id: 'id-1', email: 'user@email.com' });
    expect(hashService.hash).toHaveBeenCalledWith('123456');
    expect(userRepository.create).toHaveBeenCalledWith({
      email: 'user@email.com',
      passwordHash: 'hashed_pw',
    });
  });

  it('should throw ConflictException when email is already in use', async () => {
    userRepository.findByEmail.mockResolvedValue(makeUser());

    await expect(useCase.execute({ email: 'user@email.com', password: '123456' })).rejects.toThrow(
      ConflictException,
    );
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it('should not include passwordHash in the response', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    hashService.hash.mockResolvedValue('hashed_pw');
    userRepository.create.mockResolvedValue(makeUser());

    const result = await useCase.execute({ email: 'user@email.com', password: '123456' });

    expect(result).not.toHaveProperty('passwordHash');
  });
});
