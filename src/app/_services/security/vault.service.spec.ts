import {TestBed} from '@angular/core/testing';
import {VaultService} from './vault.service';
import {CryptoVaultService} from './crypto-vault.service';
import {VaultMetaDbService} from '../../_database/security/vault-meta-db.service';
import {Firestore} from '@angular/fire/firestore';
import {of} from 'rxjs';
import {UserVaultMetadata} from '../../_models/security/vault-metadata';

describe('VaultService', () => {
  let service: VaultService;
  let crypto: CryptoVaultService;
  let mockMetaDb: jasmine.SpyObj<VaultMetaDbService>;

  beforeEach(() => {
    mockMetaDb = jasmine.createSpyObj('VaultMetaDbService', [
      'watchMetadata',
      'getMetadata',
      'saveMetadata',
      'deleteMetadata'
    ]);
    mockMetaDb.watchMetadata.and.returnValue(of(null));
    mockMetaDb.saveMetadata.and.returnValue(Promise.resolve());

    TestBed.configureTestingModule({
      providers: [
        VaultService,
        CryptoVaultService,
        { provide: VaultMetaDbService, useValue: mockMetaDb },
        { provide: Firestore, useValue: {} }
      ]
    });

    service = TestBed.inject(VaultService);
    crypto = TestBed.inject(CryptoVaultService);
  });

  it('should be created and default to NOT_CONFIGURED', () => {
    expect(service).toBeTruthy();
    expect(service.status()).toBe('NOT_CONFIGURED');
    expect(service.isUnlocked()).toBeFalse();
  });

  it('should setup vault with password and 4-digit PIN', async () => {
    service.initForUser('user_456');

    const result = await service.setupVaultWithPassword('MasterPass123!', '1234');
    expect(result.recoveryKey).toBeDefined();
    expect(result.recoveryKey).toContain('WMS-');
    expect(service.status()).toBe('UNLOCKED');
    expect(service.isUnlocked()).toBeTrue();
    expect(mockMetaDb.saveMetadata).toHaveBeenCalled();

    const savedMeta = mockMetaDb.saveMetadata.calls.mostRecent().args[1] as UserVaultMetadata;
    expect(savedMeta.hasPasswordKey).toBeTrue();
    expect(savedMeta.hasPin).toBeTrue();
    expect(savedMeta.encryptedMasterKeyByPin).toBeDefined();
  });

  it('should encrypt and decrypt warehouse payload when unlocked', async () => {
    service.initForUser('user_789');
    await service.setupVaultWithPassword('Pass1234!', '5678');

    const testPayload = JSON.stringify({ warehouses: [{ name: 'Living Room Vault' }] });
    const { ciphertext, iv } = await service.encryptData(testPayload);

    expect(ciphertext).toBeDefined();
    expect(ciphertext).not.toContain('Living Room Vault');

    const decrypted = await service.decryptData(ciphertext, iv);
    expect(decrypted).toBe(testPayload);
  });

  it('should lock vault and prevent decryption until unlocked', async () => {
    service.initForUser('user_999');
    await service.setupVaultWithPassword('Pass1234!', '4321');
    expect(service.isUnlocked()).toBeTrue();

    service.lockVault();
    expect(service.isUnlocked()).toBeFalse();
    expect(service.status()).toBe('LOCKED');

    await expectAsync(service.encryptData('secret')).toBeRejectedWithError(/locked/);
  });

  it('should unlock with 4-digit PIN', async () => {
    service.initForUser('user_111');
    await service.setupVaultWithPassword('Pass1234!', '9876');

    service.lockVault();
    expect(service.isUnlocked()).toBeFalse();

    const unlocked = await service.unlockWithPin('9876');
    expect(unlocked).toBeTrue();
    expect(service.isUnlocked()).toBeTrue();
  });

  it('should unlock with recovery key', async () => {
    service.initForUser('user_222');
    const { recoveryKey } = await service.setupVaultWithPassword('Pass1234!');

    service.lockVault();
    expect(service.isUnlocked()).toBeFalse();

    const unlocked = await service.unlockWithRecoveryKey(recoveryKey);
    expect(unlocked).toBeTrue();
    expect(service.isUnlocked()).toBeTrue();
  });

  it('should store and consume pending recovery key on vault setup', async () => {
    service.initForUser('user_recovery_test');
    expect(service.getPendingRecoveryKey()).toBeNull();

    const { recoveryKey } = await service.setupVaultWithPassword('Pass1234!');
    expect(service.getPendingRecoveryKey()).toBe(recoveryKey);

    const consumed = service.consumePendingRecoveryKey();
    expect(consumed).toBe(recoveryKey);
    expect(service.getPendingRecoveryKey()).toBeNull();
  });

  it('should evaluate shouldPromptPinSetup correctly and respect session prompt mark', async () => {
    // Before initForUser, metadata has not loaded
    expect(service.shouldPromptPinSetup()).toBeFalse();

    // initForUser subscribes to watchMetadata which returns of(null) -> NOT_CONFIGURED and metadataLoaded: true
    service.initForUser('user_pin_prompt');
    expect(service.shouldPromptPinSetup()).toBeTrue();

    // Mark as prompted
    service.markPinPrompted();
    expect(service.shouldPromptPinSetup()).toBeFalse();

    // Clear session resets it
    service.clearSession();
    expect(service.shouldPromptPinSetup()).toBeFalse();
  });

  it('should evaluate shouldPromptUnlock correctly for locked vault with PIN', () => {
    service.initForUser('user_locked_test');
    (service as any).metadataLoadedSubject.next(true);
    (service as any)._status.set('LOCKED');
    (service as any)._metadata.set({ hasPin: true } as any);

    expect(service.shouldPromptUnlock()).toBeTrue();

    service.markUnlockPrompted();
    expect(service.shouldPromptUnlock()).toBeFalse();
  });

  it('should not prompt unlock if locked but user has no PIN and instead prompt PIN setup', () => {
    service.initForUser('user_locked_no_pin');
    (service as any).metadataLoadedSubject.next(true);
    (service as any)._status.set('LOCKED');
    (service as any)._metadata.set({ hasPin: false } as any);

    expect(service.shouldPromptUnlock()).toBeFalse();
    expect(service.shouldPromptPinSetup()).toBeTrue();
  });
});
