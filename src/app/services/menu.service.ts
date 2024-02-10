import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Menu } from '../models/menu-model';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  API_URL='https://apilosrueda.onrender.com';

  constructor(
    private http: HttpClient,
    private router: Router) { }

  consultMenu(){
    return this.http.get<Menu[]>(`${this.API_URL}/categories`);
  }

  getProducts(){
    return this.http.get<any[]>(`${this.API_URL}/products`)
  }

  getProductById(id:number){
    return this.http.get(`${this.API_URL}/products/${id}`);
  }

  async updateProduct(product:Producto) {
    try{
      await fetch(`${this.API_URL}/products/${product.id}`,
                  {method:'PUT', body: JSON.stringify(product), headers: {'Content-type': 'application/json'}}
      )
      this.router.navigate(['/precios'])
    } catch(error){
      console.log(error)
    }
  }

  updateOneProduct(product:Producto) {
    return this.http.put(`${this.API_URL}/products/${product.id}`,product);
  }
}
