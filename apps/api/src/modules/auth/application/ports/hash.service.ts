export interface HashService {
  hash(plain: string): Promise<string>;
}
