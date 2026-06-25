import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ForgotPasswordDto } from '../../application/dto/forgot-password.dto';
import { LoginUserDto } from '../../application/dto/login-user.dto';
import { RegisterUserDto } from '../../application/dto/register-user.dto';
import { ResetPasswordDto } from '../../application/dto/reset-password.dto';
import { ForgotPasswordUseCase } from '../../application/use-cases/forgot-password.use-case';
import { LoginUserUseCase } from '../../application/use-cases/login-user.use-case';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case';
import { CurrentUser } from '../decorators/current-user.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthenticatedUser } from '../strategies/jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly loginUser: LoginUserUseCase,
    private readonly forgotPassword: ForgotPasswordUseCase,
    private readonly resetPassword: ResetPasswordUseCase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterUserDto) {
    return this.registerUser.execute(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginUserDto) {
    return this.loginUser.execute(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPasswordEndpoint(@Body() dto: ForgotPasswordDto) {
    return this.forgotPassword.execute(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPasswordEndpoint(@Body() dto: ResetPasswordDto) {
    return this.resetPassword.execute(dto);
  }
}
