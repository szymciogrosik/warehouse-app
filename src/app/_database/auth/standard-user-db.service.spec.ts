import { TestBed } from '@angular/core/testing';
import { StandardUserDbService } from './standard-user-db.service';
import { UserDbService } from './user-db-service.service';
import { of, firstValueFrom } from 'rxjs';
import { CustomUser } from '../../_models/user/custom-user';
import { AccessRole } from '../../_models/user/access-role';

describe('StandardUserDbService', () => {
  let service: StandardUserDbService;
  let mockUserDbService: jasmine.SpyObj<UserDbService>;

  const mockUser: CustomUser = {
    id: 'uid123',
    uid: 'uid123',
    email: 'user@example.com',
    firstName: 'Alice',
    lastName: 'Smith',
    roles: [AccessRole.ADMIN_PAGE_ACCESS],
    isDeleted: false
  };

  beforeEach(() => {
    mockUserDbService = jasmine.createSpyObj('UserDbService', ['getUser', 'create']);

    TestBed.configureTestingModule({
      providers: [
        StandardUserDbService,
        { provide: UserDbService, useValue: mockUserDbService }
      ]
    });

    service = TestBed.inject(StandardUserDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should watch user and emit CustomUser when found', async () => {
    mockUserDbService.getUser.and.returnValue(of(mockUser));

    const emitted = await firstValueFrom(service.watchUser('uid123'));
    expect(mockUserDbService.getUser).toHaveBeenCalledWith('uid123');
    expect(emitted).toEqual(mockUser);
  });

  it('should watch user and map undefined to null when not found', async () => {
    mockUserDbService.getUser.and.returnValue(of(undefined));

    const emitted = await firstValueFrom(service.watchUser('nonexistent_uid'));
    expect(mockUserDbService.getUser).toHaveBeenCalledWith('nonexistent_uid');
    expect(emitted).toBeNull();
  });

  it('should delegate create call to UserDbService', async () => {
    mockUserDbService.create.and.returnValue(Promise.resolve());

    await service.create(mockUser);
    expect(mockUserDbService.create).toHaveBeenCalledWith(mockUser);
  });
});
