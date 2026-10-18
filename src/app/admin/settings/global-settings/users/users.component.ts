import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {UserFacade} from '../../../../_database/auth/user.facade';
import {CustomUser} from '../../../../_models/user/custom-user';
import {AccessRoleService} from '../../../../_services/auth/access-role.service';
import {CustomTranslateService} from '../../../../_services/translate/custom-translate.service';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {SnackbarService} from '../../../../_services/util/snackbar.service';
import {AuthService} from '../../../../_services/auth/auth.service';
import {UserDetailsComponent} from './user-details/user-details.component';
import {UserDetailsPopupData} from '../../../../_models/dialog/user-details/user-details-popup-data';
import {UserDetailsType} from '../../../../_models/dialog/user-details/user-details-type';
import {DialogService} from '../../../../_services/util/dialog.service';
import {FirebaseError} from '@angular/fire/app';
import {TranslatePipe} from '@ngx-translate/core';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTabsModule} from '@angular/material/tabs';
import {SmartTableComponent} from '../../../../_shared-components/smart-table/smart-table.component';
import {SmartTableColumn} from '../../../../_shared-components/smart-table/smart-table.model';
import {firstValueFrom} from 'rxjs';
import {select_roles} from '../../../../_models/registration/select/select-roles';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  standalone: true,
  imports: [TranslatePipe, MatButtonModule, MatFormFieldModule, MatInputModule, MatDialogModule, MatTabsModule, SmartTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersComponent {
  private readonly accessService = inject(AccessRoleService);
  private readonly userFacade = inject(UserFacade);
  private readonly translateService = inject(CustomTranslateService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbarService = inject(SnackbarService);
  private readonly authService = inject(AuthService);
  private readonly dialogService = inject(DialogService);

  protected facadeAllUsers = this.userFacade.allUsers;
  protected activeUsers = this.userFacade.activeUsers;
  protected deletedUsers = this.userFacade.deletedUsers;

  protected addUserAction = {
    icon: 'person_add',
    tooltipKey: 'admin.panel.settings.users.addNewUser',
    color: 'primary' as const,
    onClick: () => this.openAddUser()
  };

  protected activeUsersColumns: SmartTableColumn<CustomUser>[] = [
    {key: 'position', headerLabelKey: 'admin.panel.table.header.no', type: 'index'},
    {
      key: 'name',
      headerLabelKey: 'admin.panel.table.header.name',
      type: 'text',
      valueFn: (row) => row.firstName + ' ' + row.lastName
    },
    {key: 'email', headerLabelKey: 'admin.panel.table.header.email', type: 'text'},
    {
      key: 'roles',
      headerLabelKey: 'admin.panel.table.header.role',
      type: 'text',
      truncateLength: 60,
      valueFn: (row) => row.roles ? row.roles.map(r => this.translateService.get(select_roles.find(sr => sr.value === r)?.viewKey || r)).join(', ') : ''
    },
    {
      key: 'actions', headerLabelKey: '', type: 'action', actions: [
        {
          tooltipKey: 'admin.panel.table.header.modify',
          icon: 'edit',
          color: 'accent',
          onClick: (row) => this.openUpdateUser(row.id!)
        },
        {
          tooltipKey: 'admin.panel.table.header.delete',
          icon: 'archive',
          color: 'warn',
          onClick: (row) => this.openConfirmRemoveUserDialog(row.id!)
        }
      ]
    }
  ];

  protected deletedUsersColumns: SmartTableColumn<CustomUser>[] = [
    {key: 'position', headerLabelKey: 'admin.panel.table.header.no', type: 'index'},
    {
      key: 'name',
      headerLabelKey: 'admin.panel.table.header.name',
      type: 'text',
      valueFn: (row) => row.firstName + ' ' + row.lastName
    },
    {key: 'email', headerLabelKey: 'admin.panel.table.header.email', type: 'text'},
    {key: 'uid', headerLabelKey: 'admin.panel.table.header.guid', type: 'text'},
    {
      key: 'actions', headerLabelKey: '', type: 'action', actions: [
        {
          tooltipKey: 'admin.panel.table.header.restore',
          icon: 'settings_backup_restore',
          color: 'accent',
          onClick: (row) => this.restoreUser(row.id!)
        }
      ]
    }
  ];

  protected async openAddUser(): Promise<void> {
    const createRef = this.dialog.open(
      UserDetailsComponent,
      {
        maxWidth: '900px',
        disableClose: true,
        data: new UserDetailsPopupData({
          id: '', uid: '', email: '', firstName: '', lastName: '', roles: []
        }, UserDetailsType.CREATE)
      }
    );

    const user = await firstValueFrom(createRef.afterClosed());
    if (user) {
      if (user.email) {
        user.email = user.email.trim();
      }
      let password = user.password;
      delete user.password;
      user.id = null;

      if (!password) {
        console.error('Password missing from form payload');
        this.snackbarService.openLongSnackBar(this.translateService.get('login.error.internal'));
        return;
      }

      try {
        const existingUsers = await this.userFacade.getUserByEmailAsync(user.email);
        const deletedUser = existingUsers.find(u => u.isDeleted);
        const activeUser = existingUsers.find(u => !u.isDeleted);

        if (activeUser) {
          this.snackbarService.openLongSnackBar(this.translateService.get('login.error.emailAlreadyUsed'));
          return;
        }

        if (deletedUser) {
          this.snackbarService.openLongSnackBar(this.translateService.get('admin.panel.settings.users.error.userDeletedOnlyRestore'));
          return;
        }

        const uid = await this.authService.registerUser(user.email, password);
        user.uid = uid;
        await this.userFacade.createUser(user);
        this.snackbarService.openSnackBar(this.translateService.get('admin.panel.settings.users.addedSuccessfully'));
      } catch (err) {
        console.error(err);
        if (err instanceof FirebaseError) {
          if (err.code === 'auth/email-already-in-use') {
            this.snackbarService.openLongSnackBar(this.translateService.get('login.error.emailAlreadyUsed'));
            return;
          }
          if (err.code === 'auth/invalid-email') {
            this.snackbarService.openLongSnackBar(this.translateService.get('login.validation.invalidEmail'));
            return;
          }
        }
        this.snackbarService.openLongSnackBar(this.translateService.get('login.error.internal'));
      }
    }
  }

  protected async openUpdateUser(id: string): Promise<void> {
    const currentUsers = this.activeUsers();
    let user: CustomUser | undefined = currentUsers ? currentUsers.find(elem => elem.id === id) : undefined;
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

    const updatedUser = await firstValueFrom(updateRef.afterClosed());
    if (updatedUser) {
      try {
        await this.userFacade.updateUser(updatedUser.id, updatedUser);
        this.snackbarService.openSnackBar(this.translateService.get('admin.panel.settings.users.updatedSuccessfully'));
      } catch (err) {
        console.error(err);
        this.snackbarService.openLongSnackBar(this.translateService.get('login.error.internal'));
      }
    }
  }

  protected async openConfirmRemoveUserDialog(id: string): Promise<void> {
    const confirmPopup =
      this.dialogService.openConfirmDialog('admin.panel.users.warning.removedUser');
    const result = await firstValueFrom(confirmPopup.afterClosed());
    if (result) {
      await this.removeUser(id);
    }
  }

  private removeUser(id: string): any {
    this.userFacade.updateUser(id, {isDeleted: true})
      .then((): void => {
        this.snackbarService.openSnackBar(this.translateService.get('admin.panel.settings.users.deletedSuccessfully'));
      })
      .catch((err): void => {
        console.error(err);
        this.snackbarService.openLongSnackBar(this.translateService.get('login.error.internal'));
      });
  }

  protected restoreUser(id: string): any {
    this.userFacade.updateUser(id, {isDeleted: false})
      .then((): void => {
        this.snackbarService.openSnackBar(this.translateService.get('admin.panel.settings.users.restoredSuccessfully'));
      })
      .catch((err): void => {
        console.error(err);
        this.snackbarService.openLongSnackBar(this.translateService.get('login.error.internal'));
      });
  }

}

