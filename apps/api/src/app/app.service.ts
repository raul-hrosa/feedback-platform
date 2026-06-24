import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CLIENT } from './database/database.constants';

type DatabaseClient = {
  $queryRaw: (query: TemplateStringsArray) => Promise<unknown>;
};

@Injectable()
export class AppService {
  constructor(
    @Inject(DATABASE_CLIENT)
    private readonly databaseService: DatabaseClient,
  ) {}

  getHealth(): { name: string; status: string } {
    return {
      name: 'Feedback Platform API',
      status: 'ok',
    };
  }

  async getDatabaseHealth(): Promise<{ database: string; status: string }> {
    await this.databaseService.$queryRaw`SELECT 1`;

    return {
      database: 'mysql',
      status: 'ok',
    };
  }
}
