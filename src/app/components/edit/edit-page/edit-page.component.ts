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

  productByIdDbJson: any[]=[];

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
        console.log('Producto cargado:', this.productById);
        console.log('CategoryId procesado:', categoryId);
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
      console.error('Error al actualizar el producto:', error);
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
            console.error("Error al eliminar el producto:", error);
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
          console.log('Categorías cargadas en edit-page:', this.categories);
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
    console.log('Formulario inicializado para creación');
  }

  createProduct() {
    console.log('Formulario válido:', this.formulario.valid);
    console.log('Errores del formulario:', this.formulario.errors);
    console.log('Valores del formulario:', this.formulario.value);

    // Marcar todos los campos como tocados para mostrar errores
    this.formulario.markAllAsTouched();

    if (this.formulario.invalid) {
      console.log('Formulario inválido, no se puede crear el producto');
      console.log('Errores por campo:');
      Object.keys(this.formulario.controls).forEach(key => {
        const control = this.formulario.get(key);
        if (control && control.errors) {
          console.log(`${key}:`, control.errors);
        }
      });
      this.alertService.showAlert("Por favor, complete todos los campos requeridos", 3000);
      return;
    }

    const productData = {
      nombreProducto: this.formulario.controls['nombreProducto'].value,
      precio: this.formulario.controls['precio'].value,
      descripcion: this.formulario.controls['descripcion'].value,
      categoryId: this.formulario.controls['categoryId'].value,
    };

    console.log('Datos del producto a crear:', productData);

    this.menuService.createProduct(productData).subscribe({
      next: (response) => {
        console.log('Producto creado exitosamente:', response);
        this.alertService.showAlert("El producto se ha creado exitosamente", 3000);
        this.router.navigate(['/precios']);
      },
      error: (error) => {
        console.error('Error al crear el producto:', error);
        this.alertService.showAlert("Error al crear el producto", 3000);
      }
    });
  }

}
