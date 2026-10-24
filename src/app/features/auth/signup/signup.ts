import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { passwordValidator } from '../../../core/validators/password.validator';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  imports: [RouterLink, ReactiveFormsModule],
  selector: 'app-signup',
  styleUrl: './signup.css',
  templateUrl: './signup.html',
})
export class Signup implements OnInit {
  private _router = inject(Router);
  constructor(private _authService : AuthService, _cdr:ChangeDetectorRef){}
  signupForm : FormGroup = new FormGroup({
    userName: new FormControl('', [
      Validators.required,
      Validators.maxLength(10),
      Validators.minLength(3),
    ]),
    password: new FormControl('', [Validators.required, passwordValidator.strongPassword()]),
    retypePassword: new FormControl('', [Validators.required, passwordValidator.PasswordMatch()]),
    email: new FormControl('', [
      Validators.required,
      Validators.pattern(
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,
      ),
    ]),
  })



  ngOnInit(): void {

    this.signupForm.get('password')?.valueChanges.subscribe(()=>{
      this.signupForm.get('retypePassword')?.updateValueAndValidity();
    })

    

    
  }

  submit(){ 
    
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }
    const { userName, email, password } = this.signupForm.value;

  this._authService.sigupUser({ userName, email, password }).subscribe({
    next: () => this._router.navigate(['/auth/login']),
    error: (err) => console.log(err.error),
  });
    
  }
} 
