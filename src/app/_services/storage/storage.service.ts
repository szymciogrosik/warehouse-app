import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom, timeout} from 'rxjs';
import {APP_CONFIG} from '../../app.config.token';
import {SnackbarService} from '../util/snackbar.service';
import {CustomTranslateService} from '../translate/custom-translate.service';

export interface CloudinaryUploadResponse {
  readonly secure_url: string;
  readonly public_id: string;
  readonly format: string;
  readonly bytes: number;
  readonly width: number;
  readonly height: number;
  readonly created_at: string;
}

export interface FileValidationOptions {
  readonly maxFileSizeBytes?: number;
  readonly allowedMimeTypes?: ReadonlySet<string>;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  public static readonly MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
  public static readonly ALLOWED_IMAGE_MIME_TYPES: ReadonlySet<string> = new Set([
    'image/jpeg',
    'image/png',
    'image/webp'
  ]);
  public static readonly ALLOWED_IMAGE_ACCEPT = Array.from(StorageService.ALLOWED_IMAGE_MIME_TYPES).join(',');

  private static readonly UPLOAD_TIMEOUT_MS = 30000;

  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(APP_CONFIG);
  private readonly snackbarService = inject(SnackbarService);
  private readonly translateService = inject(CustomTranslateService);

  /**
   * Extracts the first selected file from a file input `<input type="file">` change event
   * and validates its MIME type and size. Automatically displays a localized snackbar error
   * and clears the input value if validation fails.
   *
   * @param event The DOM change event from the file input element
   * @param options Optional custom validation constraints (defaults to image MIME types and 5 MB limit)
   * @returns The validated File, or null if no file was selected or validation failed
   */
  extractAndValidateFile(event: Event, options?: FileValidationOptions): File | null {
    const input = event.target as HTMLInputElement | null;
    if (!input?.files || input.files.length === 0) {
      return null;
    }

    const file = input.files[0];
    if (!this.validateFile(file, options)) {
      input.value = '';
      return null;
    }

    return file;
  }

  /**
   * Validates a File against allowed MIME types and maximum byte size.
   * Displays a localized snackbar message when invalid.
   *
   * @param file The File to validate
   * @param options Optional custom validation constraints (defaults to image MIME types and 5 MB limit)
   * @returns true if valid, false otherwise
   */
  validateFile(file: File, options?: FileValidationOptions): boolean {
    const allowedMimeTypes = options?.allowedMimeTypes ?? StorageService.ALLOWED_IMAGE_MIME_TYPES;
    const maxFileSizeBytes = options?.maxFileSizeBytes ?? StorageService.MAX_FILE_SIZE_BYTES;

    if (!allowedMimeTypes.has(file.type)) {
      this.snackbarService.openLongSnackBar(this.translateService.get('profile.photo.error.invalidFormat'));
      return false;
    }

    if (file.size > maxFileSizeBytes) {
      this.snackbarService.openLongSnackBar(this.translateService.get('profile.photo.error.fileTooLarge'));
      return false;
    }

    return true;
  }

  /**
   * Uploads an image Blob or File directly to Cloudinary using an Unsigned Upload Preset
   * and returns an optimized delivery URL with automatic format and quality transformations (`f_auto,q_auto`).
   *
   * @param folder The target folder in Cloudinary (e.g. 'users/123')
   * @param file The Blob or File to upload
   * @param fileName Optional file name (defaults to File.name if a File is passed, otherwise 'upload.webp')
   */
  async uploadFile(folder: string, file: Blob | File, fileName?: string): Promise<string> {
    const cloudName = this.appConfig.cloudinary?.cloudName?.trim();
    const uploadPreset = this.appConfig.cloudinary?.uploadPreset?.trim();

    if (
      !cloudName ||
      !uploadPreset ||
      cloudName === 'CLOUDINARY_CLOUD_NAME' ||
      uploadPreset === 'CLOUDINARY_UPLOAD_PRESET'
    ) {
      throw new Error(
        'Cloudinary is not configured. Set cloudinary.cloudName and cloudinary.uploadPreset in environment.ts.'
      );
    }

    const resolvedFileName = fileName ?? (file instanceof File ? file.name : 'upload.webp');
    const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`;
    const formData = new FormData();
    formData.append('file', file, resolvedFileName);
    formData.append('upload_preset', uploadPreset);

    if (folder) {
      formData.append('folder', folder);
    }

    const response = await firstValueFrom(
      this.http
        .post<CloudinaryUploadResponse>(endpoint, formData)
        .pipe(timeout(StorageService.UPLOAD_TIMEOUT_MS))
    );

    if (!response?.secure_url) {
      throw new Error('Cloudinary response did not contain a valid secure_url.');
    }

    return this.applyDeliveryOptimizations(response.secure_url);
  }

  /**
   * Injects Cloudinary on-the-fly delivery transformations (`f_auto,q_auto`) into the secure URL
   * so browsers receive optimal modern formats (AVIF/WebP) and compressed byte size via CDN.
   */
  private applyDeliveryOptimizations(secureUrl: string): string {
    const uploadSegment = '/image/upload/';
    if (secureUrl.includes(uploadSegment) && !secureUrl.includes('/image/upload/f_auto,q_auto/')) {
      return secureUrl.replace(uploadSegment, '/image/upload/f_auto,q_auto/');
    }
    return secureUrl;
  }
}
