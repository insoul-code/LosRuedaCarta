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
          console.log('📋 Categorías cargadas (raw):', categorias);

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
              console.log(`🔍 Categoría procesada: ID=${categoriaConId.id} (${typeof categoriaConId.id}), Título=${categoriaConId.title}`);
              return categoriaConId;
            });
          } else {
            this.menuCategories = [];
          }

          console.log('📋 Categorías procesadas para la tabla:', this.menuCategories);
          console.log('📊 Número de categorías:', this.menuCategories.length);
        },
        error: (error) => {
          console.error('❌ Error al cargar categorías:', error);
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
    console.log('🔄 Navegando a crear categoría');
    this.router.navigate(['/crearcategoria']);
  }

  navigateToEdit(categoriaId: number | undefined) {
    console.log('🔄 CLICK EN BOTÓN EDITAR');
    console.log('📊 ID recibido:', categoriaId);
    console.log('📊 Tipo de ID:', typeof categoriaId);
    console.log('📊 Es válido:', !!categoriaId);

    if (categoriaId) {
      console.log('✅ ID válido, navegando a editar categoría con ID:', categoriaId);
      console.log('🔄 Ruta de destino: /editarcategoria/' + categoriaId);

      // Verificar el estado actual del router
      console.log('📍 URL actual:', this.router.url);

      this.router.navigate(['/editarcategoria', categoriaId]).then(
        (success) => {
          console.log('✅ Navegación exitosa:', success);
          console.log('📍 Nueva URL:', this.router.url);
        },
        (error) => {
          console.error('❌ Error en navegación:', error);
        }
      );
    } else {
      console.error('❌ ID de categoría no válido:', categoriaId);
    }
  }

}
