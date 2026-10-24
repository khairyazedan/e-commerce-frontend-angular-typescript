import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.checkIfLoggedIn().pipe(
    map((isLoggedIn) => {
      if (!isLoggedIn) {
        return true; // Allow access to login/register if not logged in
      }
      return router.createUrlTree(['/']); // Redirect away if already logged in
    })
  );
};
