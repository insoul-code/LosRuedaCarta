import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '@models/user';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
// import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, from } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  API_URL='https://losruedacarta-default-rtdb.firebaseio.com/users.json';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService,
    // private auth: AngularFireAuth
  ) { }

  register(newuser: User){
    return this.http.post<User>(`${this.API_URL}`,newuser);
  }

  login(email: string, password: string): Observable<User>{
    const params = new HttpParams().set('email',email).set('password',password);
    return this.http.get<User>(`${this.API_URL}`,{params});
  }

  logout(){
    this.router.navigate(['/loginlosrueda']);
    this.cookieService.delete('token');
    this.cookieService.delete('email');
  }
}
