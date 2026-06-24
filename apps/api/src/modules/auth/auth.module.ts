import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database.module';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { HASH_SERVICE, USER_REPOSITORY } from './auth.constants';
import { BcryptHashService } from './infrastructure/services/bcrypt-hash.service';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [
    RegisterUserUseCase,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: HASH_SERVICE, useClass: BcryptHashService },
  ],
})
export class AuthModule {}
