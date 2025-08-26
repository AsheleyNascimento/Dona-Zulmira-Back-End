import { Test, TestingModule } from '@nestjs/testing';
import { BcryptService } from './bcrypt.service';

describe('BcryptService', () => {
  let service: BcryptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BcryptService],
    }).compile();

    service = module.get<BcryptService>(BcryptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const plainPassword = 'testPassword123';

      const hashedPassword = await service.hashPassword(plainPassword);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(plainPassword);
      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword.length).toBeGreaterThan(20); // bcrypt hashes are typically 60 characters
    });

    it('should generate different hashes for the same password', async () => {
      const plainPassword = 'testPassword123';

      const hash1 = await service.hashPassword(plainPassword);
      const hash2 = await service.hashPassword(plainPassword);

      expect(hash1).not.toBe(hash2); // Due to salt, hashes should be different
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password and hash', async () => {
      const plainPassword = 'testPassword123';
      const hashedPassword = await service.hashPassword(plainPassword);

      const isMatch = await service.comparePassword(
        plainPassword,
        hashedPassword,
      );

      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password and hash', async () => {
      const plainPassword = 'testPassword123';
      const wrongPassword = 'wrongPassword456';
      const hashedPassword = await service.hashPassword(plainPassword);

      const isMatch = await service.comparePassword(
        wrongPassword,
        hashedPassword,
      );

      expect(isMatch).toBe(false);
    });

    it('should return false for invalid hash format', async () => {
      const plainPassword = 'testPassword123';
      const invalidHash = 'invalid_hash_format';

      const isMatch = await service.comparePassword(plainPassword, invalidHash);

      expect(isMatch).toBe(false);
    });

    it('should handle empty password', async () => {
      const emptyPassword = '';
      const someHash = await service.hashPassword('somepassword');

      const isMatch = await service.comparePassword(emptyPassword, someHash);

      expect(isMatch).toBe(false);
    });

    it('should handle empty hash', async () => {
      const somePassword = 'somepassword';
      const emptyHash = '';

      const isMatch = await service.comparePassword(somePassword, emptyHash);

      expect(isMatch).toBe(false);
    });
  });
});
