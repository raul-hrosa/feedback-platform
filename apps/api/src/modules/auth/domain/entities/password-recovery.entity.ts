export class PasswordRecovery {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly token: string,
    readonly expiresAt: Date,
    readonly usedAt: Date | null,
    readonly createdAt: Date,
  ) {}
}
