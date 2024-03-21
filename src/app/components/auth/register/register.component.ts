import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@services/auth.service';

const CANTIDAD_MINIMA_CARACTERES = 8;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})

export class RegisterComponent {

  public signupForm !: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService) { }

  ngOnInit(): void {
    this.signupForm = this.formBuilder.group({
      name:['',[Validators.required]],
      email:['',[Validators.required,Validators.email]],
      password:['',[Validators.required,Validators.minLength(CANTIDAD_MINIMA_CARACTERES)]],
    });
  }

  register(){
    if(this.signupForm.valid){
      this.authService.register(this.signupForm.value)
        .subscribe(()=>{
          this.signupForm.reset();
          this.router.navigate(['/loginlosrueda']);
        });
    }else{
      this.signupForm.markAllAsTouched();
    }
  }
}
