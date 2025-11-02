import { Component } from '@angular/core';
import { MenuService } from '@services/menu.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Producto } from '@models/producto';
import { AlertService } from '@services/alert.service';

@Component({
  selector: 'app-editar-precios',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, RouterModule, DragDropModule],
  templateUrl: './editar-precios.component.html',
  styleUrl: './editar-precios.component.scss'
})
export class EditarPreciosComponent {

  menuCategories: any[]=[];
  products: any[]=[];
  emailUser = '';
  menuProducts: any[]=[];

  constructor(
    private menuService: MenuService,
    private authService: AuthService,
    private cookieService: CookieService,
    private alertService: AlertService,
    private router: Router){
    }

  ngOnInit(): void {
    this.getProducts();
    this.getCategories();
    this.getEmailUser();
    this.migrateProductsIfNeeded();
  }

  getProducts(){
    this.menuService.getProducts()
    .subscribe({
      next: (products)=>{
        // Filtrar productos nulos o inválidos primero
        const validProducts = products.filter((product: any) => product && product.id);

        // Ordenar productos por el campo 'orden' si existe, sino por ID
        this.products = validProducts.sort((a: any, b: any) => {
          if (a.orden !== undefined && b.orden !== undefined) {
            return a.orden - b.orden;
          }
          return a.id - b.id;
        });
      }
    })
  }

  getCategories(){
    this.menuService.consultMenu()
      .subscribe({
        next: (menu:any) =>{
          // Filtrar categorías válidas y convertir IDs a números
          this.menuCategories = Object.keys(menu)
            .filter(key => menu[key as any] && menu[key as any].title)
            .map(key => ({
              id: parseInt(menu[key as any].id.toString()),
              title: menu[key as any].title
            }));
        }
      });
  }

  logout(){
    this.authService.logout();
  }

  getEmailUser(){
    this.emailUser = this.cookieService.get('email') || '';
  }

  getCategoryName(categoryId: number): string {
    if (!categoryId || !this.menuCategories || this.menuCategories.length === 0) {
      return 'Sin categoría';
    }

    // Convertir categoryId a número si es string
    const numericCategoryId = typeof categoryId === 'string' ? parseInt(categoryId) : categoryId;

    const category = this.menuCategories.find(cat => cat?.id === numericCategoryId);
    return category?.title || 'Categoría no encontrada';
  }

  onDrop(event: CdkDragDrop<Producto[]>) {
    // Mover el elemento en el array local
    moveItemInArray(this.products, event.previousIndex, event.currentIndex);

    // Actualizar los valores de orden
    this.products.forEach((product, index) => {
      product.orden = index + 1;
    });

    // Actualizar el orden en Firebase
    this.updateProductOrder();
  }

  updateProductOrder() {
    // Actualizar cada producto con su nuevo orden
    const updatePromises = this.products.map((product, index) => {
      const updatedProduct = { ...product, orden: index + 1 };
      return this.menuService.updateProduct(updatedProduct);
    });

    // Ejecutar todas las actualizaciones
    Promise.all(updatePromises)
      .then(() => {
        this.alertService?.showAlert('Orden de productos actualizado', 2000);
        // Recargar productos para reflejar los cambios
        this.getProducts();
      })
      .catch(error => {
        this.alertService?.showAlert('Error al actualizar el orden', 3000);
      });
  }

  migrateProductsIfNeeded() {
    this.menuService.migrateProductsWithOrder()
      .then(() => {
        // Recargar productos después de la migración
        this.getProducts();
      })
      .catch(error => {
        // Error en migración de productos
      });
  }

  navigateToCreate() {
    this.router.navigate(['/crearproducto']);
  }

}
