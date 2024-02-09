import { Component } from '@angular/core';
import { MenuService } from '../../../services/menu.service';
import { Menu } from '../../../models/menu-model';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-editar-precios',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, RouterModule],
  templateUrl: './editar-precios.component.html',
  styleUrl: './editar-precios.component.scss'
})
export class EditarPreciosComponent {

  menuCategories: any[]=[];
  products: any[]=[];
  emailUser = '';

  constructor(
    private menuService: MenuService,
    private authService: AuthService,
    private cookieService: CookieService){
    }

    ngOnInit(): void {
      this.getProducts();
      this.getCategories();
      this.getEmailUser();
    }

  getProducts(){
    this.menuService.getProducts()
    .subscribe({
      next: (products)=>{
        this.products = products;
      }
    })
  }

  getCategories(){
    this.menuService.consultMenu()
      .subscribe({
        next: (menu:any) =>{
          this.menuCategories = menu;
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
