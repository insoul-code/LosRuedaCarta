import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

export const httpInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next:HttpHandlerFn) => {
  const cookieService = inject(CookieService);
  const accessToken = cookieService.get('idToken');
  const modifiedReq = req.clone({
    setHeaders: {
      'Authorization': accessToken
    }
  });

  return next(modifiedReq);
};
