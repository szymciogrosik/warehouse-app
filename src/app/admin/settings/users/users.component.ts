import {Component, OnDestroy} from '@angular/core';
import {UserDbService} from "../../../_database/auth/user-db-service.service";
import {CustomUser} from "../../../_models/user/custom-user";
import {Subscription} from "rxjs";
import {AccessRoleService} from "../../../_services/auth/access-role.service";
import {CustomTranslateService} from "../../../_services/translate/custom-translate.service";
import {MatDialog} from "@angular/material/dialog";
import {MatTableDataSource} from "@angular/material/table";
import {SnackbarService} from "../../../_services/util/snackbar.service";
import {AuthService} from "../../../_services/auth/auth.service";
import {UserDetailsComponent} from "./user-details/user-details.component";
import {UserDetailsPopupData} from "../../../_models/dialog/user-details/user-details-popup-data";
import {UserDetailsType} from "../../../_models/dialog/user-details/user-details-type";
import {DialogService} from "../../../_services/util/dialog.service";
import {DialogData} from "../../../_models/dialog/dialog-data";
import {DialogType} from "../../../_models/dialog/dialog-type";
import {FirebaseError} from 'firebase/app';
import {CustomCommonModule} from "../../../_imports/CustomCommon.module";
import {AccessRole} from "../../../_models/user/access-role";

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  standalone: true,
  imports: [CustomCommonModule],
})
export class UsersComponent implements OnDestroy {
  protected allUsers: CustomUser[];
  protected allUsersSubscription: Subscription;
  protected displayedColumns: string[] = [
    'position', 'name', 'email', 'roles', 'details', 'remove'
  ];
  protected dataSource = new MatTableDataSource<CustomUser>([]);

  constructor(
    private accessService: AccessRoleService,
    private userDb: UserDbService,
    private translateService: CustomTranslateService,
    private dialog: MatDialog,
    private snackbarService: SnackbarService,
    private authService: AuthService,
    private dialogService: DialogService
  ) {
    this.accessService.isAuthorized(AccessRole.ADMIN_PAGE_ACCESS)
      .then((isAuthorized: boolean): void => {
        if (isAuthorized) {
          this.allUsersSubscription = this.userDb.getAll().subscribe(allUsers => {
            this.allUsers = allUsers.sort((a,b) => a.firstName.localeCompare(b.firstName));
            this.dataSource.data = this.allUsers;
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.allUsersSubscription?.unsubscribe();
  }

  protected applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  protected openAddUser(): any {
    const createRef = this.dialog.open(
      UserDetailsComponent,
      {
        maxWidth: '900px',
        disableClose: true,
        data: new UserDetailsPopupData(new CustomUser(), UserDetailsType.CREATE)
      }
    );

    createRef.afterClosed().subscribe(user => {
      if (user) {
        // Taking password from id place, because there are no dedicated place for it
        let password = user.id;
        user.id = null;
        this.authService.registerUser(user.email, password)
          .then((uid: string): void => {
            user.uid = uid;
            this.userDb.create(user)
              .then((): void => {
                this.openConfirmCreateUserDialog();
              })
              .catch((err): void => {
                console.error(err);
                this.snackbarService.openLongSnackBar(this.translateService.get('login.error.internal'));
              });
          })
          .catch((err) => {
            console.error(err);
            if (err instanceof FirebaseError && err.code === 'auth/email-already-in-use') {
              this.snackbarService.openLongSnackBar(this.translateService.get('login.error.emailAlreadyUsed'));
            } else {
              this.snackbarService.openLongSnackBar(this.translateService.get('login.error.internal'));
            }
          });
      }
    });
  }

  private openConfirmCreateUserDialog() {
    const confirmPopup =
      this.dialogService.openConfirmDialogWithData(
        new DialogData(
          this.translateService.get('admin.panel.settings.warning.popupWarning'),
          DialogType.CONFIRMATION,
          this.translateService.get('admin.panel.settings.users.addedSuccessfully'),
          null,
          this.translateService.get('registeredUsers.details.confirm')
        ));
    confirmPopup.afterClosed().subscribe(result => {
      if (result) {
        window.location.reload();
      }
    });
  }

  protected openUpdateUser(id: string): any {
    let user: CustomUser | undefined = this.allUsers.find(elem => elem.id === id);
    if (user === undefined) {
      this.snackbarService.openLongSnackBar(this.translateService.get('login.error.internal'));
      return;
    }
    const updateRef = this.dialog.open(
      UserDetailsComponent,
      {
        maxWidth: '900px',
        disableClose: true,
        data: new UserDetailsPopupData(user, UserDetailsType.UPDATE)
      }
    );

    updateRef.afterClosed().subscribe(user => {
      if (user) {
        this.userDb.update(user.id, user)
          .then((): void => {
            this.snackbarService.openDefaultSnackBar(this.translateService.get('admin.panel.settings.users.updatedSuccessfully'));
          })
          .catch((err): void => {
            console.error(err);
            this.snackbarService.openLongSnackBar(this.translateService.get('login.error.internal'));
          });
      }
    });
  }

  protected openConfirmRemoveUserDialog(id: string) {
    const confirmPopup =
      this.dialogService.openConfirmDialog('admin.panel.users.warning.removedUser');
    confirmPopup.afterClosed().subscribe(result => {
      if (result) {
        this.removeUser(id);
      }
    });
  }

  private removeUser(id: string): any {
    this.userDb.delete(id)
      .then((): void => {
        this.snackbarService.openDefaultSnackBar(this.translateService.get('admin.panel.settings.users.deletedSuccessfully'));
      })
      .catch((err): void => {
        console.error(err);
        this.snackbarService.openLongSnackBar(this.translateService.get('login.error.internal'));
      });
  }

}
