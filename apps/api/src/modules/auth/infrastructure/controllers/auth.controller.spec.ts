import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import {
  HASH_SERVICE,
  PASSWORD_RECOVERY_REPOSITORY,
  TOKEN_SERVICE,
  USER_REPOSITORY,
} from '../../auth.constants';
import { PasswordRecovery } from '../../domain/entities/password-recovery.entity';
import { User } from '../../domain/entities/user.entity';
import { UserStatus } from '../../domain/enums/user-status.enum';
import { ForgotPasswordUseCase } from '../../application/use-cases/forgot-password.use-case';
import { LoginUserUseCase } from '../../application/use-cases/login-user.use-case';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { AuthController } from './auth.controller';

const TEST_SECRET = 'test-secret';

const makeUser = (status = UserStatus.ACTIVE, deletedAt: Date | null = null) =>
  new User('id-1', 'user@email.com', 'hashed_pw', status, new Date(), new Date(), deletedAt);

const makeRecovery = (overrides: Partial<{ expiresAt: Date; usedAt: Date | null }> = {}) =>
  new PasswordRecovery(
    'recovery-id-1',
    'id-1',
    '550e8400-e29b-41d4-a716-446655440000',
    overrides.expiresAt ?? new Date(Date.now() + 15 * 60 * 1000),
    overrides.usedAt !== undefined ? overrides.usedAt : null,
    new Date(),
  );

