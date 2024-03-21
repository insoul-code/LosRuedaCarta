import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  EMAIL_EXAMPLE=' mail@mail.com';
  public loginForm!: FormGroup;
  showAlert: boolean = false;
  errorMsg = '';
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private cookieService: CookieService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email:['',[Validators.required,Validators.email]],
      password:['',[Validators.required]]
    });
  }

  login() {
    if(this.loginForm.valid){
      const email = this.loginForm.get('email')?.value.toLowerCase();
      const password = this.loginForm.get('password')?.value;
      this.authService.login(email, password)
      .subscribe((users)=>{
        const matchingUserKeys = Object.entries(users).find(([key, user]) => {
          return user.email.toLowerCase() === email && user.password === password;
        });
        if (matchingUserKeys) {
          this.cookieService.set('token','logueado');
          this.cookieService.set('email', email);
          this.router.navigate(['/precios']);
        }else{
          this.loginForm.reset();
          this.showAlert = true;
          this.errorMsg = 'El correo ingresado no se encuentra registrado';
          setTimeout(()=>{this.showAlert = false},3000);
        }
        });
    }else{
      this.loginForm.markAllAsTouched();
    }
  }

  get emailField() {
    return this.loginForm.get('email');
  }

  get isEmailFieldInvalid() {
    return this.emailField?.touched && this.emailField?.invalid;
  }

  get passwordField() {
    return this.loginForm.get('password');
  }

  get isPasswordFieldInvalid() {
    return this.passwordField?.touched && this.passwordField?.invalid;
  }

}
