import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '@models/product';

@Injectable({
  providedIn: 'root'
})
export class ApiAwsService {

  API_URL='https://8f9fq5llcj.execute-api.us-east-1.amazonaws.com/dev';

  constructor(
    private http: HttpClient
  ) { }

  getProducts(){
    return this.http.get<Product[]>(`${this.API_URL}/products`)
  }
}
