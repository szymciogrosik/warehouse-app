export interface UserVaultMetadata {
  readonly version: number;
  readonly hasPasswordKey: boolean;
  readonly hasPin: boolean;
  readonly salt: string; // Base64 salt for password PBKDF2
  readonly pinSalt?: string; // Base64 salt for PIN PBKDF2
  readonly recoverySalt: string; // Base64 salt for recovery key PBKDF2
  readonly recoveryKeyHash: string; // SHA-256 hex/base64 hash of normalized recovery key
  readonly encryptedMasterKeyByPassword?: string; // Base64 ciphertext
  readonly ivByPassword?: string; // Base64 IV
  readonly encryptedMasterKeyByPin?: string; // Base64 ciphertext
  readonly ivByPin?: string; // Base64 IV
  readonly encryptedMasterKeyByRecovery: string; // Base64 ciphertext
  readonly ivByRecovery: string; // Base64 IV
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type VaultStatus = 'UNLOCKED' | 'LOCKED' | 'NOT_CONFIGURED';

export interface EncryptedPayload {
  readonly isEncrypted: true;
  readonly version: number;
  readonly iv: string;
  readonly encryptedData: string;
  readonly updatedAt: string;
}
