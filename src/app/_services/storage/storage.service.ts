import {inject, Injectable} from '@angular/core';
import {getDownloadURL, ref, Storage, uploadBytes} from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage: Storage = inject(Storage);

  constructor() {
  }

  /**
   * Uploads a file to Firebase Storage and returns the download URL.
   * @param path The path in Firebase Storage (e.g. 'users/123/profile.webp')
   * @param file The Blob or File to upload
   */
  async uploadFile(path: string, file: Blob | File): Promise<string> {
    const fileRef = ref(this.storage, path);
    // Add aggressive caching strategy (1 year) specifically requested for profile pictures
    const metadata = {
      cacheControl: 'public, max-age=31536000'
    };
    await uploadBytes(fileRef, file, metadata);
    return getDownloadURL(fileRef);
  }
}
