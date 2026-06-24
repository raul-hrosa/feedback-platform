import { Module } from '@nestjs/common';
import { DATABASE_CLIENT } from './database.constants';
import { DatabaseService } from './database.service';

@Module({
  providers: [
    DatabaseService,
    {
      provide: DATABASE_CLIENT,
      useExisting: DatabaseService,
    },
  ],
  exports: [DatabaseService, DATABASE_CLIENT],
})
export class DatabaseModule {}
