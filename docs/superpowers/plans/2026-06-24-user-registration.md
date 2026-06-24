# FEAT-006 User Registration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement `POST /api/auth/register` allowing new users to sign up with email and password.

**Architecture:** Layered module structure — domain entities and repository interface, application use case with injected ports (UserRepository, HashService), infrastructure adapters (Prisma, bcrypt), NestJS controller. The use case orchestrates all business logic; passwordHash never leaves the domain.

**Tech Stack:** NestJS 11, Prisma 7, MySQL 8, bcrypt, class-validator, class-transformer, Jest, Supertest

## Global Constraints

- Module path: `apps/api/src/modules/auth/`
- Layering rule: domain → application → infrastructure (no reverse imports)
- `passwordHash` must never appear in any API response
- All DI tokens defined in `auth.constants.ts` as Symbols
- All commands run from project root
- Migration requires `DATABASE_URL=mysql://project_nps:project_nps@localhost:3306/project_nps`

---

## File Map

**New files:**

- `apps/api/src/modules/auth/auth.constants.ts`
- `apps/api/src/modules/auth/auth.module.ts`
- `apps/api/src/modules/auth/domain/enums/user-status.enum.ts`
- `apps/api/src/modules/auth/domain/entities/user.entity.ts`
- `apps/api/src/modules/auth/domain/repositories/user.repository.ts`
- `apps/api/src/modules/auth/application/ports/hash.service.ts`
- `apps/api/src/modules/auth/application/dto/register-user.dto.ts`
- `apps/api/src/modules/auth/application/use-cases/register-user.use-case.ts`
- `apps/api/src/modules/auth/application/use-cases/register-user.use-case.spec.ts`
- `apps/api/src/modules/auth/infrastructure/services/bcrypt-hash.service.ts`
- `apps/api/src/modules/auth/infrastructure/repositories/prisma-user.repository.ts`
- `apps/api/src/modules/auth/infrastructure/repositories/prisma-user.repository.spec.ts`
- `apps/api/src/modules/auth/infrastructure/controllers/auth.controller.ts`
- `apps/api/src/modules/auth/infrastructure/controllers/auth.controller.spec.ts`

**Modified files:**

- `prisma/schema.prisma` — add `UserStatus` enum, `status`, `deletedAt` to User
- `apps/api/src/app/app.module.ts` — import `AuthModule`
- `apps/api/src/main.ts` — add `ValidationPipe`

---

## Task 1: Install dependencies and configure ValidationPipe

**Files:**

- Modify: `apps/api/src/main.ts`

**Interfaces:**

- Produces: `ValidationPipe` enabled globally; `bcrypt`, `class-validator`, `class-transformer`, `supertest` available as packages

- [ ] **Step 1: Install runtime dependencies**

```bash
npm install bcrypt class-validator class-transformer
npm install --save-dev @types/bcrypt supertest @types/supertest
```

Expected: packages added to `node_modules` and `package.json`

- [ ] **Step 2: Add ValidationPipe to main.ts**

`apps/api/src/main.ts`:

```typescript
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  const port = process.env.PORT || 3003;
  await app.listen(port);
  Logger.log(`Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
```

- [ ] **Step 3: Verify build compiles**

```bash
npx nx build api
```

Expected: build succeeds with no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/main.ts package.json package-lock.json
git commit -m "chore(api): install validation deps and enable ValidationPipe"
```

---

## Task 2: Update Prisma schema and run migration

**Files:**

- Modify: `prisma/schema.prisma`
- Creates: `prisma/migrations/<timestamp>_add_user_status/migration.sql`

**Interfaces:**

- Produces: `UserStatus` Prisma enum; `User` model with `status` (default ACTIVE) and `deletedAt`; regenerated Prisma client with updated types including `db.user`

- [ ] **Step 1: Update schema.prisma**

`prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../apps/api/src/generated/prisma"
}

datasource db {
  provider = "mysql"
}

model User {
  id           String     @id @default(cuid())
  email        String     @unique @db.VarChar(160)
  passwordHash String     @db.VarChar(255)
  status       UserStatus @default(ACTIVE)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  deletedAt    DateTime?

  @@map("users")
}

enum UserStatus {
  ACTIVE
  INACTIVE
}
```

- [ ] **Step 2: Run migration**

```bash
DATABASE_URL="mysql://project_nps:project_nps@localhost:3306/project_nps" npx prisma migrate dev --name add-user-status
```

Expected:

```
Applying migration `..._add_user_status`
Your database is now in sync with your schema.
```

- [ ] **Step 3: Verify generated client has user model**

```bash
grep -r "findUnique" apps/api/src/generated/prisma/
```

