import { ExecutionContext } from '@nestjs/common';
import { UserStatus } from '../../domain/enums/user-status.enum';
import { extractCurrentUser } from './current-user.decorator';

describe('extractCurrentUser', () => {
  it('should return the user object from the HTTP request', () => {
    const mockUser = {
      id: 'id-1',
      email: 'user@email.com',
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
    };
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({ user: mockUser }),
      }),
    } as unknown as ExecutionContext;

    const result = extractCurrentUser(undefined, ctx);

    expect(result).toBe(mockUser);
  });
});
