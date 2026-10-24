import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-control-sidebar',
  styleUrl: './control-sidebar.css',
  templateUrl: './control-sidebar.html',
})
export class ControlSidebar {
  constructor(private _authservice : AuthService, private _router : Router , private _cdr: ChangeDetectorRef){}

 

  logout(){
    this._authservice.logOut()
    this._router.navigate(['/auth/login'])
    this._cdr.detectChanges()

  }
}
 