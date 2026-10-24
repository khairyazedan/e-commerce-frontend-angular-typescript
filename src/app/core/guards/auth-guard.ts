import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const _authService = inject(AuthService);
  const _router = inject(Router);
  
  return _authService.checkIfLoggedIn().pipe(
    map((loggedIn) => {
      if (loggedIn) {
        return true;
      }
      return _router.createUrlTree(['/auth/login']);
    })
  )
};
  