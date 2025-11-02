import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MenuService } from '@services/menu.service';
import { Menu } from '@models/menu-model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-carta',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule, CommonModule],
  templateUrl: './carta.component.html',
  styleUrl: './carta.component.scss'
})
export class CartaComponent {

  menuCategories: any[]=[];
  products: any[]=[];
  menuProducts: any[]=[];
  categories: any[] = [];
  groupedProducts: { title: string, products: any[] }[] = [];

  getClass(index: number): string {
    const classes = ['yellow-text', 'green-text', 'red-text'];
    return classes[index % classes.length];
  }

  constructor(
    private menuService: MenuService,
  ) { }

  ngOnInit(): void {
    this.getMenu();
    this.getProducts();
    forkJoin({
      categories: this.menuService.consultMenu(),
      products: this.menuService.getProducts()
    }).subscribe(({ categories, products }) => {
      // Procesar categorías para manejar estructura no secuencial de Firebase
      this.categories = Object.keys(categories)
        .filter(key => categories[key as any] && categories[key as any].title)
        .map(key => ({
          id: parseInt(categories[key as any].id.toString()),
          title: categories[key as any].title,
          productos: []
        }));

      // Filtrar productos nulos o inválidos
      this.products = products.filter((product: any) => product && product.id);
      this.groupProductsByCategory();
    });
  }

  ngAfterViewInit(): void{
    this.getProducts();
  }

  groupProductsByCategory() {
    this.groupedProducts = this.categories.map(category => {
      const productsInCategory = this.products.filter(product => {
        // Convertir categoryId a número si es string para comparación
        const productCategoryId = typeof product?.categoryId === 'string' ? parseInt(product.categoryId) : product?.categoryId;
        return productCategoryId === category.id;
      });

      // Ordenar productos por el campo 'orden' si existe, sino por ID
      const sortedProducts = productsInCategory.sort((a: any, b: any) => {
        if (a.orden !== undefined && b.orden !== undefined) {
          return a.orden - b.orden;
        }
        return a.id - b.id;
      });

      return {
        title: category.title,
        products: sortedProducts
      };
    });
  }

  getMenu(){
    this.menuService.consultMenu()
      .subscribe({
        next: (menu:Menu[]) =>{
          this.menuCategories = menu;
        }
      });
  }

  getProducts(){
    this.menuService.getProducts()
    .subscribe({
      next: (products)=>{
        // Filtrar productos nulos o inválidos
        this.products = products.filter((product: any) => product && product.id);
      }
    })
  }
}
