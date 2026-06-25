import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '../../application/ports/token.service';

@Injectable()
export class JwtProvider implements TokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateAccessToken(payload: { sub: string; email: string }): string {
    return this.jwtService.sign(payload);
  }
}
