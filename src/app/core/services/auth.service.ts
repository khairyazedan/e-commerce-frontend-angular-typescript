import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Router } from '@angular/router';
import {
  ILoginData,
  ILoginResponse,
  IRefreshResponse,
  ISignupUser,
  ISignupUserResponse,
  IToken,
} from '../models/auth.model';
import { environment } from '../../../environments/env';
import { BehaviorSubject, catchError, finalize, map, Observable, of, shareReplay, tap } from 'rxjs';
import { HotToastService } from '@ngxpert/hot-toast';
import { jwtDecode } from 'jwt-decode';

@Service()
export class AuthService {
  private _httpClient = inject(HttpClient);
  private _apiURL = environment.apiURL + 'auth';
  private _router = inject(Router);
  // private toast = inject(HotToastService)
  private userData = new BehaviorSubject<IToken | null>(null);
  private refreshInFlight$: Observable<string> | null = null;

  getUserData() {
    return this.userData.asObservable();
  }

  checkIfLoggedIn(): Observable<boolean> {
    const token = this.getToken();
    if (token && !this.isExpired(token)) {
      this.userData.next(this.decodeToken(token));
      return of(true);
    }

    // Only try the refresh if this browser had a session before.
        if (!localStorage.getItem(this.sessionKey)) {
            this.clearSession();
            return of(false);
        }
    return this.refreshToken().pipe(
      map(() => true),
      catchError(() => {
        this.clearSession();
        return of(false);
      }),
    );
  }

  checkIfLoggedInWithRole(role: string): Observable<boolean> {
    return this.checkIfLoggedIn().pipe(
      map((loggedIn) => loggedIn && this.userData.value?.role === role),
    );
  }

  logOut(){
    this._httpClient
      .post(this._apiURL + '/logout', {}, { withCredentials: true })
      .pipe(catchError(() => of(null)))
      .subscribe();
    this.clearSession();
  }

  private clearSession() {
    this.deleteToken();
    this.userData.next(null);
  }

  sigupUser(userData: ISignupUser) {
    return this._httpClient.post(this._apiURL, userData);
  }

  login(data: ILoginData) {
    return this._httpClient
      .post<ILoginResponse>(this._apiURL + '/login', data, { withCredentials: true })
      .pipe(
        tap((res) => {
          const userInfo = this.applyToken(res.accessToken);
          if (!userInfo) {
            throw new Error('Invalid token received');
          }
        //   this._router.navigateByUrl(userInfo.role === 'admin' ? '/admin/overview' : '/');
          if (userInfo) {
            if (userInfo.role === 'admin') {
                
              this._router.navigate(['/admin/overview']);
            } else {
              this._router.navigate(['/']);
            }
          }
 
          console.log('from servise', res);
        }),
      );
  }

  refreshToken(): Observable<string> {
    if (!this.refreshInFlight$) {
      this.refreshInFlight$ = this._httpClient
        .post<IRefreshResponse>(this._apiURL + '/refresh', {}, { withCredentials: true })
        .pipe(
          map((res) => {
            if (!res.accessToken || !this.applyToken(res.accessToken)) {
              throw new Error('Refresh failed');
            }
            return res.accessToken;
          }),
          finalize(() => (this.refreshInFlight$ = null)),
          shareReplay(1),
        );
    }
    return this.refreshInFlight$;
  }

  private applyToken(token: string): IToken | null {
    const userInfo = this.decodeToken(token);
    if (userInfo) {
      this.saveToken(token);
      this.userData.next(userInfo);
    }
    return userInfo;
  }

  private isExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    return !decoded?.exp || Date.now() >= decoded.exp * 1000;
  }

  private tokenKey = 'token';
  private sessionKey = 'hasSession'; 
  private saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.sessionKey, '1');
  }
  private deleteToken() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.sessionKey);
  }
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  decodeToken(token: string): IToken | null {
    try {
      return jwtDecode<IToken>(token);
    } catch (error) {
      return null;
    }
  }
}
