import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandlerFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { of, throwError } from 'rxjs';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let mockRouter: jasmine.SpyObj<Router>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockNext: HttpHandlerFn;

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockCookieService = jasmine.createSpyObj('CookieService', ['delete']);
    mockNext = jasmine.createSpy('next').and.returnValue(of(new HttpResponse({ status: 200 })));

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: CookieService, useValue: mockCookieService }
      ]
    });
  });

  it('should handle 403 error by clearing auth token and redirecting to login', (done) => {
    const request = new HttpRequest('GET', '/api/test');
    const error = new HttpErrorResponse({ status: 403, statusText: 'Forbidden' });

    (mockNext as jasmine.Spy).and.returnValue(throwError(() => error));

    authInterceptor(request, mockNext).subscribe({
      error: (err) => {
        expect(mockCookieService.delete).toHaveBeenCalledWith('auth-token');
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
        expect(err).toBe(error);
        done();
      }
    });
  });

  it('should not handle non-403 errors', (done) => {
    const request = new HttpRequest('GET', '/api/test');
    const error = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });

    (mockNext as jasmine.Spy).and.returnValue(throwError(() => error));

    authInterceptor(request, mockNext).subscribe({
      error: (err) => {
        expect(mockCookieService.delete).not.toHaveBeenCalled();
        expect(mockRouter.navigate).not.toHaveBeenCalled();
        expect(err).toBe(error);
        done();
      }
    });
  });

  it('should pass through successful responses', (done) => {
    const request = new HttpRequest('GET', '/api/test');
    const response = new HttpResponse({ status: 200, body: 'success' });

    (mockNext as jasmine.Spy).and.returnValue(of(response));

    authInterceptor(request, mockNext).subscribe({
      next: (result) => {
        expect(result).toBe(response);
        expect(mockCookieService.delete).not.toHaveBeenCalled();
        expect(mockRouter.navigate).not.toHaveBeenCalled();
        done();
      }
    });
  });
}); 