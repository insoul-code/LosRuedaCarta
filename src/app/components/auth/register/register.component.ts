import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { CognitoService } from '@services/cognito.service';

const CANTIDAD_MINIMA_CARACTERES = 8;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})

export class RegisterComponent {
  public signupForm !: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private cognitoService: CognitoService) { }

    mostrarVerificacion:boolean = false;
    respuestaRegistro: string = '';
  ngOnInit(): void {
    this.signupForm = this.formBuilder.group({
      name:['',[Validators.required]],
      email:['',[Validators.required,Validators.email]],
      password:['',[Validators.required,Validators.minLength(CANTIDAD_MINIMA_CARACTERES)]],
      verifiCode:['']
    });
  }

  register(){
    if(this.signupForm.valid){
      this.cognitoService.signUp(
        this.signupForm.get('password')?.value,
        this.signupForm.get('email')?.value,
        this.signupForm.get('name')?.value
      )
        .then(idCognito => {
          this.respuestaRegistro = idCognito;
          this.mostrarVerificacion = true;
        })
      }else{
      this.signupForm.markAllAsTouched();
    }
  }

  confirmarRegistro(){
    this.cognitoService.confirmSignUp(
      this.signupForm.get('verifiCode')?.value,
      this.signupForm.get('email')?.value)
      .then( __ =>{
        this.router.navigate(['/loginlosrueda']);
      })
  }

  reenviarCodigo(){
    this.cognitoService.resendCode(
      this.signupForm.get('email')?.value
    )
  }
}
