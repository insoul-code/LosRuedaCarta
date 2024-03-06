import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenuService } from '../../../services/menu.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { switchMap } from 'rxjs';
import { Producto } from '../../../models/producto';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-edit-page',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, RouterModule],
  templateUrl: './edit-page.component.html',
  styleUrl: './edit-page.component.scss'
})
export class EditPageComponent {


  @Input() message: string = '';

  formulario: FormGroup = this.formBuilder.group({
    id:['',[Validators.required]],
    nombreProducto:['',[Validators.required]],
    precio:['',[Validators.required]],
    descripcion:['',[Validators.required]],
    categoryId:['',[Validators.required]]
  })

  emailUser = '';

  productById: Producto = {
    id: 0,
    nombreProducto: '',
    precio: 0,
    descripcion: '',
    categoryId: 0
  };

  constructor(
    private formBuilder: FormBuilder,
    private menuService: MenuService,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
    private authService: AuthService,
    private cookieService: CookieService
  ){
  }

  ngOnInit(): void {
    this.getOneProduct();
    this.getEmailUser();
  }

  getOneProduct(){
    this.route.params.pipe(
      switchMap(param => {
        const id = +param.id;
        return this.menuService.getProductById(id);
      })
    ).subscribe({
      next: (data: any) =>{
        this.productById = data;
        this.formulario = this.formBuilder.group({
          id: this.productById?.id,
          nombreProducto: this.productById?.nombreProducto,
          precio: this.productById?.precio,
          descripcion: this.productById?.descripcion,
          categoryId: this.productById?.categoryId,
        })
      }
    });
  }

  updateProduct(){
    if(this.formulario.invalid) return;

    const prodcut:any = {
      id: this.formulario.controls['id'].value,
      nombreProducto: this.formulario.controls['nombreProducto'].value,
      precio: this.formulario.controls['precio'].value,
      descripcion: this.formulario.controls['descripcion'].value,
      categoryId: this.formulario.controls['categoryId'].value,
    }
    this.menuService.updateProduct(prodcut);
    this.alertService.showAlert("El producto se ha actualizado exitosamente", 3000);
  }

  logout(){
    this.authService.logout();
  }

  getEmailUser(){
    this.emailUser = this.cookieService.get('email') || '';
  }

}