Expected: at least one match confirming the client was regenerated.

- [ ] **Step 4: Commit**

```bash
git add prisma/ apps/api/src/generated/
git commit -m "feat(db): add UserStatus enum and deletedAt to User model"
```

---

## Task 3: Domain layer

**Files:**

- Create: `apps/api/src/modules/auth/domain/enums/user-status.enum.ts`
- Create: `apps/api/src/modules/auth/domain/entities/user.entity.ts`
- Create: `apps/api/src/modules/auth/domain/repositories/user.repository.ts`
- Create: `apps/api/src/modules/auth/auth.constants.ts`

**Interfaces:**

- Produces:
  - `UserStatus.ACTIVE | UserStatus.INACTIVE`
  - `new User(id, email, passwordHash, status, createdAt, updatedAt, deletedAt)`
  - `UserRepository`: `findByEmail(email: string): Promise<User | null>`, `create(data: { email: string; passwordHash: string }): Promise<User>`
  - `USER_REPOSITORY: symbol`, `HASH_SERVICE: symbol` from `auth.constants.ts`

- [ ] **Step 1: Create UserStatus enum**

`apps/api/src/modules/auth/domain/enums/user-status.enum.ts`:

```typescript
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}
```

- [ ] **Step 2: Create User entity**

`apps/api/src/modules/auth/domain/entities/user.entity.ts`:

```typescript
import { UserStatus } from '../enums/user-status.enum';

export class User {
  constructor(
    readonly id: string,
    readonly email: string,
    readonly passwordHash: string,
    readonly status: UserStatus,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly deletedAt: Date | null,
  ) {}
}
```

- [ ] **Step 3: Create UserRepository interface**

`apps/api/src/modules/auth/domain/repositories/user.repository.ts`:

```typescript
import { User } from '../entities/user.entity';

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(data: { email: string; passwordHash: string }): Promise<User>;
}
```

- [ ] **Step 4: Create injection token constants**

`apps/api/src/modules/auth/auth.constants.ts`:

```typescript
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
export const HASH_SERVICE = Symbol('HASH_SERVICE');
```

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/modules/auth/
git commit -m "feat(auth): add domain layer - User entity, UserStatus, UserRepository interface"
```

---

## Task 4: Application layer — HashService + RegisterUserDto + RegisterUserUseCase (TDD)

**Files:**

- Create: `apps/api/src/modules/auth/application/ports/hash.service.ts`
- Create: `apps/api/src/modules/auth/application/dto/register-user.dto.ts`
- Create: `apps/api/src/modules/auth/application/use-cases/register-user.use-case.spec.ts`
- Create: `apps/api/src/modules/auth/application/use-cases/register-user.use-case.ts`

**Interfaces:**

- Consumes: `User`, `UserStatus`, `UserRepository`, `USER_REPOSITORY`, `HASH_SERVICE` from Task 3
- Produces:
  - `HashService`: `hash(plain: string): Promise<string>`
  - `RegisterUserDto`: `{ email: string; password: string }`
  - `RegisterUserUseCase.execute(dto: RegisterUserDto): Promise<{ id: string; email: string }>`
  - Throws `ConflictException` when email already registered

- [ ] **Step 1: Create HashService interface**

`apps/api/src/modules/auth/application/ports/hash.service.ts`:

```typescript
export interface HashService {
  hash(plain: string): Promise<string>;
}
```

- [ ] **Step 2: Create RegisterUserDto**

`apps/api/src/modules/auth/application/dto/register-user.dto.ts`:

```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

- [ ] **Step 3: Write failing unit tests**

`apps/api/src/modules/auth/application/use-cases/register-user.use-case.spec.ts`:

```typescript
import { ConflictException } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { UserStatus } from '../../domain/enums/user-status.enum';
import { UserRepository } from '../../domain/repositories/user.repository';
import { HashService } from '../ports/hash.service';
import { RegisterUserUseCase } from './register-user.use-case';

const makeUser = () =>
  new User('id-1', 'user@email.com', 'hashed_pw', UserStatus.ACTIVE, new Date(), new Date(), null);

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let hashService: jest.Mocked<HashService>;

  beforeEach(() => {
    userRepository = { findByEmail: jest.fn(), create: jest.fn() };
    hashService = { hash: jest.fn() };
    useCase = new RegisterUserUseCase(userRepository, hashService);
  });

  it('should register a user and return id and email', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    hashService.hash.mockResolvedValue('hashed_pw');
    userRepository.create.mockResolvedValue(makeUser());

    const result = await useCase.execute({ email: 'user@email.com', password: '123456' });

    expect(result).toEqual({ id: 'id-1', email: 'user@email.com' });
    expect(hashService.hash).toHaveBeenCalledWith('123456');
    expect(userRepository.create).toHaveBeenCalledWith({
      email: 'user@email.com',
      passwordHash: 'hashed_pw',
    });
  });

  it('should throw ConflictException when email is already in use', async () => {
    userRepository.findByEmail.mockResolvedValue(makeUser());

    await expect(useCase.execute({ email: 'user@email.com', password: '123456' })).rejects.toThrow(
      ConflictException,
    );
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it('should not include passwordHash in the response', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    hashService.hash.mockResolvedValue('hashed_pw');
    userRepository.create.mockResolvedValue(makeUser());

    const result = await useCase.execute({ email: 'user@email.com', password: '123456' });

    expect(result).not.toHaveProperty('passwordHash');
  });
});
```

