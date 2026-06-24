import { Test } from '@nestjs/testing';
import { AppService } from './app.service';
import { DATABASE_CLIENT } from './database/database.constants';

describe('AppService', () => {
  let service: AppService;
  const databaseService = {
    $queryRaw: jest.fn(),
  };

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: DATABASE_CLIENT,
          useValue: databaseService,
        },
      ],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  beforeEach(() => {
    databaseService.$queryRaw.mockResolvedValue([{ 1: 1 }]);
  });

  describe('getHealth', () => {
    it('should return the API health status', () => {
      expect(service.getHealth()).toEqual({
        name: 'Feedback Platform API',
        status: 'ok',
      });
    });
  });

  describe('getDatabaseHealth', () => {
    it('should return the database health status', async () => {
      await expect(service.getDatabaseHealth()).resolves.toEqual({
        database: 'mysql',
        status: 'ok',
      });
    });
  });
});
