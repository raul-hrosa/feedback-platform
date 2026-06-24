import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DATABASE_CLIENT } from './database/database.constants';

describe('AppController', () => {
  let app: TestingModule;
  const databaseService = {
    $queryRaw: jest.fn(),
  };

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: DATABASE_CLIENT,
          useValue: databaseService,
        },
      ],
    }).compile();
  });

  beforeEach(() => {
    databaseService.$queryRaw.mockResolvedValue([{ 1: 1 }]);
  });

  describe('getHealth', () => {
    it('should return the API health status', () => {
      const appController = app.get<AppController>(AppController);
      expect(appController.getHealth()).toEqual({
        name: 'Feedback Platform API',
        status: 'ok',
      });
    });
  });

  describe('getDatabaseHealth', () => {
    it('should return the database health status', async () => {
      const appController = app.get<AppController>(AppController);
      await expect(appController.getDatabaseHealth()).resolves.toEqual({
        database: 'mysql',
        status: 'ok',
      });
    });
  });
});
