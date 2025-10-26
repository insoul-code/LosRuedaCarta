import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AlertService } from '@services/alert.service';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from '@components/loading/loading.component';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '@services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,CommonModule, LoadingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  showAlert = false;
  message = '';
  isLoggedIn = false;
  emailUser = '';
  currentUrl = '';

  constructor(
    private alertService: AlertService,
    private cookieService: CookieService,
    private authService: AuthService,
    public router: Router){
    }
  ngOnInit(): void {
    this.isLoggedIn = !!this.cookieService.check('token');

    // Obtener la URL inicial
    this.currentUrl = this.router.url;

    // Escuchar cambios de ruta para actualizar el estado activo
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.currentUrl = event.url;
        }
      });

    // Suscribirse a los cambios del estado de autenticación
    this.authService.authStatus$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      if (this.isLoggedIn) {
        this.getEmailUser();
      }
    });

    this.alertService.alert$.subscribe((res:any) => {
      this.message = res.message;
      this.showAlert = true;
      setTimeout(()=>{this.showAlert = false}, res.time)
    });

    if (this.isLoggedIn) {
      this.getEmailUser();
    }
  }

  getEmailUser(){
    this.emailUser = this.cookieService.get('email') || '';
  }

  logout(){
    this.authService.logout();
    this.isLoggedIn = false;
    this.emailUser = '';
  }

}
