import { publicSettingsConverter } from './public-settings.converter';
import { PublicSettings } from '../../_models/settings/public-settings';
import { QueryDocumentSnapshot } from '@angular/fire/firestore';

describe('publicSettingsConverter', () => {
  describe('toFirestore', () => {
    it('should strip id from document data before saving', () => {
      const settings: PublicSettings = {
        id: 'general',
        allowForRegistering: true,
        allowForProfilePictureChange: false,
        allowDarkMode: true
      };

      const firestoreData = publicSettingsConverter.toFirestore(settings) as Record<string, any>;

      expect(firestoreData['id']).toBeUndefined();
      expect(firestoreData['allowForRegistering']).toBe(true);
      expect(firestoreData['allowForProfilePictureChange']).toBe(false);
      expect(firestoreData['allowDarkMode']).toBe(true);
    });
  });

  describe('fromFirestore', () => {
    it('should map snapshot data and preserve Document ID', () => {
      const mockSnapshot = {
        id: 'general',
        data: jasmine.createSpy('data').and.returnValue({
          allowForRegistering: true,
          allowForProfilePictureChange: true,
          allowDarkMode: false
        })
      } as unknown as QueryDocumentSnapshot;

      const result = publicSettingsConverter.fromFirestore(mockSnapshot, {});

      expect(result.id).toBe('general');
      expect(result.allowForRegistering).toBe(true);
      expect(result.allowForProfilePictureChange).toBe(true);
      expect(result.allowDarkMode).toBe(false);
    });

    it('should fallback to false for missing boolean fields', () => {
      const mockSnapshot = {
        id: 'general',
        data: jasmine.createSpy('data').and.returnValue({})
      } as unknown as QueryDocumentSnapshot;

      const result = publicSettingsConverter.fromFirestore(mockSnapshot, {});

      expect(result.id).toBe('general');
      expect(result.allowForRegistering).toBe(false);
      expect(result.allowForProfilePictureChange).toBe(false);
      expect(result.allowDarkMode).toBe(false);
    });
  });
});
