import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { HASH_SERVICE, TOKEN_SERVICE, USER_REPOSITORY } from '../../auth.constants';
import { User } from '../../domain/entities/user.entity';
import { UserStatus } from '../../domain/enums/user-status.enum';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../../application/use-cases/login-user.use-case';
import { AuthController } from './auth.controller';

const makeUser = (status = UserStatus.ACTIVE) =>
  new User('id-1', 'user@email.com', 'hashed_pw', status, new Date(), new Date(), null);

describe('AuthController (integration)', () => {
  let app: INestApplication;
  let mockUserRepository: { findByEmail: jest.Mock; create: jest.Mock };
  let mockHashService: { hash: jest.Mock; compare: jest.Mock };
  let mockTokenService: { generateAccessToken: jest.Mock };

  beforeEach(async () => {
    mockUserRepository = { findByEmail: jest.fn(), create: jest.fn() };
    mockHashService = { hash: jest.fn(), compare: jest.fn() };
    mockTokenService = { generateAccessToken: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        RegisterUserUseCase,
        LoginUserUseCase,
        { provide: USER_REPOSITORY, useValue: mockUserRepository },
        { provide: HASH_SERVICE, useValue: mockHashService },
        { provide: TOKEN_SERVICE, useValue: mockTokenService },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterEach(async () => await app.close());

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
});
