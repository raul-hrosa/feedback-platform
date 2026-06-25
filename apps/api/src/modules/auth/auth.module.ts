import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DatabaseModule } from '../../core/database/database.module';
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import {
  HASH_SERVICE,
  PASSWORD_RECOVERY_REPOSITORY,
  TOKEN_SERVICE,
  USER_REPOSITORY,
} from './auth.constants';
import { BcryptHashService } from './infrastructure/services/bcrypt-hash.service';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { JwtProvider } from './infrastructure/providers/jwt.provider';
import { PrismaPasswordRecoveryRepository } from './infrastructure/repositories/prisma-password-recovery.repository';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'development-secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUserUseCase,
    LoginUserUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    JwtStrategy,
    JwtAuthGuard,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: HASH_SERVICE, useClass: BcryptHashService },
    { provide: TOKEN_SERVICE, useClass: JwtProvider },
    { provide: PASSWORD_RECOVERY_REPOSITORY, useClass: PrismaPasswordRecoveryRepository },
  ],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
