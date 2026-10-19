import {computed, inject, Injectable, Injector, runInInjectionContext, signal} from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  User,
  deleteUser
} from '@angular/fire/auth';
import {BehaviorSubject, map, Observable, Subject, Subscription} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';
import {FirebaseError} from '@angular/fire/app';
import {Router} from '@angular/router';
import {SnackbarService} from '../util/snackbar.service';
import {StandardUserDbService} from '../../_database/auth/standard-user-db.service';
import {CustomTranslateService} from '../translate/custom-translate.service';
import {CustomUser} from '../../_models/user/custom-user';
import {RedirectionEnum} from '../../../utils/redirection.enum';
import {AccessRole} from '../../_models/user/access-role';
import {VaultService} from '../security/vault.service';
import {VaultMetaDbService} from '../../_database/security/vault-meta-db.service';
import {MatDialog} from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly snackbarService = inject(SnackbarService);
  private readonly standardUserService = inject(StandardUserDbService);
  private readonly translateService = inject(CustomTranslateService);
  private readonly injector = inject(Injector);
  private readonly vaultService = inject(VaultService);
  private readonly vaultMetaDb = inject(VaultMetaDbService);
  private readonly dialog = inject(MatDialog, {optional: true});

  private readonly userSubject = new BehaviorSubject<CustomUser | null>(null);
  private readonly user$ = this.userSubject.asObservable();
  private readonly authErrorLogoutSubject = new Subject<void>();
  private userSubscription: Subscription | null = null;

  private pendingRegistrationInfo: { firstName: string, lastName: string, roles: AccessRole[] } | null = null;

  public readonly currentUser = toSignal(this.user$, {initialValue: null});
  public readonly isLoggedIn = computed(() => !!this.currentUser());
  public readonly isLoading = signal(true);

  constructor() {
    this.listenForAuthChanges();
  }

  private listenForAuthChanges() {
    onAuthStateChanged(this.auth, (firebaseUser: User | null) => {
      this.isLoading.set(true);
      this.userSubscription?.unsubscribe();

      if (firebaseUser) {
        this.vaultService.initForUser(firebaseUser.uid);
        this.userSubscription = this.standardUserService.watchUser(firebaseUser.uid, firebaseUser.email)
          .subscribe({
            next: async (foundUser) => {
              if (foundUser) {
                if (foundUser.isDeleted) {
                  this.logout(false);
                  this.authErrorLogoutSubject.next();
                  this.snackbarService.openLongSnackBar(this.translateService.get('login.error.invalidUser'));
                } else {
                  this.userSubject.next(foundUser);
                }
              } else {
                // Check if this is a pending registration
                if (this.pendingRegistrationInfo) {
                  const newUser: CustomUser = {
                    id: '',
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    firstName: this.pendingRegistrationInfo.firstName,
                    lastName: this.pendingRegistrationInfo.lastName,
                    roles: this.pendingRegistrationInfo.roles,
                    isDeleted: false
                  };

                  await this.standardUserService.create(newUser);
                  this.pendingRegistrationInfo = null;
                  // The watchUser subscription will trigger again when the user is created
                } else {
                  this.logout(false);
                  this.authErrorLogoutSubject.next();
                  this.snackbarService.openLongSnackBar(this.translateService.get('login.error.invalidUser'));
                }
              }
              this.isLoading.set(false);
            },
            error: (err) => {
              console.error(err);
              this.logout(false);
              this.authErrorLogoutSubject.next();
              this.snackbarService.openLongSnackBar(this.translateService.get('login.error.internal'));
              this.isLoading.set(false);
            }
          });
      } else {
        this.unsubscribe();
        this.isLoading.set(false);
      }
    });
  }

  public async registerUser(email: string, password: string): Promise<string> {
    const cleanEmail = email?.trim() || '';
    const { initializeApp, getApps } = await import('firebase/app');
    const { getAuth, createUserWithEmailAndPassword: createSecondaryUser, signOut: signSecondaryOut } = await import('firebase/auth');

    const secondaryAppName = 'SecondaryAuthApp';
    const secondaryApp = getApps().find(app => app.name === secondaryAppName)
      || initializeApp(this.auth.app.options, secondaryAppName);
    const secondaryAuth = getAuth(secondaryApp);

    try {
      const userCredential = await createSecondaryUser(secondaryAuth, cleanEmail, password);
      if (!userCredential.user?.uid) throw new Error('UID undefined');
      return userCredential.user.uid;
    } finally {
      await signSecondaryOut(secondaryAuth);
    }
  }

  public async registerUserWithDetails(email: string, password: string, firstName: string, lastName: string): Promise<void> {
    this.pendingRegistrationInfo = {
      firstName: firstName,
      lastName: lastName,
      roles: []
    };
    try {
      this.vaultService.isAutoUnlocking.set(true);
      const cred = await createUserWithEmailAndPassword(this.auth, email, password);
      if (cred.user?.uid) {
        this.vaultService.initForUser(cred.user.uid);
        try {
          await this.vaultService.setupVaultWithPassword(password);
        } catch (e) {
          console.warn('Initial vault setup warning:', e);
        }
      }
    } finally {
      this.vaultService.isAutoUnlocking.set(false);
    }
  }

  public async loginWithEmailAndPassword(email: string, password: string): Promise<void> {
    try {
      this.vaultService.isAutoUnlocking.set(true);
      const cred = await signInWithEmailAndPassword(this.auth, email, password);
      if (cred.user?.uid) {
        this.vaultService.initForUser(cred.user.uid);
        try {
          const meta = await this.vaultMetaDb.getMetadata(cred.user.uid);
          if (meta?.hasPasswordKey) {
            await this.vaultService.unlockWithPassword(password);
          } else if (!meta) {
            await this.vaultService.setupVaultWithPassword(password);
          }
        } catch (vaultErr) {
          console.warn('Vault auto-unlock warning:', vaultErr);
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err instanceof FirebaseError || err?.code) {
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
          throw this.translateService.get('login.error.invalidCredentials');
        }
      }
      throw this.translateService.get('login.error.internal');
    } finally {
      this.vaultService.isAutoUnlocking.set(false);
    }
  }

  public async loginWithGoogleSso(isRegistration: boolean = false): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(this.auth, provider);

      const additionalInfo = getAdditionalUserInfo(userCredential);
      if (isRegistration && additionalInfo?.isNewUser) {
        // New user from Google
        const profile = additionalInfo.profile as any;
        this.pendingRegistrationInfo = {
          firstName: profile?.given_name || profile?.name || '',
          lastName: profile?.family_name || '',
          roles: []
        };
      } else if (isRegistration && !additionalInfo?.isNewUser) {
        // They clicked "Register with Google" but already have an account. We continue as standard login (don't override).
        // If we wanted to treat it differently we could, but letting it login is common behavior.
      } else if (!isRegistration && additionalInfo?.isNewUser) {
        // Logged in with Google, but it's fundamentally a new user and it wasn't a registration intent
        // We delete the user from Firebase Auth to prevent creating a record.
        await deleteUser(userCredential.user);
        await signOut(this.auth);
        throw this.translateService.get('login.error.invalidUser');
      }
    } catch (err) {
      console.error(err);
      if (err === this.translateService.get('login.error.invalidUser')) {
        throw err;
      }
      throw this.translateService.get('login.error.internal');
    }
  }

  public async updateAuthPassword(newPassword: string): Promise<void> {
    if (!this.auth.currentUser) {
      throw new Error('No user currently logged in.');
    }

    try {
      await updatePassword(this.auth.currentUser, newPassword);
      if (this.vaultService.isUnlocked()) {
        try {
          await this.vaultService.rewrapWithPassword(newPassword);
        } catch (vaultErr) {
          console.warn('Failed to rewrap vault with new password:', vaultErr);
        }
      }
    } catch (error) {
      console.error('Failed to update password', error);
      throw error;
    }
  }

  public async sendPasswordResetLink(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      console.error('Failed to send password reset email', error);
      throw error;
    }
  }

  public logout(withRedirection: boolean): void {
    this.dialog?.closeAll();
    if (this.injector) {
      runInInjectionContext(this.injector, () => {
        signOut(this.auth).then(() => {
          this.unsubscribe();
          if (withRedirection) this.router.navigate([RedirectionEnum.SEP + RedirectionEnum.LOGIN]);
        }).catch(err => {
          console.error(err);
          this.userSubject.next(null);
          this.snackbarService.openLongSnackBar(this.translateService.get('login.error.internal'));
        });
      });
    } else {
      signOut(this.auth).then(() => {
        this.unsubscribe();
        if (withRedirection) this.router.navigate([RedirectionEnum.SEP + RedirectionEnum.LOGIN]);
      });
    }
  }

  private unsubscribe(): void {
    this.dialog?.closeAll();
    this.vaultService.clearSession();
    this.userSubscription?.unsubscribe();
    this.userSubscription = null;
    this.userSubject.next(null);
  }

  public isAuthenticated(): Observable<boolean> {
    return this.user$.pipe(map(u => !!u));
  }

  public loggedUser(): Observable<CustomUser | null> {
    return this.user$;
  }

  public updateLocalUser(data: Partial<CustomUser>): void {
    const current = this.userSubject.value;
    if (current) {
      this.userSubject.next({ ...current, ...data });
    }
  }

  public getAuthErrorLogout(): Observable<void> {
    return this.authErrorLogoutSubject.asObservable();
  }
}
