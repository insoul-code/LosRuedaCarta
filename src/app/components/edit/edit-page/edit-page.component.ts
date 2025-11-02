import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenuService } from '@services/menu.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { switchMap } from 'rxjs';
import { Producto } from '@models/producto';
import { AlertService } from '@services/alert.service';
import { AuthService } from '@services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import Swal from 'sweetalert2';

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
    id:[''],
    nombreProducto:['',[Validators.required]],
    precio:['',[Validators.required]],
    descripcion:[''], // Descripción opcional
    categoryId:['',[Validators.required]]
  })

  emailUser = '';
  productId:number = 0;
  products: any[]=[];
  categories: any[]=[];
  isCreating: boolean = false;
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
    this.getEmailUser();
    this.getCategories();

    // Verificar si es creación o edición
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isCreating = false;
        this.getOneProduct();
      } else {
        this.isCreating = true;
        this.initializeFormForCreation();
      }
    });
  }

  getProducts(){
    this.menuService.getProducts()
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

        // Asegurar que categoryId sea un número
        const categoryId = typeof data.categoryId === 'string' ? parseInt(data.categoryId) : data.categoryId;

        this.formulario = this.formBuilder.group({
          id: this.productById?.id,
          nombreProducto: this.productById?.nombreProducto,
          precio: this.productById?.precio,
          descripcion: this.productById?.descripcion || '', // Descripción opcional
          categoryId: categoryId,
        })
        this.productId = data.id;
      }
    });
  }

  updateProduct(){
    if(this.formulario.invalid) return;

    const product:any = {
      id: this.formulario.controls['id'].value,
      nombreProducto: this.formulario.controls['nombreProducto'].value,
      precio: this.formulario.controls['precio'].value,
      descripcion: this.formulario.controls['descripcion'].value,
      categoryId: this.formulario.controls['categoryId'].value,
    }

    this.menuService.updateProduct(product).then(() => {
      this.alertService.showAlert("El producto se ha actualizado exitosamente", 3000);
      this.router.navigate(['/precios']);
    }).catch(error => {
      this.alertService.showAlert("Error al actualizar el producto", 3000);
    });
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
            // Error al eliminar el producto
          });
      }
    });
  }


  logout(){
    this.authService.logout();
  }

  navigateBack(){
    this.router.navigate(['/precios']);
  }

  getEmailUser(){
    this.emailUser = this.cookieService.get('email') || '';
  }

  getCategories(){
    this.menuService.consultMenu()
      .subscribe({
        next: (menu:any) =>{
          // Filtrar categorías válidas y convertir IDs a números
          this.categories = Object.keys(menu)
            .filter(key => menu[key as any] && menu[key as any].title)
            .map(key => ({
              id: parseInt(menu[key as any].id.toString()),
              title: menu[key as any].title
            }));
        }
      });
  }

  initializeFormForCreation() {
    this.formulario = this.formBuilder.group({
      id: [''], // No se necesita para creación
      nombreProducto: ['', [Validators.required]],
      precio: ['', [Validators.required, Validators.min(0)]],
      descripcion: [''], // Descripción opcional
      categoryId: ['', [Validators.required]]
    });
  }

  createProduct() {

    // Marcar todos los campos como tocados para mostrar errores
    this.formulario.markAllAsTouched();

    if (this.formulario.invalid) {
      this.alertService.showAlert("Por favor, complete todos los campos requeridos", 3000);
      return;
    }

    const productData = {
      nombreProducto: this.formulario.controls['nombreProducto'].value,
      precio: this.formulario.controls['precio'].value,
      descripcion: this.formulario.controls['descripcion'].value,
      categoryId: this.formulario.controls['categoryId'].value,
    };


    this.menuService.createProduct(productData).subscribe({
      next: (response) => {
        this.alertService.showAlert("El producto se ha creado exitosamente", 3000);
        this.router.navigate(['/precios']);
      },
      error: (error) => {
        this.alertService.showAlert("Error al crear el producto", 3000);
      }
    });
  }

}
