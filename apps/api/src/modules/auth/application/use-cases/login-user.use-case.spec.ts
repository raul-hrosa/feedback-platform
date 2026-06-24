import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { UserStatus } from '../../domain/enums/user-status.enum';
import { UserRepository } from '../../domain/repositories/user.repository';
import { HashService } from '../ports/hash.service';
import { TokenService } from '../ports/token.service';
import { LoginUserUseCase } from './login-user.use-case';

const makeUser = (status = UserStatus.ACTIVE) =>
  new User('id-1', 'user@email.com', 'hashed_pw', status, new Date(), new Date(), null);

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let hashService: jest.Mocked<HashService>;
  let tokenService: jest.Mocked<TokenService>;

  beforeEach(() => {
    userRepository = { findByEmail: jest.fn(), create: jest.fn() };
    hashService = { hash: jest.fn(), compare: jest.fn() };
    tokenService = { generateAccessToken: jest.fn() };
    useCase = new LoginUserUseCase(userRepository, hashService, tokenService);
  });

  it('should return accessToken on successful login', async () => {
    userRepository.findByEmail.mockResolvedValue(makeUser());
    hashService.compare.mockResolvedValue(true);
    tokenService.generateAccessToken.mockReturnValue('jwt-token');

    const result = await useCase.execute({ email: 'user@email.com', password: '123456' });

    expect(result).toEqual({ accessToken: 'jwt-token' });
    expect(tokenService.generateAccessToken).toHaveBeenCalledWith({
      sub: 'id-1',
      email: 'user@email.com',
    });
  });

  it('should throw UnauthorizedException when user is not found', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute({ email: 'user@email.com', password: '123456' })).rejects.toThrow(
      UnauthorizedException,
    );
    expect(tokenService.generateAccessToken).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when password is invalid', async () => {
    userRepository.findByEmail.mockResolvedValue(makeUser());
    hashService.compare.mockResolvedValue(false);

    await expect(useCase.execute({ email: 'user@email.com', password: 'wrong' })).rejects.toThrow(
      UnauthorizedException,
    );
    expect(tokenService.generateAccessToken).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when user is inactive', async () => {
    userRepository.findByEmail.mockResolvedValue(makeUser(UserStatus.INACTIVE));

    await expect(useCase.execute({ email: 'user@email.com', password: '123456' })).rejects.toThrow(
      ForbiddenException,
    );
    expect(hashService.compare).not.toHaveBeenCalled();
    expect(tokenService.generateAccessToken).not.toHaveBeenCalled();
  });
});
