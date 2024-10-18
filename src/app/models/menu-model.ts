import { Producto } from "./producto";

export interface Menu{
  id: number;
  title: string;
  productos: Producto[];
}
