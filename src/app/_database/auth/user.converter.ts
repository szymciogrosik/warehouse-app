import {FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions} from '@angular/fire/firestore';
import {CustomUser} from '../../_models/user/custom-user';

export const userConverter: FirestoreDataConverter<CustomUser> = {
  toFirestore(user: CustomUser): any {
    // Document ID in Firestore is the user's Auth UID.
    // We do not store "id" or "uid" explicitly in the document data.
    const { id, uid, ...dataToSave } = user;
    return dataToSave;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): CustomUser {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      uid: snapshot.id,
      email: data['email'] ?? '',
      firstName: data['firstName'] ?? '',
      lastName: data['lastName'] ?? '',
      roles: data['roles'] || [],
      photoUrl: data['photoUrl'] ?? null,
      isDeleted: data['isDeleted'] ?? false
    };
  }
};
