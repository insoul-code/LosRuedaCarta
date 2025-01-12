import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';


export const loggedGuard: CanActivateFn = (route, state) => {
  const cookieService = inject(CookieService);
  const router = inject(Router);
  if( !!cookieService.check('user') && JSON.parse(cookieService.get('user')).role === 'ADMIN'){
    return true;
  } else{
    router.navigateByUrl('');
    return false;
  }
};
