import {
  ForbiddenException,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { HASH_SERVICE, PASSWORD_RECOVERY_REPOSITORY, USER_REPOSITORY } from '../../auth.constants';
import { UserStatus } from '../../domain/enums/user-status.enum';
import { PasswordRecoveryRepository } from '../../domain/repositories/password-recovery.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { HashService } from '../ports/hash.service';
import { ResetPasswordDto } from '../dto/reset-password.dto';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(PASSWORD_RECOVERY_REPOSITORY)
    private readonly passwordRecoveryRepository: PasswordRecoveryRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(HASH_SERVICE) private readonly hashService: HashService,
  ) {}

  async execute(dto: ResetPasswordDto): Promise<void> {
    const recovery = await this.passwordRecoveryRepository.findByToken(dto.token);

    if (!recovery) {
      throw new UnprocessableEntityException('Invalid token');
    }
    if (recovery.expiresAt < new Date()) {
      throw new UnprocessableEntityException('Token expired');
    }
    if (recovery.usedAt !== null) {
      throw new UnprocessableEntityException('Token already used');
    }

    const user = await this.userRepository.findById(recovery.userId);
    if (!user || user.deletedAt !== null || user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Account is not active');
    }

    const passwordHash = await this.hashService.hash(dto.password);
    await this.userRepository.updatePassword(recovery.userId, passwordHash);
    await this.passwordRecoveryRepository.markAsUsed(recovery.id, new Date());
  }
}
