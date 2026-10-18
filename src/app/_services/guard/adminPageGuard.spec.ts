import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { adminPageGuard } from './adminPageGuard';
import { AccessRoleService } from '../auth/access-role.service';
import { AccessRole } from '../../_models/user/access-role';
import { RedirectionEnum } from '../../../utils/redirection.enum';
import { firstValueFrom } from 'rxjs';

describe('adminPageGuard', () => {
  let mockAccessRoleService: jasmine.SpyObj<AccessRoleService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockAccessRoleService = jasmine.createSpyObj('AccessRoleService', ['isAuthorized']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AccessRoleService, useValue: mockAccessRoleService },
        { provide: Router, useValue: mockRouter }
      ]
    });
  });

  it('should allow access when user is authorized for ADMIN_PAGE_ACCESS', async () => {
    mockAccessRoleService.isAuthorized.and.returnValue(Promise.resolve(true));

    const result$ = TestBed.runInInjectionContext(() => adminPageGuard({} as ActivatedRouteSnapshot, {} as any));
    const result = await firstValueFrom(result$ as any);

    expect(result).toBe(true);
    expect(mockAccessRoleService.isAuthorized).toHaveBeenCalledWith(AccessRole.ADMIN_PAGE_ACCESS);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to HOME when user is not authorized for ADMIN_PAGE_ACCESS', async () => {
    mockAccessRoleService.isAuthorized.and.returnValue(Promise.resolve(false));

    const result$ = TestBed.runInInjectionContext(() => adminPageGuard({} as ActivatedRouteSnapshot, {} as any));
    const result = await firstValueFrom(result$ as any);

    expect(result).toBe(false);
    expect(mockAccessRoleService.isAuthorized).toHaveBeenCalledWith(AccessRole.ADMIN_PAGE_ACCESS);
    expect(mockRouter.navigate).toHaveBeenCalledWith([RedirectionEnum.HOME]);
  });
});
