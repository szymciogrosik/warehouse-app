import {Injectable, computed, inject, signal} from '@angular/core';
import {CryptoVaultService} from './crypto-vault.service';
import {VaultMetaDbService} from '../../_database/security/vault-meta-db.service';
import {UserVaultMetadata, VaultStatus} from '../../_models/security/vault-metadata';
import {BehaviorSubject, Subscription} from 'rxjs';
import {Firestore, doc, getDoc} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class VaultService {
  private readonly crypto = inject(CryptoVaultService);
  private readonly vaultMetaDb = inject(VaultMetaDbService);
  private readonly firestore = inject(Firestore);

  private currentUid: string | null = null;
  private metadataSubscription: Subscription | null = null;

  private readonly _metadata = signal<UserVaultMetadata | null>(null);
  public readonly metadata = this._metadata.asReadonly();

  private readonly _status = signal<VaultStatus>('NOT_CONFIGURED');
  public readonly status = this._status.asReadonly();

  public readonly isUnlocked = computed(() => this._status() === 'UNLOCKED');
  public readonly hasPin = computed(() => !!this._metadata()?.hasPin);
  public readonly isConfigured = computed(() => this._status() !== 'NOT_CONFIGURED');

  // In-memory Master Key (never exposed, never sent to Firestore)
  private activeMasterKey: CryptoKey | null = null;
  private rawMasterKeyBytes: Uint8Array | null = null;

  // Observable for components that need to react to unlock events
  private readonly unlockSubject = new BehaviorSubject<boolean>(false);
  public readonly onVaultStateChanged$ = this.unlockSubject.asObservable();

  // Pending recovery key waiting to be presented to the user
  private readonly _pendingRecoveryKey = signal<string | null>(null);
  public readonly isAutoUnlocking = signal<boolean>(false);
  private hasPromptedPinThisSession = false;
  private hasPromptedUnlockThisSession = false;

  // Observable for metadata readiness
  private readonly metadataLoadedSubject = new BehaviorSubject<boolean>(false);
  public readonly metadataLoaded$ = this.metadataLoadedSubject.asObservable();

  public getPendingRecoveryKey(): string | null {
    return this._pendingRecoveryKey();
  }

  public setPendingRecoveryKey(key: string | null): void {
    this._pendingRecoveryKey.set(key);
  }

  public consumePendingRecoveryKey(): string | null {
    const key = this._pendingRecoveryKey();
    this._pendingRecoveryKey.set(null);
    return key;
  }

  public shouldPromptPinSetup(): boolean {
    if (!this.currentUid) {
      return false;
    }
    if (this.hasPromptedPinThisSession || this.isAutoUnlocking()) {
      return false;
    }
    if (!this.metadataLoadedSubject.value) {
      return false;
    }
    return (this._status() === 'UNLOCKED' && !this.hasPin()) || (this._status() === 'NOT_CONFIGURED');
  }

  public markPinPrompted(): void {
    this.hasPromptedPinThisSession = true;
  }

  public shouldPromptUnlock(): boolean {
    if (!this.currentUid) {
      return false;
    }
    if (this.hasPromptedUnlockThisSession || this.isAutoUnlocking()) {
      return false;
    }
    if (!this.metadataLoadedSubject.value) {
      return false;
    }
    return this._status() === 'LOCKED';
  }

  public markUnlockPrompted(): void {
    this.hasPromptedUnlockThisSession = true;
  }

  public clearSession(): void {
    this.metadataSubscription?.unsubscribe();
    this.metadataSubscription = null;
    this.currentUid = null;
    this.activeMasterKey = null;
    this.rawMasterKeyBytes = null;
    this._metadata.set(null);
    this._status.set('NOT_CONFIGURED');
    this.metadataLoadedSubject.next(false);
    this.unlockSubject.next(false);
    this._pendingRecoveryKey.set(null);
    this.hasPromptedPinThisSession = false;
    this.hasPromptedUnlockThisSession = false;
    this.isAutoUnlocking.set(false);
  }

  public initForUser(uid: string): void {
    if (this.currentUid === uid && this.metadataSubscription) {
      return;
    }
    this.clearSession();
    this.currentUid = uid;

    this.metadataSubscription = this.vaultMetaDb.watchMetadata(uid).subscribe({
      next: (meta) => {
        this._metadata.set(meta);
        if (!meta) {
          this._status.set('NOT_CONFIGURED');
        } else if (this.activeMasterKey) {
          this._status.set('UNLOCKED');
        } else {
          this._status.set('LOCKED');
        }
        this.metadataLoadedSubject.next(true);
      },
      error: (err) => {
        console.error('Error fetching vault metadata:', err);
        this.metadataLoadedSubject.next(true);
      }
    });
  }

  public getRawMasterKey(): Uint8Array | null {
    return this.rawMasterKeyBytes;
  }

  public getMasterKey(): CryptoKey | null {
    return this.activeMasterKey;
  }

  public setMasterKey(key: CryptoKey, rawBytes: Uint8Array): void {
    this.activeMasterKey = key;
    this.rawMasterKeyBytes = rawBytes;
    this._status.set('UNLOCKED');
    this.unlockSubject.next(true);
  }

  public lockVault(): void {
    this.activeMasterKey = null;
    this.rawMasterKeyBytes = null;
    if (this._metadata()) {
      this._status.set('LOCKED');
    }
    this.unlockSubject.next(false);
  }

  /**
   * Initial vault creation using login password
   */
  public async setupVaultWithPassword(password: string, initialPin?: string): Promise<{ recoveryKey: string }> {
    if (!this.currentUid) throw new Error('No active user initialized');

    const { key: masterKey, raw: rawBytes } = await this.crypto.generateMasterKey();
    const recoveryKey = this.crypto.generateRecoveryKey();
    const recoveryKeyHash = await this.crypto.hashRecoveryKey(recoveryKey);

    const passwordSalt = this.crypto.getRandomSalt();
    const recoverySalt = this.crypto.getRandomSalt();

    // Wrap with Password
    const passwordWrappingKey = await this.crypto.deriveWrappingKey(password, passwordSalt, 100000);
    const { ciphertext: encByPass, iv: ivByPass } = await this.crypto.wrapMasterKey(rawBytes, passwordWrappingKey);

    // Wrap with Recovery Key
    const recoveryWrappingKey = await this.crypto.deriveWrappingKey(
      this.crypto.normalizeRecoveryKey(recoveryKey),
      recoverySalt,
      100000
    );
    const { ciphertext: encByRec, iv: ivByRec } = await this.crypto.wrapMasterKey(rawBytes, recoveryWrappingKey);

    let pinFields: Partial<UserVaultMetadata> = { hasPin: false };
    if (initialPin && /^\d{4}$/.test(initialPin)) {
      const pinSalt = this.crypto.getRandomSalt();
      const pinWrappingKey = await this.crypto.deriveWrappingKey(initialPin, pinSalt, 50000);
      const { ciphertext: encByPin, iv: ivByPin } = await this.crypto.wrapMasterKey(rawBytes, pinWrappingKey);
      pinFields = {
        hasPin: true,
        pinSalt,
        encryptedMasterKeyByPin: encByPin,
        ivByPin
      };
    }

    const now = new Date().toISOString();
    const meta: UserVaultMetadata = {
      version: 1,
      hasPasswordKey: true,
      hasPin: pinFields.hasPin ?? false,
      salt: passwordSalt,
      pinSalt: pinFields.pinSalt,
      recoverySalt,
      recoveryKeyHash,
      encryptedMasterKeyByPassword: encByPass,
      ivByPassword: ivByPass,
      encryptedMasterKeyByPin: pinFields.encryptedMasterKeyByPin,
      ivByPin: pinFields.ivByPin,
      encryptedMasterKeyByRecovery: encByRec,
      ivByRecovery: ivByRec,
      createdAt: now,
      updatedAt: now
    };

    await this.vaultMetaDb.saveMetadata(this.currentUid, meta);
    this.setMasterKey(masterKey, rawBytes);
    this._metadata.set(meta);
    this.setPendingRecoveryKey(recoveryKey);

    return { recoveryKey };
  }

  /**
   * Initial vault creation with 4-digit PIN only (e.g. for Google SSO users)
   */
  public async setupVaultWithPinOnly(pin: string): Promise<{ recoveryKey: string }> {
    if (!this.currentUid) throw new Error('No active user initialized');
    if (!/^\d{4}$/.test(pin)) throw new Error('PIN must be 4 digits');

    const { key: masterKey, raw: rawBytes } = await this.crypto.generateMasterKey();
    const recoveryKey = this.crypto.generateRecoveryKey();
    const recoveryKeyHash = await this.crypto.hashRecoveryKey(recoveryKey);

    const pinSalt = this.crypto.getRandomSalt();
    const recoverySalt = this.crypto.getRandomSalt();

    // Wrap with PIN
    const pinWrappingKey = await this.crypto.deriveWrappingKey(pin, pinSalt, 50000);
    const { ciphertext: encByPin, iv: ivByPin } = await this.crypto.wrapMasterKey(rawBytes, pinWrappingKey);

    // Wrap with Recovery Key
    const recoveryWrappingKey = await this.crypto.deriveWrappingKey(
      this.crypto.normalizeRecoveryKey(recoveryKey),
      recoverySalt,
      100000
    );
    const { ciphertext: encByRec, iv: ivByRec } = await this.crypto.wrapMasterKey(rawBytes, recoveryWrappingKey);

    const now = new Date().toISOString();
    const meta: UserVaultMetadata = {
      version: 1,
      hasPasswordKey: false,
      hasPin: true,
      salt: this.crypto.getRandomSalt(),
      pinSalt,
      recoverySalt,
      recoveryKeyHash,
      encryptedMasterKeyByPin: encByPin,
      ivByPin,
      encryptedMasterKeyByRecovery: encByRec,
      ivByRecovery: ivByRec,
      createdAt: now,
      updatedAt: now
    };

    await this.vaultMetaDb.saveMetadata(this.currentUid, meta);
    this.setMasterKey(masterKey, rawBytes);
    this._metadata.set(meta);
    this.setPendingRecoveryKey(recoveryKey);

    return { recoveryKey };
  }

  /**
   * Unlock vault using Login Password
   */
  public async unlockWithPassword(password: string): Promise<boolean> {
    const meta = this._metadata();
    if (!meta || !meta.encryptedMasterKeyByPassword || !meta.ivByPassword) {
      return false;
    }

    try {
      const wrappingKey = await this.crypto.deriveWrappingKey(password, meta.salt, 100000);
      const masterKey = await this.crypto.unwrapMasterKey(
        meta.encryptedMasterKeyByPassword,
        meta.ivByPassword,
        wrappingKey
      );

      // Re-export raw bytes for session in-memory operations (like setting a PIN)
      const enc = new TextEncoder();
      const testPlain = 'WMS_VAULT_TEST_' + Date.now();
      const { ciphertext, iv } = await this.crypto.encryptData(testPlain, masterKey);
      const decrypted = await this.crypto.decryptData(ciphertext, iv, masterKey);
      if (decrypted !== testPlain) {
        throw new Error('Key validation failed');
      }

      // Also get raw bytes from ciphertext
      const ciphertextBuf = this.crypto.base64ToBuffer(meta.encryptedMasterKeyByPassword);
      const ivBuf = this.crypto.base64ToBuffer(meta.ivByPassword);
      const rawDecrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBuf.buffer as ArrayBuffer },
        wrappingKey,
        ciphertextBuf.buffer as ArrayBuffer
      );
      const rawBytes = new Uint8Array(rawDecrypted);

      this.setMasterKey(masterKey, rawBytes);
      return true;
    } catch (err) {
      console.warn('Failed to unlock vault with password:', err);
      return false;
    }
  }

  /**
   * Unlock vault using 4-digit PIN
   */
  public async unlockWithPin(pin: string): Promise<boolean> {
    const meta = this._metadata();
    if (!meta || !meta.hasPin || !meta.encryptedMasterKeyByPin || !meta.ivByPin || !meta.pinSalt) {
      return false;
    }

    try {
      const pinWrappingKey = await this.crypto.deriveWrappingKey(pin, meta.pinSalt, 50000);
      const masterKey = await this.crypto.unwrapMasterKey(
        meta.encryptedMasterKeyByPin,
        meta.ivByPin,
        pinWrappingKey
      );

      const ciphertextBuf = this.crypto.base64ToBuffer(meta.encryptedMasterKeyByPin);
      const ivBuf = this.crypto.base64ToBuffer(meta.ivByPin);
      const rawDecrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBuf.buffer as ArrayBuffer },
        pinWrappingKey,
        ciphertextBuf.buffer as ArrayBuffer
      );
      const rawBytes = new Uint8Array(rawDecrypted);

      this.setMasterKey(masterKey, rawBytes);
      return true;
    } catch (err) {
      console.warn('Failed to unlock vault with PIN:', err);
      return false;
    }
  }

  /**
   * Unlock vault using Recovery Key
   */
  public async unlockWithRecoveryKey(recoveryKey: string): Promise<boolean> {
    const meta = this._metadata();
    if (!meta || !meta.encryptedMasterKeyByRecovery || !meta.ivByRecovery) {
      return false;
    }

    try {
      const normalized = this.crypto.normalizeRecoveryKey(recoveryKey);
      const wrappingKey = await this.crypto.deriveWrappingKey(normalized, meta.recoverySalt, 100000);
      const masterKey = await this.crypto.unwrapMasterKey(
        meta.encryptedMasterKeyByRecovery,
        meta.ivByRecovery,
        wrappingKey
      );

      const ciphertextBuf = this.crypto.base64ToBuffer(meta.encryptedMasterKeyByRecovery);
      const ivBuf = this.crypto.base64ToBuffer(meta.ivByRecovery);
      const rawDecrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBuf.buffer as ArrayBuffer },
        wrappingKey,
        ciphertextBuf.buffer as ArrayBuffer
      );
      const rawBytes = new Uint8Array(rawDecrypted);

      this.setMasterKey(masterKey, rawBytes);
      return true;
    } catch (err) {
      console.warn('Failed to unlock vault with recovery key:', err);
      return false;
    }
  }

  /**
   * Set or change 4-digit PIN when vault is unlocked
   */
  public async setPin(pin: string): Promise<void> {
    if (!this.rawMasterKeyBytes || !this.currentUid) {
      throw new Error('Vault must be unlocked to set a PIN');
    }
    if (!/^\d{4}$/.test(pin)) {
      throw new Error('PIN must be 4 digits');
    }

    const pinSalt = this.crypto.getRandomSalt();
    const pinWrappingKey = await this.crypto.deriveWrappingKey(pin, pinSalt, 50000);
    const { ciphertext: encByPin, iv: ivByPin } = await this.crypto.wrapMasterKey(
      this.rawMasterKeyBytes,
      pinWrappingKey
    );

    const currentMeta = this._metadata();
    if (!currentMeta) throw new Error('No vault metadata found');

    const updatedMeta: UserVaultMetadata = {
      ...currentMeta,
      hasPin: true,
      pinSalt,
      encryptedMasterKeyByPin: encByPin,
      ivByPin,
      updatedAt: new Date().toISOString()
    };

    await this.vaultMetaDb.saveMetadata(this.currentUid, updatedMeta);
    this._metadata.set(updatedMeta);
  }

  /**
   * Remove 4-digit PIN
   */
  public async removePin(): Promise<void> {
    if (!this.currentUid) throw new Error('No active user');
    const currentMeta = this._metadata();
    if (!currentMeta) return;

    const updatedMeta: UserVaultMetadata = {
      ...currentMeta,
      hasPin: false,
      pinSalt: undefined,
      encryptedMasterKeyByPin: undefined,
      ivByPin: undefined,
      updatedAt: new Date().toISOString()
    };

    await this.vaultMetaDb.saveMetadata(this.currentUid, updatedMeta);
    this._metadata.set(updatedMeta);
  }

  /**
   * Re-generate a fresh recovery key while the vault is unlocked
   */
  public async refreshRecoveryKey(): Promise<string> {
    if (!this.rawMasterKeyBytes || !this.currentUid) {
      throw new Error('Vault must be unlocked to refresh recovery key');
    }

    const recoveryKey = this.crypto.generateRecoveryKey();
    const recoveryKeyHash = await this.crypto.hashRecoveryKey(recoveryKey);
    const recoverySalt = this.crypto.getRandomSalt();
    const wrappingKey = await this.crypto.deriveWrappingKey(
      this.crypto.normalizeRecoveryKey(recoveryKey),
      recoverySalt,
      100000
    );
    const { ciphertext, iv } = await this.crypto.wrapMasterKey(this.rawMasterKeyBytes, wrappingKey);

    const currentMeta = this._metadata();
    if (!currentMeta) throw new Error('No vault metadata found');

    const updated: UserVaultMetadata = {
      ...currentMeta,
      recoverySalt,
      recoveryKeyHash,
      encryptedMasterKeyByRecovery: ciphertext,
      ivByRecovery: iv,
      updatedAt: new Date().toISOString()
    };

    await this.vaultMetaDb.saveMetadata(this.currentUid, updated);
    this._metadata.set(updated);
    return recoveryKey;
  }

  /**
   * Sync master key with new password (e.g. after password change)
   */
  public async rewrapWithPassword(newPassword: string): Promise<void> {
    if (!this.rawMasterKeyBytes || !this.currentUid) {
      throw new Error('Vault must be unlocked to rewrap with new password');
    }

    const salt = this.crypto.getRandomSalt();
    const passwordWrappingKey = await this.crypto.deriveWrappingKey(newPassword, salt, 100000);
    const { ciphertext, iv } = await this.crypto.wrapMasterKey(
      this.rawMasterKeyBytes,
      passwordWrappingKey
    );

    const currentMeta = this._metadata();
    if (!currentMeta) throw new Error('No vault metadata found');

    const updatedMeta: UserVaultMetadata = {
      ...currentMeta,
      hasPasswordKey: true,
      salt,
      encryptedMasterKeyByPassword: ciphertext,
      ivByPassword: iv,
      updatedAt: new Date().toISOString()
    };

    await this.vaultMetaDb.saveMetadata(this.currentUid, updatedMeta);
    this._metadata.set(updatedMeta);
  }

  /**
   * Encrypt Warehouses JSON with Master Key
   */
  public async encryptData(plainText: string): Promise<{ ciphertext: string; iv: string }> {
    if (!this.activeMasterKey) {
      throw new Error('Vault is locked. Cannot encrypt data.');
    }
    return this.crypto.encryptData(plainText, this.activeMasterKey);
  }

  /**
   * Decrypt Warehouses JSON with Master Key
   */
  public async decryptData(ciphertext: string, iv: string): Promise<string> {
    if (!this.activeMasterKey) {
      throw new Error('Vault is locked. Cannot decrypt data.');
    }
    return this.crypto.decryptData(ciphertext, iv, this.activeMasterKey);
  }

  /**
   * Fetch raw server document to show the user what Firebase database actually stores
   */
  public async getRawServerDocument(uid: string): Promise<any> {
    const docRef = doc(this.firestore, `warehouses/${uid}`);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  }
}
