import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { HashService } from '../../application/ports/hash.service';

@Injectable()
export class BcryptHashService implements HashService {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }
}
