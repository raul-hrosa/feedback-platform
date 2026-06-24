import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../../core/database/database.module';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { HASH_SERVICE, TOKEN_SERVICE, USER_REPOSITORY } from './auth.constants';
import { BcryptHashService } from './infrastructure/services/bcrypt-hash.service';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { JwtProvider } from './infrastructure/providers/jwt.provider';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'development-secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUserUseCase,
    LoginUserUseCase,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: HASH_SERVICE, useClass: BcryptHashService },
    { provide: TOKEN_SERVICE, useClass: JwtProvider },
  ],
})
export class AuthModule {}
