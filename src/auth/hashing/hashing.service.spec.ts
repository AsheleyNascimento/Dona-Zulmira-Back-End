import { Test, TestingModule } from '@nestjs/testing';
import { BcryptService } from './bcrypt.service';

describe('HashingService', () => {
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
    it('should be implemented by concrete class', async () => {
      const result = await service.hashPassword('test');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('comparePassword', () => {
    it('should be implemented by concrete class', async () => {
      const password = 'test';
      const hash = await service.hashPassword(password);
      const result = await service.comparePassword(password, hash);
      expect(result).toBe(true);
    });
  });
});
