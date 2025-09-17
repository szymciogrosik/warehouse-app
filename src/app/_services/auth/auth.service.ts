import {Injectable} from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from '@angular/fire/auth';
import {firstValueFrom, BehaviorSubject, Observable, map} from 'rxjs';
import {Router} from '@angular/router';
import {SnackbarService} from '../util/snackbar.service';
import {StandardUserDbService} from '../../_database/auth/standard-user-db.service';
import {CustomTranslateService} from '../translate/custom-translate.service';
import {CustomUser} from '../../_models/user/custom-user';
import {RedirectionEnum} from '../../../utils/redirection.enum';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<CustomUser | null>(null);
  private user: Observable<CustomUser | null> = this.userSubject.asObservable();

  constructor(
    private auth: Auth,
    private router: Router,
    private snackbarService: SnackbarService,
    private standardUserService: StandardUserDbService,
    private translateService: CustomTranslateService
  ) {
    this.listenForAuthChanges();
  }

  private listenForAuthChanges() {
    onAuthStateChanged(this.auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        try {
          const foundUser = await this.standardUserService.getUser(firebaseUser.uid, firebaseUser.email);
          if (foundUser) {
            this.userSubject.next(foundUser);
          } else {
            this.logout(true);
            this.snackbarService.openLongSnackBar(this.translateService.get('login.error.invalidUser'));
          }
        } catch (err) {
          console.error(err);
          this.logout(true);
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

  public async loginWithEmailAndPassword(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (err) {
      console.error(err);
      throw this.translateService.get('login.error.internal');
    }
  }

  public async loginWithGoogleSso(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(this.auth, provider);
    } catch (err) {
      console.error(err);
      throw this.translateService.get('login.error.internal');
    }
  }

  public logout(withRedirection: boolean): void {
    signOut(this.auth).then(() => {
      this.userSubject.next(null);
      if (withRedirection) this.router.navigate([RedirectionEnum.LOGIN]);
    }).catch(err => {
      console.error(err);
      this.userSubject.next(null);
      this.snackbarService.openLongSnackBar(this.translateService.get('login.error.internal'));
    });
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
}
