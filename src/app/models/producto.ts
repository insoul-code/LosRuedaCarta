export interface Producto{
  id: number;
  nombreProducto: string;
  precio: number;
  descripcion: string;
  categoryId: number;
  orden?: number; // Campo opcional para el orden de los productos
}
