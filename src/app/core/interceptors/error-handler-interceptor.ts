import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HotToastService } from '@ngxpert/hot-toast';
import { catchError, throwError } from 'rxjs';

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const _router = inject(Router);
  const toast = inject(HotToastService);
  return next(req).pipe(catchError((error)=>{
    console.log(error);
    if(error.status === 401){
      toast.warning('you are unauthorized to reach this route');
      // alert("unauthorized");
      // show unauthorized message
      _router.navigate(['/login'])
    }else if(error.status === 403){
      toast.warning('access denied');

      // show access denied
      // alert("access denied");
      _router.navigate(['/login'])
    }else if(error.status === 404){
      toast.warning('the route you tried to reach is not found');
      // not found error
      _router.navigate(['/not-found'])
    }else if(error.status === 429){
      toast.warning('Too many attempets to login. Try again later.');
      // _router.navigate(['/not-found'])
    }else if(error.status === 500){
      toast.error('Sorry, Unexpeted error occure try again later.');
      // show internal sever error
      // alert("server error");
      // console.log(error.error?.message);
      
    }
    return throwError(()=>error)
  }));
};
