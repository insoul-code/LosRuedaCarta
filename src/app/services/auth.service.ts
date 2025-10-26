import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '@models/user';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
// import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, from, BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  API_URL='https://losruedacarta-default-rtdb.firebaseio.com/users.json';
  DBJSON='http://localhost:3000/users';

  // Observable para el estado de autenticación
  private authStatusSubject = new BehaviorSubject<boolean>(false);
  public authStatus$ = this.authStatusSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService,
    // private auth: AngularFireAuth
  ) {
    // Inicializar con el estado actual de la cookie
    this.authStatusSubject.next(!!this.cookieService.check('token'));
  }

  register(newuser: User){
    return this.http.post<User>(`${this.API_URL}`,newuser);
  }

  login(email: string, password: string): Observable<User>{
    const params = new HttpParams().set('email',email).set('password',password);
    return this.http.get<User>(`${this.API_URL}`,{params});
  }

  loginDbJson(email: string, password: string): Observable<User>{
    const params = new HttpParams().set('email',email).set('password',password);
    return this.http.get<User>(`${this.DBJSON}`,{params});
  }

  logout(){
    this.router.navigate(['/loginlosrueda']);
    this.cookieService.delete('token');
    this.cookieService.delete('email');
    this.authStatusSubject.next(false);
  }

  // Método para actualizar el estado de autenticación
  setLoggedIn(isLoggedIn: boolean) {
    this.authStatusSubject.next(isLoggedIn);
  }
}
