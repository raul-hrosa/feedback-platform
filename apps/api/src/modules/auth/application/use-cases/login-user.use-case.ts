import { ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { HASH_SERVICE, TOKEN_SERVICE, USER_REPOSITORY } from '../../auth.constants';
import { UserStatus } from '../../domain/enums/user-status.enum';
import { UserRepository } from '../../domain/repositories/user.repository';
import { HashService } from '../ports/hash.service';
import { TokenService } from '../ports/token.service';
import { LoginUserDto } from '../dto/login-user.dto';

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(HASH_SERVICE) private readonly hashService: HashService,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
  ) {}

  async execute(dto: LoginUserDto): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Account is inactive');
    }

    const isPasswordValid = await this.hashService.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.tokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
    });
    return { accessToken };
  }
}
