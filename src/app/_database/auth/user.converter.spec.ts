import { userConverter } from './user.converter';
import { CustomUser } from '../../_models/user/custom-user';
import { AccessRole } from '../../_models/user/access-role';
import { QueryDocumentSnapshot } from '@angular/fire/firestore';

describe('userConverter', () => {
  describe('toFirestore', () => {
    it('should strip both id and uid from document data before saving', () => {
      const user: CustomUser = {
        id: 'doc_id_123',
        uid: 'auth_uid_123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        roles: [AccessRole.ADMIN_PAGE_ACCESS],
        isDeleted: false
      };

      const firestoreData = userConverter.toFirestore(user) as Record<string, any>;

      expect(firestoreData['id']).toBeUndefined();
      expect(firestoreData['uid']).toBeUndefined();
      expect(firestoreData['email']).toBe('test@example.com');
      expect(firestoreData['firstName']).toBe('John');
      expect(firestoreData['lastName']).toBe('Doe');
      expect(firestoreData['roles']).toEqual([AccessRole.ADMIN_PAGE_ACCESS]);
      expect(firestoreData['isDeleted']).toBe(false);
    });
  });

  describe('fromFirestore', () => {
    it('should map snapshot.id to both id and uid as single source of truth', () => {
      const mockSnapshot = {
        id: 'user_auth_uid_999',
        data: jasmine.createSpy('data').and.returnValue({
          email: 'jane@example.com',
          firstName: 'Jane',
          lastName: 'Doe',
          roles: [AccessRole.ADMIN_CORE_SETTINGS],
          isDeleted: false
        })
      } as unknown as QueryDocumentSnapshot;

      const result = userConverter.fromFirestore(mockSnapshot, {});

      expect(result.id).toBe('user_auth_uid_999');
      expect(result.uid).toBe('user_auth_uid_999');
      expect(result.email).toBe('jane@example.com');
      expect(result.firstName).toBe('Jane');
      expect(result.lastName).toBe('Doe');
      expect(result.roles).toEqual([AccessRole.ADMIN_CORE_SETTINGS]);
      expect(result.isDeleted).toBe(false);
    });

    it('should provide default values when snapshot fields are missing', () => {
      const mockSnapshot = {
        id: 'minimal_user_id',
        data: jasmine.createSpy('data').and.returnValue({})
      } as unknown as QueryDocumentSnapshot;

      const result = userConverter.fromFirestore(mockSnapshot, {});

      expect(result.id).toBe('minimal_user_id');
      expect(result.uid).toBe('minimal_user_id');
      expect(result.email).toBe('');
      expect(result.firstName).toBe('');
      expect(result.lastName).toBe('');
      expect(result.roles).toEqual([]);
      expect(result.photoUrl).toBeNull();
      expect(result.isDeleted).toBe(false);
    });
  });
});
