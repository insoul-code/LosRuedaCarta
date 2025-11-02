import { Component, OnInit } from '@angular/core';
import { MenuService } from '@services/menu.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { Menu } from '@models/menu-model';

@Component({
  selector: 'app-editar-categoria',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, RouterModule],
  templateUrl: './editar-categoria.component.html',
  styleUrl: './editar-categoria.component.scss'
})
export class EditarCategoriaComponent implements OnInit {

  categoriaForm: FormGroup;
  categoria: Menu | null = null;
  categoriaId: number = 0;
  emailUser = '';
  isLoading = false;
  isCreating: boolean = false;

  constructor(
    private menuService: MenuService,
    private authService: AuthService,
    private cookieService: CookieService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ){
    this.categoriaForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(2)]]
    });

    // Inicializar con valores por defecto seguros
    this.categoria = null;
    this.categoriaId = 0;
    this.isLoading = false;
  }

  ngOnInit(): void {
    this.getEmailUser();

    // Verificar si es creación o edición
    this.route.params.subscribe(params => {

      if (params['id']) {
        this.isCreating = false;
        const id = +params['id'];

        if (id && !isNaN(id)) {
          this.categoriaId = id;
          this.loadCategoria();
        } else {
          this.router.navigate(['/editarcategorias']);
        }
      } else {
        // No hay ID, es modo creación
        this.isCreating = true;
        this.initializeFormForCreation();
      }
    });
  }

        loadCategoria() {
    this.isLoading = true;

    // NUEVA ESTRATEGIA: Ir directamente a buscar en la lista completa
    // porque Firebase está devolviendo categorías por posición, no por ID
    this.buscarEnListaCompleta();
  }

    private buscarEnListaCompleta() {
    this.menuService.consultMenu().subscribe({
      next: (categorias: any) => {
        // Firebase devuelve un objeto con claves numéricas, no un array
        let categoriasArray: Menu[] = [];

        if (Array.isArray(categorias)) {
          categoriasArray = categorias;
        } else if (categorias && typeof categorias === 'object') {
          // Convertir objeto a array manteniendo el ID original
          categoriasArray = Object.keys(categorias).map(key => {
            const categoria = categorias[key];
            const categoriaConId = {
              ...categoria,
              id: parseInt(key) // Usar la clave como ID
            };
            return categoriaConId;
          });
        }

        const categoriaEncontrada = categoriasArray.find(cat => {
          return cat && cat.id == this.categoriaId;
        });

        if (categoriaEncontrada) {
          this.categoria = categoriaEncontrada;

          this.categoriaForm.patchValue({
            title: this.categoria.title
          });
        } else {
          // Redirigir a la lista si no se encuentra la categoría
          this.router.navigate(['/editarcategorias']);
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        // Redirigir a la lista en caso de error
        this.router.navigate(['/editarcategorias']);
      }
    });
  }

  onSubmit() {
    // Verificar si es creación o edición
    if (this.isCreating) {
      this.createCategory();
    } else {
      this.updateCategory();
    }
  }

  updateCategory() {
    // Verificación adicional de seguridad
    if (!this.categoria || !this.categoria.id) {
      this.router.navigate(['/editarcategorias']);
      return;
    }

    if (!this.categoriaForm.valid) {
      return;
    }

    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    const categoriaActualizada: Menu = {
      id: this.categoria.id, // Asegurar que el ID sea el correcto
      title: this.categoriaForm.value.title,
      productos: this.categoria.productos || [] // Mantener los productos existentes
    };

    this.menuService.updateCategory(categoriaActualizada).subscribe({
      next: () => {
        this.router.navigate(['/editarcategorias']);
      },
      error: (error) => {
        this.isLoading = false;
      }
    });
  }

  createCategory() {

    // Marcar todos los campos como tocados para mostrar errores
    this.categoriaForm.markAllAsTouched();

    if (this.categoriaForm.invalid) {
      return;
    }

    if (this.isLoading) {
      return;
    }
    this.isLoading = true;

    const newCategory = {
      title: this.categoriaForm.value.title,
      productos: []
    };

    this.menuService.createCategory(newCategory).subscribe({
      next: (response) => {
        this.router.navigate(['/editarcategorias']);
      },
      error: (error) => {
        this.isLoading = false;
      }
    });
  }

  initializeFormForCreation() {
    this.categoriaForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  cancelar() {
    this.router.navigate(['/editarcategorias']);
  }

  confirmarEliminacion() {
    if (!this.categoria || !this.categoria.id) {
      return;
    }

    const confirmacion = confirm(
      `¿Estás seguro de que quieres eliminar la categoría "${this.categoria.title}"?\n\n` +
      'Esta acción no se puede deshacer.'
    );

    if (confirmacion) {
      this.eliminarCategoria();
    }
  }

  eliminarCategoria() {
    if (!this.categoria || !this.categoria.id) {
      return;
    }

    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    this.menuService.deleteCategory(this.categoria.id).then(() => {
      this.router.navigate(['/editarcategorias']);
    }).catch((error) => {
      this.isLoading = false;
    });
  }

  logout(){
    this.authService.logout();
  }

  getEmailUser(){
    this.emailUser = this.cookieService.get('email') || '';
  }

  get titleControl() {
    return this.categoriaForm.get('title');
  }
}
