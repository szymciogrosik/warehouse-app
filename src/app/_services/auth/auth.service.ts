import {inject, Injectable, Injector, runInInjectionContext} from '@angular/core';
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
import {BehaviorSubject, firstValueFrom, map, Observable, Subject} from 'rxjs';
import {FirebaseError} from '@angular/fire/app';
import {Router} from '@angular/router';
import {SnackbarService} from '../util/snackbar.service';
import {StandardUserDbService} from '../../_database/auth/standard-user-db.service';
import {CustomTranslateService} from '../translate/custom-translate.service';
import {CustomUser} from '../../_models/user/custom-user';
import {RedirectionEnum} from '../../../utils/redirection.enum';
import {AccessRole} from '../../_models/user/access-role';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<CustomUser | null>(null);
  private user: Observable<CustomUser | null> = this.userSubject.asObservable();
  private authErrorLogoutSubject = new Subject<void>();

  private pendingRegistrationInfo: { firstName: string, lastName: string, roles: AccessRole[] } | null = null;

  private readonly injector: Injector;

  constructor(
    private auth: Auth,
    private router: Router,
    private snackbarService: SnackbarService,
    private standardUserService: StandardUserDbService,
    private translateService: CustomTranslateService
  ) {
    this.injector = inject(Injector);
    this.listenForAuthChanges();
  }

  private listenForAuthChanges() {
    onAuthStateChanged(this.auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        try {
          const foundUser = await this.standardUserService.getUser(firebaseUser.uid, firebaseUser.email);
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
              const newUser = new CustomUser();
              newUser.uid = firebaseUser.uid;
              newUser.email = firebaseUser.email || '';
              newUser.firstName = this.pendingRegistrationInfo.firstName;
              newUser.lastName = this.pendingRegistrationInfo.lastName;
              newUser.roles = this.pendingRegistrationInfo.roles;
              newUser.isDeleted = false;

              await this.standardUserService.create(newUser);

              // Read it back to have ID
              const storedUser = await this.standardUserService.getUser(firebaseUser.uid, firebaseUser.email);
              this.userSubject.next(storedUser);
              this.pendingRegistrationInfo = null;
            } else {
              this.logout(false);
              this.authErrorLogoutSubject.next();
              this.snackbarService.openLongSnackBar(this.translateService.get('login.error.invalidUser'));
            }
          }
        } catch (err) {
          console.error(err);
          this.logout(false);
          this.authErrorLogoutSubject.next();
          this.snackbarService.openLongSnackBar(this.translateService.get('login.error.internal'));
        }
      } else {
        this.logout(false);
      }
    });
  }

  public async registerUser(email: string, password: string): Promise<string> {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    if (!userCredential.user?.uid) throw new Error('UID undefined');
    return userCredential.user.uid;
  }

  public async registerUserWithDetails(email: string, password: string, firstName: string, lastName: string): Promise<void> {
    this.pendingRegistrationInfo = {
      firstName: firstName,
      lastName: lastName,
      roles: []
    };
    await createUserWithEmailAndPassword(this.auth, email, password);
  }

  public async loginWithEmailAndPassword(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (err: any) {
      console.error(err);
      if (err instanceof FirebaseError || err?.code) {
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
          throw this.translateService.get('login.error.invalidCredentials');
        }
      }
      throw this.translateService.get('login.error.internal');
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
    if (this.injector) {
      runInInjectionContext(this.injector, () => {
        signOut(this.auth).then(() => {
          this.userSubject.next(null);
          if (withRedirection) this.router.navigate([RedirectionEnum.LOGIN]);
        }).catch(err => {
          console.error(err);
          this.userSubject.next(null);
          this.snackbarService.openLongSnackBar(this.translateService.get('login.error.internal'));
        });
      });
    } else {
      signOut(this.auth).then(() => {
        this.userSubject.next(null);
        if (withRedirection) this.router.navigate([RedirectionEnum.LOGIN]);
      });
    }
  }

  public isAuthenticated(): Observable<boolean> {
    return this.user.pipe(map(u => !!u));
  }

  public loggedUser(): Observable<CustomUser | null> {
    return this.user;
  }

  public async loggedUserPromise(): Promise<CustomUser | null> {
    return await firstValueFrom(this.loggedUser());
  }

  public getAuthErrorLogout(): Observable<void> {
    return this.authErrorLogoutSubject.asObservable();
  }
}
