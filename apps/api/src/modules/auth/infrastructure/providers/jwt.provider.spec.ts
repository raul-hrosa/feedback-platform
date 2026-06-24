import { JwtService } from '@nestjs/jwt';
import { JwtProvider } from './jwt.provider';

describe('JwtProvider', () => {
  let provider: JwtProvider;
  let jwtService: jest.Mocked<Pick<JwtService, 'sign'>>;

  beforeEach(() => {
    jwtService = { sign: jest.fn() };
    provider = new JwtProvider(jwtService as unknown as JwtService);
  });

  it('generateAccessToken() should call jwtService.sign with payload and return token', () => {
    jwtService.sign.mockReturnValue('jwt-token');

    const result = provider.generateAccessToken({ sub: 'id-1', email: 'user@email.com' });

    expect(result).toBe('jwt-token');
    expect(jwtService.sign).toHaveBeenCalledWith({ sub: 'id-1', email: 'user@email.com' });
  });
});
