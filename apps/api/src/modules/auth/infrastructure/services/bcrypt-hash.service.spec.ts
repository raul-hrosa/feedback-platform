import { BcryptHashService } from './bcrypt-hash.service';

describe('BcryptHashService', () => {
  let service: BcryptHashService;

  beforeEach(() => {
    service = new BcryptHashService();
  });

  it('hash() should return a non-empty string different from the plain text', async () => {
    const result = await service.hash('password123');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toBe('password123');
  });

  it('compare() should return true when plain matches the hash', async () => {
    const hash = await service.hash('password123');
    const result = await service.compare('password123', hash);
    expect(result).toBe(true);
  });

  it('compare() should return false when plain does not match the hash', async () => {
    const hash = await service.hash('password123');
    const result = await service.compare('wrong-password', hash);
    expect(result).toBe(false);
  });
});
