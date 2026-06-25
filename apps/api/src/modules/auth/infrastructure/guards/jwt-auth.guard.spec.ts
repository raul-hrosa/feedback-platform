import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  it('should be instantiable', () => {
    const guard = new JwtAuthGuard();
    expect(guard).toBeDefined();
  });

  it('should expose canActivate method', () => {
    const guard = new JwtAuthGuard();
    expect(typeof guard.canActivate).toBe('function');
  });
});
