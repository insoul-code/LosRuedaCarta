import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { CognitoService } from '@services/cognito.service';
import Swal from 'sweetalert2';

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
  mostrarVerificacion:boolean = false;
  mostrarRecovery:boolean = false;
  mostrarRecoveryPass:boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private cookieService: CookieService,
    private cognitoService: CognitoService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email:['',[Validators.required,Validators.email]],
      password:['',[Validators.required]],
      verifiCode:[''],
      resetPassword:['',[Validators.email]],
      codigoResetPass:[''],
      newPass:[''],
      newPassConfirm:['']
    });
  }

  login() {
    if(this.loginForm.valid){
      this.cognitoService.signIn(
        this.loginForm.get('password')?.value,
        this.loginForm.get('email')?.value,
      ).then(respuestaLogin =>{
        this.cookieService.set('email', this.loginForm.get('email')?.value);
        this.cognitoService.getUser().then(respuestaGetUser=>{
          this.cookieService.set('user',JSON.stringify(respuestaGetUser));
          if(respuestaGetUser.role === 'ADMIN'){
            this.router.navigate(['/precios']);
          }else{
            this.router.navigate(['']);
          }
        })
      }).catch(error=>{
        if(error.message === 'NotAuthorizedException'){
          this.showAlert = true;
          this.errorMsg = 'Correo o contraseña invalidos';
        }else if(error.message === 'UserNotConfirmedException'){
          this.mostrarVerificacion = true;
          this.cognitoService.resendCode(
            this.loginForm.get('email')?.value
          )
        }
      })
    }else{
      this.loginForm.markAllAsTouched();
    }
  }

  confirmarRegistro(){
    this.cognitoService.confirmSignUp(
      this.loginForm.get('verifiCode')?.value,
      this.loginForm.get('email')?.value)
      .then( __ =>{
        this.cookieService.set('token','logueado');
        this.cookieService.set('email', this.loginForm.get('email')?.value);
        this.router.navigate(['/precios']);
      }).catch(error=>{
        if(error.message === 'CodeMismatchException'){
          this.showAlert = true;
          this.errorMsg = 'El codigo ingresado no es valido';
        }
      })
  }

  reenviarCodigo(){
    this.cognitoService.resendCode(
      this.loginForm.get('email')?.value
    )
  }

  mostrarRecueprar(){
    this.mostrarRecovery = true;
  }

  codigoRecuperarContrasena(){
    this.cognitoService.resetCodePassword(
      this.loginForm.get('resetPassword')?.value
    )
    this.mostrarRecoveryPass = true;
  }

  confirmacionRecuperarContrasena(){
    this.cognitoService.resetConfirmationPassword(
      this.loginForm.get('resetPassword')?.value,
      this.loginForm.get('codigoResetPass')?.value,
      this.loginForm.get('newPass')?.value
    ).then((_) =>{
      this.mostrarRecoveryPass = false;
      this.mostrarRecovery = false;
    }).catch((error) =>{
      Swal.fire({
        title: 'Ha ocurrido un error',
        text: error,
        icon: 'warning',
        showCancelButton: true
      })
    })


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
