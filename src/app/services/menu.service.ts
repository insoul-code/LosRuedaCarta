import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Menu } from '@models/menu-model';
import { Producto } from '@models/producto';
import { Router } from '@angular/router';
import { Subject, tap } from 'rxjs';

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
      await fetch(`${this.API_URL}/products/${product.id}.json`,
                  {method:'PUT', body: JSON.stringify(product), headers: {'Content-type': 'application/json'}}
      )
    } catch(error){
      console.log(error)
    }
  }

  updateOneProduct(product:Producto) {
    return this.http.put(`${this.API_URL}/products/${product.id}.json`,JSON.stringify(product));
  }

}
