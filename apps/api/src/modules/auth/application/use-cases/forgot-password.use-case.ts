import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { PASSWORD_RECOVERY_REPOSITORY, USER_REPOSITORY } from '../../auth.constants';
import { PasswordRecoveryRepository } from '../../domain/repositories/password-recovery.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(PASSWORD_RECOVERY_REPOSITORY)
    private readonly passwordRecoveryRepository: PasswordRecoveryRepository,
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) return;

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.passwordRecoveryRepository.create({ userId: user.id, token, expiresAt });
  }
}
