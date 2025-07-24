import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenuService } from '@services/menu.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { switchMap } from 'rxjs';
import { Product } from '@models/product';
import { AlertService } from '@services/alert.service';
import { AuthService } from '@services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import Swal from 'sweetalert2';
import { ApiAwsService } from '@services/api-aws.service';

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
  productId:number = 0;
  products: any[]=[];
  productById: Product = {
    id: 0,
    name: '',
    price: 0,
    description: '',
    category: 0
  };

  productByIdDbJson: any[]=[];

  constructor(
    private formBuilder: FormBuilder,
    private menuService: MenuService,
    private apiAwsService: ApiAwsService,
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

  getProducts(){
    this.apiAwsService.getProducts()
    .subscribe({
      next: (products)=>{
        this.products = products;
      }
    })
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
          nombreProducto: this.productById?.name,
          precio: this.productById?.price,
          descripcion: this.productById?.description,
          categoryId: this.productById?.category,
        })
        this.productId = data.id;
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

  deleteProduct() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás deshacer esta acción.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        const getProductId = this.productId;
        this.menuService.deleteProduct(getProductId)
          .then(() => {
            this.alertService.showAlert("El producto se ha eliminado correctamente", 3000);
            this.getProducts();
            this.router.navigate(['/precios']);
          })
          .catch(error => {
            console.error("Error al eliminar el producto:", error);
          });
      }
    });
  }


  logout(){
    this.authService.logout();
  }

  getEmailUser(){
    this.emailUser = this.cookieService.get('email') || '';
  }

}
