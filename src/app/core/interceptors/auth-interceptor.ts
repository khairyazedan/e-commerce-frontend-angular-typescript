import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/env';
import { catchError, switchMap, throwError } from 'rxjs';

const withToken = (req: HttpRequest<unknown>, token: string | null) =>
  token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const _authservice = inject(AuthService);
  const router = inject(Router)

  if (req.url.startsWith(environment.apiURL + 'auth')) {
    return next(req);
  }
  return next(withToken(req, _authservice.getToken())).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401) {
        return throwError(() => err);
      }
 
      return _authservice.refreshToken().pipe(
        // refresh itself failed (cookie expired or revoked): send the user to login
        catchError((refreshErr) => {
          _authservice.logOut();
          router.navigate(['/auth/login']);
          return throwError(() => refreshErr);
        }),
        // refresh worked: retry the original request with the new token
        switchMap((newToken) => next(withToken(req, newToken)))
      );
    })
  );
  // const token = _authservice.getToken();
  // if(token){
  //   const clone = req.clone({ 
  //     setHeaders:{
  //       Authorization: `Bearer ${token}`
  //     }
  //   })
  //   return next(clone)
  // }
  // return next(req);
};
 