- [ ] **Step 4: Run tests to confirm they fail**

```bash
npx nx test api --testFile=apps/api/src/modules/auth/application/use-cases/register-user.use-case.spec.ts
```

Expected: FAIL — `Cannot find module './register-user.use-case'`

- [ ] **Step 5: Implement RegisterUserUseCase**

`apps/api/src/modules/auth/application/use-cases/register-user.use-case.ts`:

```typescript
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { HASH_SERVICE, USER_REPOSITORY } from '../../auth.constants';
import { UserRepository } from '../../domain/repositories/user.repository';
import { HashService } from '../ports/hash.service';
import { RegisterUserDto } from '../dto/register-user.dto';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(HASH_SERVICE) private readonly hashService: HashService,
  ) {}

  async execute(dto: RegisterUserDto): Promise<{ id: string; email: string }> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await this.hashService.hash(dto.password);
    const user = await this.userRepository.create({ email: dto.email, passwordHash });

    return { id: user.id, email: user.email };
  }
}
```

- [ ] **Step 6: Run tests to confirm they pass**

```bash
npx nx test api --testFile=apps/api/src/modules/auth/application/use-cases/register-user.use-case.spec.ts
```

Expected: PASS — 3 tests

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/modules/auth/application/
git commit -m "feat(auth): add RegisterUserUseCase with unit tests"
```

---

## Task 5: Infrastructure — BcryptHashService + PrismaUserRepository (TDD)

**Files:**

- Create: `apps/api/src/modules/auth/infrastructure/services/bcrypt-hash.service.ts`
- Create: `apps/api/src/modules/auth/infrastructure/repositories/prisma-user.repository.spec.ts`
- Create: `apps/api/src/modules/auth/infrastructure/repositories/prisma-user.repository.ts`

**Interfaces:**

- Consumes: `User`, `UserStatus`, `UserRepository`, `HashService`, `DatabaseService` from `core/database`
- Produces:
  - `BcryptHashService implements HashService`
  - `PrismaUserRepository implements UserRepository`

- [ ] **Step 1: Create BcryptHashService**

`apps/api/src/modules/auth/infrastructure/services/bcrypt-hash.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { HashService } from '../../application/ports/hash.service';

@Injectable()
export class BcryptHashService implements HashService {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }
}
```

- [ ] **Step 2: Write failing unit tests for PrismaUserRepository**

`apps/api/src/modules/auth/infrastructure/repositories/prisma-user.repository.spec.ts`:

```typescript
import { User } from '../../domain/entities/user.entity';
import { UserStatus } from '../../domain/enums/user-status.enum';
import { PrismaUserRepository } from './prisma-user.repository';

