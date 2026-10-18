import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { authenticatedGuard } from './authenticatedGuard';
import { AuthService } from '../auth/auth.service';
import { of, firstValueFrom } from 'rxjs';
import { RedirectionEnum } from '../../../utils/redirection.enum';

describe('authenticatedGuard', () => {
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    });
  });

  it('should allow navigation when user is authenticated', async () => {
    mockAuthService.isAuthenticated.and.returnValue(of(true));

    const result$ = TestBed.runInInjectionContext(() => authenticatedGuard({} as ActivatedRouteSnapshot, {} as any));
    const result = await firstValueFrom(result$ as any);

    expect(result).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to LOGIN when user is not authenticated', async () => {
    mockAuthService.isAuthenticated.and.returnValue(of(false));

    const result$ = TestBed.runInInjectionContext(() => authenticatedGuard({} as ActivatedRouteSnapshot, {} as any));
    const result = await firstValueFrom(result$ as any);

    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith([RedirectionEnum.LOGIN]);
  });
});
