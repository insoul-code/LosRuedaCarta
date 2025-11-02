import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Menu } from '@models/menu-model';
import { Producto } from '@models/producto';
import { Router } from '@angular/router';
import { Subject, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  API_URL='https://losruedacarta-default-rtdb.firebaseio.com';

  private datosSubject = new Subject<any>();

  constructor(
    private http: HttpClient,
    private router: Router) { }

  consultMenu(){
    return this.http.get<Menu[]>(`${this.API_URL}/categories.json`);
  }

  getCategoryById(id: number) {
    return this.http.get<Menu>(`${this.API_URL}/categories/${id}.json`);
  }

  getProducts(){
    return this.http.get<any[]>(`${this.API_URL}/products.json`);
  }

  getProductsSubject(){
    return this.http.get<any[]>(`${this.API_URL}/products.json`).subscribe((nuevosDatos) => {
      this.datosSubject.next(nuevosDatos);
    });
  }

  obtenerDatosObservable() {
    return this.datosSubject.asObservable();
  }

  getProductById(id:number){
    return this.http.get(`${this.API_URL}/products/${id}.json`);
  }

  async updateProduct(product:Producto) {
    try{
      // Obtener todos los productos para encontrar el índice correcto
      const products = await this.getProducts().toPromise();
      let firebaseIndex = -1;

      if (products && typeof products === 'object') {
        // Buscar el índice del producto en Firebase
        for (const key of Object.keys(products)) {
          if (products[key as any] && products[key as any].id === product.id) {
            firebaseIndex = parseInt(key);
            break;
          }
        }
      }

      if (firebaseIndex === -1) {
        throw new Error(`No se encontró el producto con ID ${product.id} en Firebase`);
      }

      const url = `${this.API_URL}/products/${firebaseIndex}.json`;

      const response = await fetch(url, {
        method: 'PUT',
        body: JSON.stringify(product),
        headers: {'Content-type': 'application/json'}
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      return await response.json();
    } catch(error){
      console.error('Error al actualizar producto:', error);
      throw error;
    }
  }

  updateOneProduct(product:Producto) {
    return this.http.put(`${this.API_URL}/products/${product.id}.json`,JSON.stringify(product));
  }

  async deleteProduct(productId: number) {
    try {
      await fetch(`${this.API_URL}/products/${productId}.json`, {
        method: 'DELETE',
        headers: { 'Content-type': 'application/json' },
      });
    } catch (error) {
      console.error(`Error al eliminar el producto con ID ${productId}:`, error);
    }
  }

  createCategory(category: Omit<Menu, 'id'>) {
    // Obtener el siguiente ID disponible
    return this.consultMenu().pipe(
      switchMap((categorias: any) => {
        let categoriasArray: Menu[] = [];

        if (Array.isArray(categorias)) {
          categoriasArray = categorias;
        } else if (categorias && typeof categorias === 'object') {
          categoriasArray = Object.keys(categorias)
            .filter(key => categorias[key] && categorias[key].title) // Solo categorías válidas
            .map(key => {
              const categoria = categorias[key];
              return {
                ...categoria,
                id: categoria.id || (parseInt(key) + 1) // Usar ID existente o calcular uno
              };
            });
        }

        // Calcular el siguiente ID - filtrar categorías válidas primero
        const validCategories = categoriasArray.filter(cat => cat && cat.id);
        const nextId = validCategories.length > 0
          ? Math.max(...validCategories.map(cat => cat.id)) + 1
          : 1;

        // Crear la nueva categoría con el ID calculado
        const newCategory: Menu = {
          id: nextId,
          title: category.title,
          productos: category.productos || []
        };

        // Usar PUT con el índice numérico específico para mantener consistencia
        const firebaseIndex = nextId - 1; // ID 1 = índice 0, ID 2 = índice 1, etc.
        const url = `${this.API_URL}/categories/${firebaseIndex}.json`;

        return this.http.put(url, newCategory);
      })
    );
  }

  updateCategory(category: Menu) {
    // CORRECCIÓN: Usar la clave de Firebase (ID - 1) en lugar del ID del objeto
    const firebaseKey = category.id - 1; // ID 1 = clave 0, ID 2 = clave 1, etc.
    const url = `${this.API_URL}/categories/${firebaseKey}.json`;

    // Crear el objeto con el ID correcto para mantener consistencia
    const categoryToUpdate = {
      id: category.id,
      title: category.title,
      productos: category.productos || []
    };

    return this.http.put(url, categoryToUpdate);
  }

  async deleteCategory(categoryId: number) {
    try {
      // CORRECCIÓN: Usar la clave de Firebase (ID - 1) en lugar del ID del objeto
      const firebaseKey = categoryId - 1; // ID 1 = clave 0, ID 2 = clave 1, etc.
      const url = `${this.API_URL}/categories/${firebaseKey}.json`;

      await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-type': 'application/json' },
      });
    } catch (error) {
      console.error(`Error al eliminar la categoría con ID ${categoryId}:`, error);
    }
  }

  // Método para migrar productos existentes y agregar campo orden
  async migrateProductsWithOrder() {
    try {
      const products = await this.getProducts().toPromise();
      if (!products || typeof products !== 'object') return;

      const updatePromises: Promise<any>[] = [];
      let orderCounter = 1;

      for (const key of Object.keys(products)) {
        const product = products[key as any];
        if (product && product.nombreProducto && !product.orden) {
          const updatedProduct = { ...product, orden: orderCounter++ };
          updatePromises.push(this.updateProduct(updatedProduct));
        }
      }

      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
      }
    } catch (error) {
      console.error('Error al migrar productos:', error);
    }
  }

  createProduct(product: Omit<Producto, 'id'>) {
    // Obtener el siguiente ID disponible
    return this.getProducts().pipe(
      switchMap((productos: any) => {
        let productosArray: Producto[] = [];

        if (Array.isArray(productos)) {
          productosArray = productos;
        } else if (productos && typeof productos === 'object') {
          productosArray = Object.keys(productos)
            .filter(key => productos[key] && productos[key].nombreProducto) // Solo productos válidos
            .map(key => {
              const producto = productos[key];
              return {
                ...producto,
                id: producto.id || (parseInt(key) + 1) // Usar ID existente o calcular uno
              };
            });
        }

        // Calcular el siguiente ID - filtrar productos válidos primero
        const validProducts = productosArray.filter(prod => prod && prod.id);
        const nextId = validProducts.length > 0
          ? Math.max(...validProducts.map(prod => prod.id)) + 1
          : 1;

        // Calcular el siguiente orden
        const nextOrden = validProducts.length > 0
          ? Math.max(...validProducts.map(prod => prod.orden || 0)) + 1
          : 1;

        // Crear el nuevo producto con el ID calculado
        const newProduct: Producto = {
          id: nextId,
          nombreProducto: product.nombreProducto,
          precio: product.precio,
          descripcion: product.descripcion,
          categoryId: product.categoryId,
          orden: nextOrden
        };

        // Encontrar el siguiente índice disponible en Firebase
        let firebaseIndex = 0;
        if (productos && typeof productos === 'object') {
          const existingIndices = Object.keys(productos)
            .map(key => parseInt(key))
            .filter(index => !isNaN(index))
            .sort((a, b) => a - b);

          // Encontrar el primer índice disponible
          for (let i = 0; i <= existingIndices.length; i++) {
            if (!existingIndices.includes(i)) {
              firebaseIndex = i;
              break;
            }
          }
        }

        const url = `${this.API_URL}/products/${firebaseIndex}.json`;

        return this.http.put(url, newProduct);
      })
    );
  }
}
