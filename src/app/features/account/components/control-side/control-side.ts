import { ChangeDetectorRef, Component } from '@angular/core';
import {Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-control-side',
  styleUrl: './control-side.css',
  templateUrl: './control-side.html',
})
export class ControlSide {
  constructor(private _authservice : AuthService, private _router : Router , private _cdr: ChangeDetectorRef){}

 

  logout(){
    this._authservice.logOut()
    this._router.navigate(['/auth/login'])
    this._cdr.detectChanges()

  }
}
