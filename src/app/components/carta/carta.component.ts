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
      this.categories = categories.map(category => ({
        id: category?.id,
        title: category?.title,
        productos: []
      }));
      console.log('Categorias', categories);

      this.products = products;
      this.groupProductsByCategory();
      console.log('Grouped Products:', this.groupedProducts);
    });
  }

  ngAfterViewInit(): void{
    this.getProducts();
  }

  groupProductsByCategory() {
    this.groupedProducts = this.categories.map(category => {
      const productsInCategory = this.products.filter(product => product?.categoryId == category.id);
      return {
        title: category.title,
        products: productsInCategory
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
        this.products = products;
      }
    })
  }
}
