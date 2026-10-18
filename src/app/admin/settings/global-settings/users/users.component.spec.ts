import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersComponent } from './users.component';
import { UserFacade } from '../../../../_database/auth/user.facade';
import { AccessRoleService } from '../../../../_services/auth/access-role.service';
import { CustomTranslateService } from '../../../../_services/translate/custom-translate.service';
import { MatDialog } from '@angular/material/dialog';
import { SnackbarService } from '../../../../_services/util/snackbar.service';
import { AuthService } from '../../../../_services/auth/auth.service';
import { DialogService } from '../../../../_services/util/dialog.service';
import { provideTranslateService } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { CustomUser } from '../../../../_models/user/custom-user';
import { AccessRole } from '../../../../_models/user/access-role';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let mockUserFacade: any;
  let mockSnackbarService: jasmine.SpyObj<SnackbarService>;
  let mockTranslateService: jasmine.SpyObj<CustomTranslateService>;
  let mockAuthService: any;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockDialogService: jasmine.SpyObj<DialogService>;

  const activeUsersList: CustomUser[] = [
    {
      id: '1',
      uid: '1',
      email: 'active@example.com',
      firstName: 'Active',
      lastName: 'User',
      roles: [AccessRole.ADMIN_PAGE_ACCESS],
      isDeleted: false
    }
  ];

  const deletedUsersList: CustomUser[] = [
    {
      id: '2',
      uid: '2',
      email: 'deleted@example.com',
      firstName: 'Deleted',
      lastName: 'User',
      roles: [],
      isDeleted: true
    }
  ];

  beforeEach(async () => {
    mockUserFacade = {
      allUsers: signal([...activeUsersList, ...deletedUsersList]),
      activeUsers: signal(activeUsersList),
      deletedUsers: signal(deletedUsersList),
      getUserByEmailAsync: jasmine.createSpy('getUserByEmailAsync').and.returnValue(Promise.resolve([])),
      createUser: jasmine.createSpy('createUser').and.returnValue(Promise.resolve()),
      updateUser: jasmine.createSpy('updateUser').and.returnValue(Promise.resolve()),
      deleteUser: jasmine.createSpy('deleteUser').and.returnValue(Promise.resolve())
    };

    mockSnackbarService = jasmine.createSpyObj('SnackbarService', ['openSnackBar', 'openLongSnackBar']);
    mockTranslateService = jasmine.createSpyObj('CustomTranslateService', ['get']);
    mockTranslateService.get.and.callFake((key: string) => key);

    mockAuthService = {
      registerUser: jasmine.createSpy('registerUser').and.returnValue(Promise.resolve('new_uid_123'))
    };

    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockDialogService = jasmine.createSpyObj('DialogService', ['openConfirmDialog']);

    await TestBed.configureTestingModule({
      imports: [UsersComponent, NoopAnimationsModule],
      providers: [
        provideTranslateService(),
        { provide: UserFacade, useValue: mockUserFacade },
        { provide: AccessRoleService, useValue: { isAuthorizedSignal: () => signal(true) } },
        { provide: CustomTranslateService, useValue: mockTranslateService },
        { provide: SnackbarService, useValue: mockSnackbarService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: DialogService, useValue: mockDialogService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    (component as any).dialog = mockDialog;
    (component as any).dialogService = mockDialogService;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should restore user when restoreUser is called', async () => {
    mockUserFacade.updateUser.and.resolveTo();
    component['restoreUser']('2');
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(mockUserFacade.updateUser).toHaveBeenCalledWith('2', { isDeleted: false });
    expect(mockSnackbarService.openSnackBar).toHaveBeenCalledWith('admin.panel.settings.users.restoredSuccessfully');
  });

  it('should handle error when restoreUser fails', async () => {
    mockUserFacade.updateUser.and.rejectWith('Update error');
    component['restoreUser']('2');
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(mockSnackbarService.openLongSnackBar).toHaveBeenCalledWith('login.error.internal');
  });

  it('should archive user when removeUser is called', async () => {
    mockUserFacade.updateUser.and.resolveTo();
    component['removeUser']('1');
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(mockUserFacade.updateUser).toHaveBeenCalledWith('1', { isDeleted: true });
    expect(mockSnackbarService.openSnackBar).toHaveBeenCalledWith('admin.panel.settings.users.deletedSuccessfully');
  });

  it('should handle error when removeUser fails', async () => {
    mockUserFacade.updateUser.and.rejectWith('Delete error');
    component['removeUser']('1');
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(mockSnackbarService.openLongSnackBar).toHaveBeenCalledWith('login.error.internal');
  });

  it('should prompt confirmation dialog before removing user', async () => {
    mockDialogService.openConfirmDialog.and.returnValue({
      afterClosed: () => of(true)
    } as any);

    await component['openConfirmRemoveUserDialog']('1');

    expect(mockDialogService.openConfirmDialog).toHaveBeenCalledWith('admin.panel.users.warning.removedUser');
    expect(mockUserFacade.updateUser).toHaveBeenCalledWith('1', { isDeleted: true });
  });

  it('should not remove user if confirmation dialog was cancelled', async () => {
    mockDialogService.openConfirmDialog.and.returnValue({
      afterClosed: () => of(false)
    } as any);

    await component['openConfirmRemoveUserDialog']('1');

    expect(mockDialogService.openConfirmDialog).toHaveBeenCalledWith('admin.panel.users.warning.removedUser');
    expect(mockUserFacade.updateUser).not.toHaveBeenCalled();
  });

  describe('openAddUser edge cases', () => {
    it('should not create user if add user dialog is cancelled', async () => {
      mockDialog.open.and.returnValue({
        afterClosed: () => of(null)
      } as any);

      await component['openAddUser']();
      expect(mockUserFacade.createUser).not.toHaveBeenCalled();
    });

    it('should show error if password is missing in dialog return payload', async () => {
      mockDialog.open.and.returnValue({
        afterClosed: () => of({ email: 'new@example.com', firstName: 'A', lastName: 'B' })
      } as any);

      await component['openAddUser']();
      expect(mockSnackbarService.openLongSnackBar).toHaveBeenCalledWith('login.error.internal');
    });

    it('should reject if active user already exists with that email', async () => {
      mockDialog.open.and.returnValue({
        afterClosed: () => of({ email: 'active@example.com', password: 'Pass', firstName: 'A', lastName: 'B' })
      } as any);
      mockUserFacade.getUserByEmailAsync.and.resolveTo([activeUsersList[0]]);

      await component['openAddUser']();
      expect(mockSnackbarService.openLongSnackBar).toHaveBeenCalledWith('login.error.emailAlreadyUsed');
      expect(mockAuthService.registerUser).not.toHaveBeenCalled();
    });

    it('should reject if user was previously deleted with that email', async () => {
      mockDialog.open.and.returnValue({
        afterClosed: () => of({ email: 'deleted@example.com', password: 'Pass', firstName: 'A', lastName: 'B' })
      } as any);
      mockUserFacade.getUserByEmailAsync.and.resolveTo([deletedUsersList[0]]);

      await component['openAddUser']();
      expect(mockSnackbarService.openLongSnackBar).toHaveBeenCalledWith('admin.panel.settings.users.error.userDeletedOnlyRestore');
      expect(mockAuthService.registerUser).not.toHaveBeenCalled();
    });

    it('should register and create user when email is unique and password is provided', async () => {
      mockDialog.open.and.returnValue({
        afterClosed: () => of({ email: ' brandnew@example.com ', password: 'ValidPassword123!', firstName: 'A', lastName: 'B' })
      } as any);
      mockUserFacade.getUserByEmailAsync.and.resolveTo([]);

      await component['openAddUser']();
      expect(mockAuthService.registerUser).toHaveBeenCalledWith('brandnew@example.com', 'ValidPassword123!');
      expect(mockUserFacade.createUser).toHaveBeenCalled();
      expect(mockSnackbarService.openSnackBar).toHaveBeenCalledWith('admin.panel.settings.users.addedSuccessfully');
    });
  });

  describe('openUpdateUser edge cases', () => {
    it('should show error if user is not found in activeUsers', async () => {
      await component['openUpdateUser']('999-non-existent');
      expect(mockSnackbarService.openLongSnackBar).toHaveBeenCalledWith('login.error.internal');
    });

    it('should update user when dialog returns updated user payload', async () => {
      mockDialog.open.and.returnValue({
        afterClosed: () => of({ id: '1', firstName: 'Updated' })
      } as any);

      await component['openUpdateUser']('1');
      expect(mockUserFacade.updateUser).toHaveBeenCalledWith('1', { id: '1', firstName: 'Updated' });
      expect(mockSnackbarService.openSnackBar).toHaveBeenCalledWith('admin.panel.settings.users.updatedSuccessfully');
    });
  });
});
