import { TestBed } from '@angular/core/testing';
import { UserFacade } from './user.facade';
import { UserDbService } from './user-db-service.service';
import { AuthService } from '../../_services/auth/auth.service';
import { of, BehaviorSubject } from 'rxjs';
import { CustomUser } from '../../_models/user/custom-user';
import { AccessRole } from '../../_models/user/access-role';

describe('UserFacade', () => {
  let facade: UserFacade;
  let mockUserDb: jasmine.SpyObj<UserDbService>;
  let userSubject: BehaviorSubject<CustomUser | null>;

  const activeUserA: CustomUser = {
    id: '1',
    uid: '1',
    email: 'adam@example.com',
    firstName: 'Adam',
    lastName: 'Smith',
    roles: [AccessRole.ADMIN_PAGE_ACCESS],
    isDeleted: false
  };

  const activeUserB: CustomUser = {
    id: '2',
    uid: '2',
    email: 'beatrice@example.com',
    firstName: 'Beatrice',
    lastName: 'Jones',
    roles: [],
    isDeleted: false
  };

  const deletedUser: CustomUser = {
    id: '3',
    uid: '3',
    email: 'charlie@example.com',
    firstName: 'Charlie',
    lastName: 'Brown',
    roles: [],
    isDeleted: true
  };

  beforeEach(() => {
    userSubject = new BehaviorSubject<CustomUser | null>(activeUserA);
    mockUserDb = jasmine.createSpyObj('UserDbService', ['getAll', 'getUserByEmail', 'create', 'update', 'delete']);
    mockUserDb.getAll.and.returnValue(of([deletedUser, activeUserB, activeUserA]));

    const mockAuthService = {
      loggedUser: () => userSubject.asObservable()
    };

    TestBed.configureTestingModule({
      providers: [
        UserFacade,
        { provide: UserDbService, useValue: mockUserDb },
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    facade = TestBed.inject(UserFacade);
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  it('should compute activeUsers correctly and sort them alphabetically by firstName', () => {
    const active = facade.activeUsers();
    expect(active).toBeDefined();
    expect(active?.length).toBe(2);
    expect(active?.[0].firstName).toBe('Adam');
    expect(active?.[1].firstName).toBe('Beatrice');
  });

  it('should compute deletedUsers correctly and sort them alphabetically', () => {
    const deleted = facade.deletedUsers();
    expect(deleted).toBeDefined();
    expect(deleted?.length).toBe(1);
    expect(deleted?.[0].firstName).toBe('Charlie');
  });

  it('should return empty list if no user is logged in', () => {
    userSubject.next(null);
    TestBed.flushEffects();
    const active = facade.activeUsers();
    expect(active).toEqual([]);
  });

  it('should delegate getUserByEmailAsync', async () => {
    mockUserDb.getUserByEmail.and.returnValue(of([activeUserA]));
    const result = await facade.getUserByEmailAsync('adam@example.com');
    expect(mockUserDb.getUserByEmail).toHaveBeenCalledWith('adam@example.com');
    expect(result).toEqual([activeUserA]);
  });

  it('should delegate createUser', async () => {
    mockUserDb.create.and.returnValue(Promise.resolve());
    await facade.createUser(activeUserB);
    expect(mockUserDb.create).toHaveBeenCalledWith(activeUserB);
  });

  it('should delegate updateUser', async () => {
    mockUserDb.update.and.returnValue(Promise.resolve());
    await facade.updateUser('1', { firstName: 'Updated' });
    expect(mockUserDb.update).toHaveBeenCalledWith('1', { firstName: 'Updated' });
  });

  it('should delegate deleteUser', async () => {
    mockUserDb.delete.and.returnValue(Promise.resolve());
    await facade.deleteUser('3');
    expect(mockUserDb.delete).toHaveBeenCalledWith('3');
  });
});
