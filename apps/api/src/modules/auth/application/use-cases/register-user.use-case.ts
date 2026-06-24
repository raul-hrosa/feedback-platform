import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { HASH_SERVICE, USER_REPOSITORY } from '../../auth.constants';
import { UserRepository } from '../../domain/repositories/user.repository';
import { HashService } from '../ports/hash.service';
import { RegisterUserDto } from '../dto/register-user.dto';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(HASH_SERVICE) private readonly hashService: HashService,
  ) {}

  async execute(dto: RegisterUserDto): Promise<{ id: string; email: string }> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await this.hashService.hash(dto.password);
    const user = await this.userRepository.create({ email: dto.email, passwordHash });

    return { id: user.id, email: user.email };
  }
}
