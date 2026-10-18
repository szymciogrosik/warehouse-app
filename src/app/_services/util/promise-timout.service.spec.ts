import { TestBed } from '@angular/core/testing';
import { PromiseTimoutService } from './promise-timout.service';

describe('PromiseTimoutService', () => {
  let service: PromiseTimoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PromiseTimoutService]
    });
    service = TestBed.inject(PromiseTimoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should resolve if promise resolves before timeout', async () => {
    const fastPromise = new Promise(resolve => setTimeout(() => resolve('success'), 20));
    const result = await service.promiseTimeout(100, fastPromise);
    expect(result).toBe('success');
  });

  it('should reject with timeout error if promise exceeds timeout', async () => {
    const slowPromise = new Promise(resolve => setTimeout(() => resolve('slow'), 200));
    try {
      await service.promiseTimeout(30, slowPromise);
      fail('Expected promise to reject with timeout error');
    } catch (err: any) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe(service.timoutMessage);
    }
  });

  it('should reject if underlying promise rejects before timeout', async () => {
    const failingPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Original failure')), 10));
    try {
      await service.promiseTimeout(100, failingPromise);
      fail('Expected promise to reject');
    } catch (err: any) {
      expect(err.message).toBe('Original failure');
    }
  });
});
