import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CryptoVaultService {
  private readonly subtle: SubtleCrypto = window.crypto.subtle;

  // Base64 Helpers
  public bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  public base64ToBuffer(base64: string): Uint8Array {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  // Random bytes generation
  public getRandomBytes(length: number): Uint8Array {
    const bytes = new Uint8Array(length);
    window.crypto.getRandomValues(bytes);
    return bytes;
  }

  public getRandomSalt(): string {
    return this.bufferToBase64(this.getRandomBytes(16));
  }

  // Generate Master Key (AES-GCM 256-bit raw key)
  public async generateMasterKey(): Promise<{ key: CryptoKey; raw: Uint8Array }> {
    const raw = this.getRandomBytes(32); // 256 bits
    const key = await this.subtle.importKey(
      'raw',
      raw.buffer as ArrayBuffer,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    return { key, raw };
  }

  // Import raw key as CryptoKey
  public async importRawMasterKey(raw: Uint8Array): Promise<CryptoKey> {
    return this.subtle.importKey(
      'raw',
      raw.buffer as ArrayBuffer,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Derive AES-GCM wrapping key using PBKDF2
  public async deriveWrappingKey(
    passphrase: string,
    saltBase64: string,
    iterations = 100000
  ): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const passphraseKey = await this.subtle.importKey(
      'raw',
      enc.encode(passphrase).buffer as ArrayBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    const salt = this.base64ToBuffer(saltBase64);
    return this.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt.buffer as ArrayBuffer,
        iterations,
        hash: 'SHA-256'
      },
      passphraseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt raw master key bytes with wrapping key
  public async wrapMasterKey(
    rawMasterKey: Uint8Array,
    wrappingKey: CryptoKey
  ): Promise<{ ciphertext: string; iv: string }> {
    const iv = this.getRandomBytes(12);
    const encrypted = await this.subtle.encrypt(
      { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
      wrappingKey,
      rawMasterKey.buffer as ArrayBuffer
    );

    return {
      ciphertext: this.bufferToBase64(encrypted),
      iv: this.bufferToBase64(iv)
    };
  }

  // Decrypt raw master key bytes using wrapping key
  public async unwrapMasterKey(
    ciphertextBase64: string,
    ivBase64: string,
    wrappingKey: CryptoKey
  ): Promise<CryptoKey> {
    const ciphertext = this.base64ToBuffer(ciphertextBase64);
    const iv = this.base64ToBuffer(ivBase64);

    const decrypted = await this.subtle.decrypt(
      { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
      wrappingKey,
      ciphertext.buffer as ArrayBuffer
    );

    return this.importRawMasterKey(new Uint8Array(decrypted));
  }

  // Encrypt JSON / string with Master Key
  public async encryptData(
    plainText: string,
    masterKey: CryptoKey
  ): Promise<{ ciphertext: string; iv: string }> {
    const enc = new TextEncoder();
    const iv = this.getRandomBytes(12);
    const encrypted = await this.subtle.encrypt(
      { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
      masterKey,
      enc.encode(plainText).buffer as ArrayBuffer
    );

    return {
      ciphertext: this.bufferToBase64(encrypted),
      iv: this.bufferToBase64(iv)
    };
  }

  // Decrypt JSON / string with Master Key
  public async decryptData(
    ciphertextBase64: string,
    ivBase64: string,
    masterKey: CryptoKey
  ): Promise<string> {
    const ciphertext = this.base64ToBuffer(ciphertextBase64);
    const iv = this.base64ToBuffer(ivBase64);

    const decrypted = await this.subtle.decrypt(
      { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
      masterKey,
      ciphertext.buffer as ArrayBuffer
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  }

  // Generate a formatted 20-character recovery key: "WMS-XXXX-XXXX-XXXX-XXXX"
  public generateRecoveryKey(): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // base32 without easily confused 0, O, 1, I
    const randomBytes = this.getRandomBytes(16);
    let code = '';
    for (let i = 0; i < 16; i++) {
      code += chars[randomBytes[i] % chars.length];
    }
    return `WMS-${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}-${code.slice(12, 16)}`;
  }

  // Normalize recovery key (uppercase, strip dashes and whitespace)
  public normalizeRecoveryKey(key: string): string {
    return key.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  }

  // Hash recovery key with SHA-256 for fast verification
  public async hashRecoveryKey(key: string): Promise<string> {
    const normalized = this.normalizeRecoveryKey(key);
    const enc = new TextEncoder();
    const hash = await this.subtle.digest('SHA-256', enc.encode(normalized).buffer as ArrayBuffer);
    return this.bufferToBase64(hash);
  }
}
