import { Component } from '@angular/core';
import { MenuService } from '@services/menu.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { CognitoService } from '@services/cognito.service';
import { ApiAwsService } from '@services/api-aws.service';

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
  menuProducts: any[]=[];

  constructor(
    private menuService: MenuService,
    private authService: AuthService,
    private apiAwsService: ApiAwsService,
    private cookieService: CookieService,
    private cognitoService: CognitoService,
    private router: Router){
    }

  ngOnInit(): void {
    this.getProducts();
    this.getCategories();
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

  getCategories(){
    this.menuService.consultMenu()
      .subscribe({
        next: (menu:any) =>{
          this.menuCategories = menu;
        }
      });
  }

  logout(){
    this.cognitoService.signOut()
    .then(__=>{
      this.router.navigate(['/login']);
      this.cookieService.delete('accessToken');
      this.cookieService.delete('refreshToken');
      this.cookieService.delete('token');
      this.cookieService.delete('email');
    })
  }

  getEmailUser(){
    this.emailUser = this.cookieService.get('email') || '';
  }

}
