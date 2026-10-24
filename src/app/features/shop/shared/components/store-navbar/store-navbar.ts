import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../../../core/services/auth.service';
import { IToken } from '../../../../../core/models/auth.model';

import { Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-store-navbar',
  styleUrl: './store-navbar.css',
  templateUrl: './store-navbar.html',
})
export class StoreNavbar implements OnInit{
  private _authService = inject(AuthService);
  private _cdr = inject(ChangeDetectorRef);
  private _sub?: Subscription

  user: IToken | null = null
  accountLink = '/account/profile';

  ngOnInit(): void {
    this._authService.getUserData().subscribe((user)=>{
      this.user = user;
      this.accountLink = user?.role === 'admin' ? '/admin' : '/account/profile';
      this._cdr.markForCheck();
    })
  }

  ngOnDestroy() {
    this._sub?.unsubscribe();          
  }
} 
