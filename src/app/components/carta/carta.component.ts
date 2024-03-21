import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MenuService } from '@services/menu.service';
import { Menu } from '@models/menu-model';

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
    this.getProductDbJson();
  }

  ngAfterViewInit(): void{
    this.getProducts();
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

  getProductDbJson(){
    this.menuService.getMenuDbJson()
    .subscribe({
      next: (menuResponse)=>{
        this.menuProducts = menuResponse;
      }
    })
  }
}