const makeDbRecord = () => ({
  id: 'id-1',
  email: 'user@email.com',
  passwordHash: 'hashed_pw',
  status: 'ACTIVE' as const,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
});

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let mockDb: { user: { findUnique: jest.Mock; create: jest.Mock } };

  beforeEach(() => {
    mockDb = { user: { findUnique: jest.fn(), create: jest.fn() } };
    repository = new PrismaUserRepository(mockDb as any);
  });

  describe('findByEmail', () => {
    it('should return a User entity when record exists', async () => {
      mockDb.user.findUnique.mockResolvedValue(makeDbRecord());

      const result = await repository.findByEmail('user@email.com');

      expect(result).toBeInstanceOf(User);
      expect(result?.email).toBe('user@email.com');
      expect(result?.status).toBe(UserStatus.ACTIVE);
      expect(mockDb.user.findUnique).toHaveBeenCalledWith({ where: { email: 'user@email.com' } });
    });

    it('should return null when record does not exist', async () => {
      mockDb.user.findUnique.mockResolvedValue(null);

      const result = await repository.findByEmail('notfound@email.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should persist and return a User entity', async () => {
      mockDb.user.create.mockResolvedValue(makeDbRecord());

      const result = await repository.create({
        email: 'user@email.com',
        passwordHash: 'hashed_pw',
      });

      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe('id-1');
      expect(result.status).toBe(UserStatus.ACTIVE);
      expect(mockDb.user.create).toHaveBeenCalledWith({
        data: { email: 'user@email.com', passwordHash: 'hashed_pw' },
      });
    });
  });
});
```

- [ ] **Step 3: Run tests to confirm they fail**

```bash
npx nx test api --testFile=apps/api/src/modules/auth/infrastructure/repositories/prisma-user.repository.spec.ts
```

Expected: FAIL — `Cannot find module './prisma-user.repository'`

- [ ] **Step 4: Implement PrismaUserRepository**

`apps/api/src/modules/auth/infrastructure/repositories/prisma-user.repository.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../../core/database/database.service';
import { User } from '../../domain/entities/user.entity';
import { UserStatus } from '../../domain/enums/user-status.enum';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly db: DatabaseService) {}

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.db.user.findUnique({ where: { email } });
    if (!record) return null;
    return this.toEntity(record);
  }

  async create(data: { email: string; passwordHash: string }): Promise<User> {
    const record = await this.db.user.create({ data });
    return this.toEntity(record);
  }

  private toEntity(record: {
    id: string;
    email: string;
    passwordHash: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }): User {
    return new User(
      record.id,
      record.email,
      record.passwordHash,
      record.status as UserStatus,
      record.createdAt,
      record.updatedAt,
      record.deletedAt,
    );
  }
}
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
npx nx test api --testFile=apps/api/src/modules/auth/infrastructure/repositories/prisma-user.repository.spec.ts
```

Expected: PASS — 3 tests

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/modules/auth/infrastructure/
git commit -m "feat(auth): add BcryptHashService and PrismaUserRepository with unit tests"
```

---

## Task 6: API layer — AuthController + AuthModule + integration tests

**Files:**

- Create: `apps/api/src/modules/auth/infrastructure/controllers/auth.controller.ts`
- Create: `apps/api/src/modules/auth/infrastructure/controllers/auth.controller.spec.ts`
- Create: `apps/api/src/modules/auth/auth.module.ts`
- Modify: `apps/api/src/app/app.module.ts`

**Interfaces:**

- Consumes: `RegisterUserUseCase`, `RegisterUserDto`, `USER_REPOSITORY`, `HASH_SERVICE`, `DatabaseModule`
- Produces: `POST /api/auth/register` → 201 `{ id, email }` | 400 (validation) | 409 (duplicate email)

- [ ] **Step 1: Write integration tests**

`apps/api/src/modules/auth/infrastructure/controllers/auth.controller.spec.ts`:

```typescript
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { HASH_SERVICE, USER_REPOSITORY } from '../../auth.constants';
import { User } from '../../domain/entities/user.entity';
import { UserStatus } from '../../domain/enums/user-status.enum';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { AuthController } from './auth.controller';

const makeUser = () =>
  new User('id-1', 'user@email.com', 'hashed_pw', UserStatus.ACTIVE, new Date(), new Date(), null);

describe('AuthController (integration)', () => {
  let app: any;
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
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx nx test api --testFile=apps/api/src/modules/auth/infrastructure/controllers/auth.controller.spec.ts
```

Expected: FAIL — `Cannot find module './auth.controller'`

- [ ] **Step 3: Create AuthController**

`apps/api/src/modules/auth/infrastructure/controllers/auth.controller.ts`:

```typescript
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { RegisterUserDto } from '../../application/dto/register-user.dto';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';

@Controller('auth')
export class AuthController {
  constructor(private readonly registerUser: RegisterUserUseCase) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterUserDto) {
    return this.registerUser.execute(dto);
  }
}
```

- [ ] **Step 4: Run integration tests to confirm they pass**

```bash
npx nx test api --testFile=apps/api/src/modules/auth/infrastructure/controllers/auth.controller.spec.ts
```

Expected: PASS — 4 tests

- [ ] **Step 5: Create AuthModule**

`apps/api/src/modules/auth/auth.module.ts`:

```typescript
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
```

- [ ] **Step 6: Register AuthModule in AppModule**

`apps/api/src/app/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '../core/database/database.module';
import { AuthModule } from '../modules/auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

- [ ] **Step 7: Run all api tests**

```bash
npx nx test api
```

Expected: all tests passing (unit + integration)

- [ ] **Step 8: Verify build**

```bash
npx nx build api
```

Expected: build succeeds.

- [ ] **Step 9: Commit**

```bash
git add apps/api/src/modules/auth/ apps/api/src/app/app.module.ts
git commit -m "feat(auth): add AuthController, AuthModule and wire registration endpoint"
```
