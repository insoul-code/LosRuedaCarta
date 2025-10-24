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
    console.log('🚀 INICIANDO COMPONENTE EDITAR CATEGORÍA');
    this.getEmailUser();
    this.route.params.subscribe(params => {
      console.log('📋 Parámetros de ruta recibidos:', params);
      const id = +params['id'];
      console.log('🔢 ID convertido a número:', id);
      console.log('✅ ID es válido:', !isNaN(id) && id > 0);

      if (id && !isNaN(id)) {
        this.categoriaId = id;
        console.log('✅ ID válido, cargando categoría:', this.categoriaId);
        this.loadCategoria();
      } else {
        console.error('❌ ID de categoría inválido:', params['id']);
        console.log('🔄 Redirigiendo a lista de categorías...');
        this.router.navigate(['/editarcategorias']);
      }
    });
  }

        loadCategoria() {
    this.isLoading = true;
    console.log('🔍 Iniciando búsqueda de categoría con ID:', this.categoriaId);

    // NUEVA ESTRATEGIA: Ir directamente a buscar en la lista completa
    // porque Firebase está devolviendo categorías por posición, no por ID
    console.log('📡 Firebase devuelve por posición, no por ID. Buscando en lista completa...');
    this.buscarEnListaCompleta();
  }

    private buscarEnListaCompleta() {
    console.log('🔄 Iniciando búsqueda en lista completa...');
    this.menuService.consultMenu().subscribe({
      next: (categorias: any) => {
        console.log('📋 Categorías cargadas (raw):', categorias);
        console.log('🎯 Buscando categoría con ID:', this.categoriaId);

        // Debugging adicional: analizar la estructura de datos
        this.analizarEstructuraDatos(categorias);

        // Firebase devuelve un objeto con claves numéricas, no un array
        let categoriasArray: Menu[] = [];

        if (Array.isArray(categorias)) {
          console.log('📊 Las categorías ya son un array');
          categoriasArray = categorias;
        } else if (categorias && typeof categorias === 'object') {
          console.log('🔧 Convirtiendo objeto de Firebase a array...');
          // Convertir objeto a array manteniendo el ID original
          categoriasArray = Object.keys(categorias).map(key => {
            const categoria = categorias[key];
            const categoriaConId = {
              ...categoria,
              id: parseInt(key) // Usar la clave como ID
            };
            console.log(`  Clave: ${key} -> ID: ${categoriaConId.id}, Título: ${categoriaConId.title}`);
            return categoriaConId;
          });
        }

        console.log('📋 Categorías convertidas a array:', categoriasArray);

        // CORRECCIÓN: Buscar por ID exacto, no por posición
        console.log('🔍 Buscando por ID exacto...');
        console.log('🎯 ID buscado:', this.categoriaId);
        console.log('📋 Categorías disponibles para búsqueda:', categoriasArray.map(cat => ({ id: cat?.id, title: cat?.title })));

        const categoriaEncontrada = categoriasArray.find(cat => {
          console.log(`🔍 Comparando: ${cat?.id} (${typeof cat?.id}) === ${this.categoriaId} (${typeof this.categoriaId}) = ${cat?.id == this.categoriaId}`);
          // Usar == en lugar de === para comparación flexible de tipos
          return cat && cat.id == this.categoriaId;
        });

        if (categoriaEncontrada) {
          console.log('✅ Categoría encontrada por ID exacto:', categoriaEncontrada);
          this.categoria = categoriaEncontrada;

          this.categoriaForm.patchValue({
            title: this.categoria.title
          });
          console.log('✅ Formulario actualizado con título:', this.categoria.title);
        } else {
          console.error(`❌ No se encontró la categoría con ID: ${this.categoriaId}`);
          console.log('📋 Categorías disponibles:', categoriasArray.map(cat => ({ id: cat?.id, title: cat?.title })));
          console.log('🔄 Redirigiendo a lista de categorías...');
          // Redirigir a la lista si no se encuentra la categoría
          this.router.navigate(['/editarcategorias']);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar la categoría:', error);
        this.isLoading = false;
        // Redirigir a la lista en caso de error
        this.router.navigate(['/editarcategorias']);
      }
    });
  }

  onSubmit() {
    // Verificación adicional de seguridad
    if (!this.categoria || !this.categoria.id) {
      console.error('❌ Categoría no disponible para editar');
      this.router.navigate(['/editarcategorias']);
      return;
    }

    if (!this.categoriaForm.valid) {
      console.error('❌ Formulario inválido');
      return;
    }

    if (this.isLoading) {
      console.log('⏳ Ya se está procesando una solicitud');
      return;
    }

    console.log('💾 Actualizando categoría con ID:', this.categoria.id);
    console.log('📝 Título nuevo:', this.categoriaForm.value.title);
    console.log('🔍 Categoría original:', this.categoria);

    this.isLoading = true;
    const categoriaActualizada: Menu = {
      id: this.categoria.id, // Asegurar que el ID sea el correcto
      title: this.categoriaForm.value.title,
      productos: this.categoria.productos || [] // Mantener los productos existentes
    };

    console.log('📤 Objeto que se enviará al servicio:', categoriaActualizada);
    console.log('🔢 ID que se enviará:', categoriaActualizada.id, 'Tipo:', typeof categoriaActualizada.id);

    this.menuService.updateCategory(categoriaActualizada).subscribe({
      next: () => {
        console.log('✅ Categoría actualizada exitosamente');
        this.router.navigate(['/editarcategorias']);
      },
      error: (error) => {
        console.error('❌ Error al actualizar la categoría:', error);
        this.isLoading = false;
      }
    });
  }

  cancelar() {
    this.router.navigate(['/editarcategorias']);
  }

  confirmarEliminacion() {
    if (!this.categoria || !this.categoria.id) {
      console.error('❌ Categoría no disponible para eliminar');
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
      console.error('❌ Categoría no disponible para eliminar');
      return;
    }

    if (this.isLoading) {
      console.log('⏳ Ya se está procesando una solicitud');
      return;
    }

    console.log('🗑️ Eliminando categoría con ID:', this.categoria.id);
    console.log('📝 Título de la categoría:', this.categoria.title);

    this.isLoading = true;

    this.menuService.deleteCategory(this.categoria.id).then(() => {
      console.log('✅ Categoría eliminada exitosamente');
      this.router.navigate(['/editarcategorias']);
    }).catch((error) => {
      console.error('❌ Error al eliminar la categoría:', error);
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

  private analizarEstructuraDatos(categorias: any) {
    console.log('🔍 ANALIZANDO ESTRUCTURA DE DATOS:');
    console.log('   Tipo de datos:', typeof categorias);
    console.log('   Es array:', Array.isArray(categorias));

    if (categorias && typeof categorias === 'object' && !Array.isArray(categorias)) {
      console.log('   Claves disponibles:', Object.keys(categorias));
      console.log('   Número de claves:', Object.keys(categorias).length);

      Object.keys(categorias).forEach(key => {
        const categoria = categorias[key];
        console.log(`   Clave "${key}":`, {
          id: categoria?.id,
          title: categoria?.title,
          tipo: typeof categoria,
          esObjeto: typeof categoria === 'object'
        });
      });
    }

    if (Array.isArray(categorias)) {
      console.log('   Número de elementos en array:', categorias.length);
      categorias.forEach((cat, index) => {
        console.log(`   Índice ${index}:`, {
          id: cat?.id,
          title: cat?.title,
          tipo: typeof cat
        });
      });
    }

    console.log('🔍 FIN DEL ANÁLISIS');
  }
}
