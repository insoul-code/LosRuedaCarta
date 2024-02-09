import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../services/menu.service';
import { Menu } from '../../models/menu-model';

@Component({
  selector: 'app-carta',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule, CommonModule],
  templateUrl: './carta.component.html',
  styleUrl: './carta.component.scss'
})
export class CartaComponent {
  menuItems: Menu[] = [{
    id: 0,
    tituloProducto: '',
    productos: [{
      id: 0,
      nombreProducto: '',
      precio: 0,
      descripcion: '',
      categoryId: 0
    }]
  }];
  menuCategories: any[]=[];
  products: any[]=[];

  constructor(
    private menuService: MenuService,
  ) { }

  ngOnInit(): void {
    this.getMenu();
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
}