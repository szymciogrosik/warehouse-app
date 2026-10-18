import {FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions} from '@angular/fire/firestore';
import {PublicSettings} from '../../_models/settings/public-settings';

export const publicSettingsConverter: FirestoreDataConverter<PublicSettings> = {
  toFirestore(settings: PublicSettings): any {
    const { id, ...dataToSave } = settings;
    return dataToSave;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): PublicSettings {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      ...data,
      allowForRegistering: data['allowForRegistering'] ?? false,
      allowForProfilePictureChange: data['allowForProfilePictureChange'] ?? false,
      allowDarkMode: data['allowDarkMode'] ?? false
    } as PublicSettings;
  }
};