describe('AuthController (integration)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let mockUserRepository: {
    findById: jest.Mock;
    findByEmail: jest.Mock;
    create: jest.Mock;
    updatePassword: jest.Mock;
  };
  let mockHashService: { hash: jest.Mock; compare: jest.Mock };
  let mockTokenService: { generateAccessToken: jest.Mock };
  let mockPasswordRecoveryRepository: {
    create: jest.Mock;
    findByToken: jest.Mock;
    markAsUsed: jest.Mock;
  };
  let originalJwtSecret: string | undefined;

  beforeEach(async () => {
    originalJwtSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = TEST_SECRET;

    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      updatePassword: jest.fn(),
    };
    mockHashService = { hash: jest.fn(), compare: jest.fn() };
    mockTokenService = { generateAccessToken: jest.fn() };
    mockPasswordRecoveryRepository = {
      create: jest.fn(),
      findByToken: jest.fn(),
      markAsUsed: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({ secret: TEST_SECRET, signOptions: { expiresIn: '1h' } }),
      ],
      controllers: [AuthController],
      providers: [
        RegisterUserUseCase,
        LoginUserUseCase,
        ForgotPasswordUseCase,
        ResetPasswordUseCase,
        JwtStrategy,
        JwtAuthGuard,
        { provide: USER_REPOSITORY, useValue: mockUserRepository },
        { provide: HASH_SERVICE, useValue: mockHashService },
        { provide: TOKEN_SERVICE, useValue: mockTokenService },
        { provide: PASSWORD_RECOVERY_REPOSITORY, useValue: mockPasswordRecoveryRepository },
      ],
    }).compile();

    jwtService = moduleRef.get<JwtService>(JwtService);
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterEach(async () => {
    process.env.JWT_SECRET = originalJwtSecret;
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should return 201 with id and email', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockHashService.hash.mockResolvedValue('hashed_pw');
      mockUserRepository.create.mockResolvedValue(makeUser());

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'user@email.com', password: '123456' })
        .expect(201);

      expect(response.body).toEqual({ id: 'id-1', email: 'user@email.com' });
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('should return 409 when email already in use', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(makeUser());

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'user@email.com', password: '123456' })
        .expect(409);
    });

    it('should return 400 when email is missing', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ password: '123456' })
        .expect(400);
    });

    it('should return 400 when password is too short', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'user@email.com', password: '123' })
        .expect(400);
    });

    it('should return 400 when password is too long (> 72 chars)', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'user@email.com', password: 'a'.repeat(73) })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should return 200 with accessToken on successful login', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(makeUser());
      mockHashService.compare.mockResolvedValue(true);
      mockTokenService.generateAccessToken.mockReturnValue('jwt-token');

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@email.com', password: '123456' })
        .expect(200);

      expect(response.body).toEqual({ accessToken: 'jwt-token' });
    });

    it('should return 401 when user is not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@email.com', password: '123456' })
        .expect(401);
    });

    it('should return 401 when password is invalid', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(makeUser());
      mockHashService.compare.mockResolvedValue(false);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@email.com', password: 'wrong' })
        .expect(401);
    });

    it('should return 403 when user is inactive', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(makeUser(UserStatus.INACTIVE));

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@email.com', password: '123456' })
        .expect(403);
    });
  });

  describe('GET /auth/me', () => {
    it('should return 200 with user profile for a valid token', async () => {
      const token = jwtService.sign({ sub: 'id-1', email: 'user@email.com' });
      mockUserRepository.findById.mockResolvedValue(makeUser());

      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual({
        id: 'id-1',
        email: 'user@email.com',
        status: 'ACTIVE',
        createdAt: expect.any(String),
      });
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('should return 401 when no token is provided', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('should return 401 for an invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });

    it('should return 401 for an expired token', async () => {
      const expiredToken = jwtService.sign(
        { sub: 'id-1', email: 'user@email.com' },
        { expiresIn: -1 },
      );

      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });

    it('should return 401 when the user no longer exists in the database', async () => {
      const token = jwtService.sign({ sub: 'id-1', email: 'user@email.com' });
      mockUserRepository.findById.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });

    it('should return 403 when the user is inactive', async () => {
      const token = jwtService.sign({ sub: 'id-1', email: 'user@email.com' });
      mockUserRepository.findById.mockResolvedValue(makeUser(UserStatus.INACTIVE));

      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('should return 403 when the user is soft-deleted', async () => {
      const token = jwtService.sign({ sub: 'id-1', email: 'user@email.com' });
      mockUserRepository.findById.mockResolvedValue(makeUser(UserStatus.ACTIVE, new Date()));

      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should return 200 when user exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(makeUser());
      mockPasswordRecoveryRepository.create.mockResolvedValue(makeRecovery());

      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'user@email.com' })
        .expect(200);

      expect(mockPasswordRecoveryRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should return 200 even when user does not exist (no account enumeration)', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'notfound@email.com' })
        .expect(200);

      expect(mockPasswordRecoveryRepository.create).not.toHaveBeenCalled();
    });

    it('should return 400 when email is missing', async () => {
      await request(app.getHttpServer()).post('/auth/forgot-password').send({}).expect(400);
    });
  });

  describe('POST /auth/reset-password', () => {
    it('should return 200 when token is valid', async () => {
      mockPasswordRecoveryRepository.findByToken.mockResolvedValue(makeRecovery());
      mockHashService.hash.mockResolvedValue('new_hashed_pw');
      mockUserRepository.updatePassword.mockResolvedValue(undefined);
      mockPasswordRecoveryRepository.markAsUsed.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ token: '550e8400-e29b-41d4-a716-446655440000', password: 'NewPassword1' })
        .expect(200);

      expect(mockUserRepository.updatePassword).toHaveBeenCalledWith('id-1', 'new_hashed_pw');
    });

    it('should return 422 when token is not found', async () => {
      mockPasswordRecoveryRepository.findByToken.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ token: '550e8400-e29b-41d4-a716-446655440000', password: 'NewPassword1' })
        .expect(422);
    });

    it('should return 422 when token is expired', async () => {
      mockPasswordRecoveryRepository.findByToken.mockResolvedValue(
        makeRecovery({ expiresAt: new Date(Date.now() - 1000) }),
      );

      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ token: '550e8400-e29b-41d4-a716-446655440000', password: 'NewPassword1' })
        .expect(422);
    });

    it('should return 422 when token is already used', async () => {
      mockPasswordRecoveryRepository.findByToken.mockResolvedValue(
        makeRecovery({ usedAt: new Date() }),
      );

      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ token: '550e8400-e29b-41d4-a716-446655440000', password: 'NewPassword1' })
        .expect(422);
    });

    it('should return 400 when request body is invalid', async () => {
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ token: 'not-a-uuid', password: '123' })
        .expect(400);
    });
  });
});
