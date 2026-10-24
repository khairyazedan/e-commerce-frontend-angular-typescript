import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ILoginData } from '../../../core/models/auth.model';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  imports: [RouterLink, ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  constructor(private _authservice: AuthService, private toast: HotToastService) {}

  loginForm = new FormGroup({
    email: new FormControl('',  [
      Validators.required,
      Validators.pattern(
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,
      ),
    ]),
    password: new FormControl(''),
  });

  onSubmit(){
    // this.loginForm.value as ILoginData 
    this._authservice.login(this.loginForm.value as ILoginData).subscribe({
      next:()=>{
        this.toast.success('User login Successfully!');
        
      }, error:()=>{
        
        // this.toast.error('Error while trying to login please try again');
        
      }

    })
    
  }
}
