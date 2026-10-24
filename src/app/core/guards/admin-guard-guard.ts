import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const adminGuardGuard: CanActivateFn = (route, state) => {
  const _authservices = inject(AuthService);
  const _router = inject(Router);

  return _authservices.checkIfLoggedInWithRole('admin').pipe(
    map((isAdmin) => {
      if (isAdmin) {
        return true;
      }
      return _router.createUrlTree(['/auth/login']);
    })
  );

  // if(_authservices.checkIfLoggedInWithRole('admin')){
  //   return true;
  // }else{
  //   _router.navigate(['/login'])
  //   return false;
  // }
}; 
