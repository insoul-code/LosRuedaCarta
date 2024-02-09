import { Routes } from '@angular/router';
import { EditarPreciosComponent } from './components/edit/editar-precios/editar-precios.component';
import { CartaComponent } from './components/carta/carta.component';
import { EditPageComponent } from './components/edit/edit-page/edit-page.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { loggedGuard } from './auth/guards/logged.guard';

export const routes: Routes = [
  {
    path: '',
    component: CartaComponent
},
{
    path: 'precios',
    canActivate: [
      loggedGuard
    ],
    component: EditarPreciosComponent
},
{
    path: 'editarprecio/:id',
    canActivate: [
      loggedGuard
    ],
    component: EditPageComponent
},
{
    path: 'login',
    component: LoginComponent
},
{
    path: 'register',
    component: RegisterComponent
}
];
