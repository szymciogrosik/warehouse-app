import { TestBed } from '@angular/core/testing';
import { AccessRoleService } from './access-role.service';
import { AuthService } from './auth.service';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { AccessRole } from '../../_models/user/access-role';
import { CustomUser } from '../../_models/user/custom-user';

describe('AccessRoleService', () => {
  let service: AccessRoleService;
  let currentUserSignal: any;
  let mockAuthService: any;

  const adminUser: CustomUser = {
    id: 'u1',
    uid: 'u1',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    roles: [AccessRole.ADMIN_PAGE_ACCESS, AccessRole.ADMIN_CORE_SETTINGS],
    isDeleted: false
  };

  const standardUser: CustomUser = {
    id: 'u2',
    uid: 'u2',
    email: 'user@example.com',
    firstName: 'Regular',
    lastName: 'User',
    roles: [],
    isDeleted: false
  };

  beforeEach(() => {
    currentUserSignal = signal<CustomUser | null>(adminUser);
    mockAuthService = {
      currentUser: currentUserSignal,
      loggedUser: () => of(currentUserSignal())
    };

    TestBed.configureTestingModule({
      providers: [
        AccessRoleService,
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    service = TestBed.inject(AccessRoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return true for isAuthorizedSignal when user possesses the role', () => {
    const isAuthorized = service.isAuthorizedSignal(AccessRole.ADMIN_PAGE_ACCESS);
    expect(isAuthorized()).toBe(true);
  });

  it('should return false for isAuthorizedSignal when user does not possess the role', () => {
    currentUserSignal.set(standardUser);
    const isAuthorized = service.isAuthorizedSignal(AccessRole.ADMIN_PAGE_ACCESS);
    expect(isAuthorized()).toBe(false);
  });

  it('should return true for hasAnyRoleSignal when user has at least one requested role', () => {
    const hasRole = service.hasAnyRoleSignal([AccessRole.ADMIN_CORE_SETTINGS, AccessRole.ADMIN_PAGE_ACCESS]);
    expect(hasRole()).toBe(true);
  });

  it('should return false for hasAnyRoleSignal when user has none of the requested roles', () => {
    currentUserSignal.set(standardUser);
    const hasRole = service.hasAnyRoleSignal([AccessRole.ADMIN_PAGE_ACCESS]);
    expect(hasRole()).toBe(false);
  });

  it('should return true for async isAuthorized when user has role', async () => {
    const authorized = await service.isAuthorized(AccessRole.ADMIN_PAGE_ACCESS);
    expect(authorized).toBe(true);
  });

  it('should return false for async isAuthorized when user lacks role', async () => {
    currentUserSignal.set(standardUser);
    const authorized = await service.isAuthorized(AccessRole.ADMIN_PAGE_ACCESS);
    expect(authorized).toBe(false);
  });
});
