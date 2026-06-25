import { ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { USER_REPOSITORY } from '../../auth.constants';
import { UserStatus } from '../../domain/enums/user-status.enum';
import { UserRepository } from '../../domain/repositories/user.repository';

export interface AuthenticatedUser {
  id: string;
  email: string;
  status: UserStatus;
  createdAt: Date;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'development-secret',
    });
  }

  async validate(payload: { sub: string; email: string }): Promise<AuthenticatedUser> {
    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    if (user.deletedAt !== null) {
      throw new ForbiddenException();
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException();
    }
    return { id: user.id, email: user.email, status: user.status, createdAt: user.createdAt };
  }
}
