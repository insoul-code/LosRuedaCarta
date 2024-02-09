import { Producto } from "./producto";

export interface Menu{
  id: number;
  tituloProducto: string;
  productos: Producto[];
}
