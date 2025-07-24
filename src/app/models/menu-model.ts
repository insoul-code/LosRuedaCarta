import { Product } from "./product";

export interface Menu{
  id: number;
  title: string;
  products: Product[];
}
