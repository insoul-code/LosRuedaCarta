import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  API_URL='https://losruedacarta-default-rtdb.firebaseio.com/users.json';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService
  ) { }

  register(newuser: User){
    return this.http.post<User>(`${this.API_URL}`,newuser);
  }

  login(email: string, password: string){
    return this.http.get<any>(`${this.API_URL}`,{params:{email,password}});
  }

  logout(){
    this.router.navigate(['/login']);
    this.cookieService.delete('token');
  }
}
