import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
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
      const {email,password} = this.loginForm.value;
      this.authService.login(email,password)
        .subscribe(res=>{
          if(res.length){
            this.loginForm.reset();
            this.cookieService.set('token','logueado');
            this.cookieService.set('email',email);
            this.router.navigate(['/precios']);
          }else{
            this.loginForm.reset();
            this.showAlert = true;
            this.errorMsg = 'Usuario no se encuentra registrado';
            setTimeout(()=>{this.showAlert = false},3000);
          }
        });
    }else{
      this.loginForm.markAllAsTouched();
    }
  }
}
