import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginUserDto } from '../../application/dto/login-user.dto';
import { RegisterUserDto } from '../../application/dto/register-user.dto';
import { LoginUserUseCase } from '../../application/use-cases/login-user.use-case';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly loginUser: LoginUserUseCase,
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
}
