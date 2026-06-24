import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { HASH_SERVICE, USER_REPOSITORY } from '../../auth.constants';
import { User } from '../../domain/entities/user.entity';
import { UserStatus } from '../../domain/enums/user-status.enum';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { AuthController } from './auth.controller';

const makeUser = () =>
  new User('id-1', 'user@email.com', 'hashed_pw', UserStatus.ACTIVE, new Date(), new Date(), null);

describe('AuthController (integration)', () => {
  let app: INestApplication;
  let mockUserRepository: { findByEmail: jest.Mock; create: jest.Mock };
  let mockHashService: { hash: jest.Mock };

  beforeEach(async () => {
    mockUserRepository = { findByEmail: jest.fn(), create: jest.fn() };
    mockHashService = { hash: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        RegisterUserUseCase,
        { provide: USER_REPOSITORY, useValue: mockUserRepository },
        { provide: HASH_SERVICE, useValue: mockHashService },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterEach(async () => await app.close());

  it('POST /auth/register → 201 with id and email', async () => {
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

  it('POST /auth/register → 409 when email already in use', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(makeUser());

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'user@email.com', password: '123456' })
      .expect(409);
  });

  it('POST /auth/register → 400 when email is missing', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ password: '123456' })
      .expect(400);
  });

  it('POST /auth/register → 400 when password is too short', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'user@email.com', password: '123' })
      .expect(400);
  });

  it('POST /auth/register → 400 when password is too long (> 72 chars)', async () => {
    const longPassword = 'a'.repeat(73);
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'user@email.com', password: longPassword })
      .expect(400);
  });
});
