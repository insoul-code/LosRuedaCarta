import { Component, OnInit } from '@angular/core';
import { MenuService } from '@services/menu.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { Menu } from '@models/menu-model';

@Component({
  selector: 'app-editar-categorias',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, RouterModule],
  templateUrl: './editar-categorias.component.html',
  styleUrl: './editar-categorias.component.scss'
})
export class EditarCategoriasComponent implements OnInit {

  menuCategories: Menu[] = [];
  emailUser = '';

  constructor(
    private menuService: MenuService,
    private authService: AuthService,
    private cookieService: CookieService,
    private router: Router){
    }

  ngOnInit(): void {
    this.getCategories();
    this.getEmailUser();
  }

  getCategories(){
    this.menuService.consultMenu()
      .subscribe({
        next: (categorias: any) =>{
          // Firebase puede devolver un objeto con claves numéricas en lugar de un array
          if (Array.isArray(categorias)) {
            this.menuCategories = categorias;
          } else if (categorias && typeof categorias === 'object') {
            // Convertir objeto a array
            this.menuCategories = Object.keys(categorias).map(key => {
              const categoria = categorias[key];
              const categoriaConId = {
                ...categoria,
                id: parseInt(key) // Usar la clave como ID y convertir a número
              };
              return categoriaConId;
            });
          } else {
            this.menuCategories = [];
          }
        },
        error: (error) => {
          // Error al cargar categorías
        }
      });
  }

  logout(){
    this.authService.logout();
  }

  getEmailUser(){
    this.emailUser = this.cookieService.get('email') || '';
  }

  navigateToCreate() {
    this.router.navigate(['/crearcategoria']);
  }

  navigateToEdit(categoriaId: number | undefined) {
    if (categoriaId) {
      this.router.navigate(['/editarcategoria', categoriaId]);
    }
  }

}
