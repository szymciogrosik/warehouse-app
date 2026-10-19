import {TestBed} from '@angular/core/testing';
import {CryptoVaultService} from './crypto-vault.service';

describe('CryptoVaultService', () => {
  let service: CryptoVaultService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CryptoVaultService]
    });
    service = TestBed.inject(CryptoVaultService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should convert buffer to base64 and back', () => {
    const raw = new Uint8Array([1, 2, 3, 4, 255, 128, 0]);
    const b64 = service.bufferToBase64(raw);
    const converted = service.base64ToBuffer(b64);
    expect(converted).toEqual(raw);
  });

  it('should generate master key and encrypt/decrypt data with AES-GCM', async () => {
    const { key } = await service.generateMasterKey();
    const secretMessage = 'Secret Diamond Ring in Master Bedroom';

    const { ciphertext, iv } = await service.encryptData(secretMessage, key);
    expect(ciphertext).toBeDefined();
    expect(ciphertext).not.toEqual(secretMessage);
    expect(iv).toBeDefined();

    const decrypted = await service.decryptData(ciphertext, iv, key);
    expect(decrypted).toEqual(secretMessage);
  });

  it('should wrap and unwrap master key using PBKDF2 derived key', async () => {
    const { raw } = await service.generateMasterKey();
    const password = 'MySuperPassword!123';
    const salt = service.getRandomSalt();

    const wrappingKey = await service.deriveWrappingKey(password, salt, 1000);
    const { ciphertext, iv } = await service.wrapMasterKey(raw, wrappingKey);

    const unwrappedKey = await service.unwrapMasterKey(ciphertext, iv, wrappingKey);
    expect(unwrappedKey).toBeDefined();

    // Verify unwrapped key works
    const msg = 'Test message';
    const enc = await service.encryptData(msg, unwrappedKey);
    const dec = await service.decryptData(enc.ciphertext, enc.iv, unwrappedKey);
    expect(dec).toEqual(msg);
  });

  it('should generate formatted recovery key and hash it', async () => {
    const key = service.generateRecoveryKey();
    expect(key).toMatch(/^WMS-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/);

    const hash1 = await service.hashRecoveryKey(key);
    const hash2 = await service.hashRecoveryKey(key.toLowerCase().replace(/-/g, ' '));
    expect(hash1).toEqual(hash2);
  });
});
