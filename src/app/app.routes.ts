import { Routes } from '@angular/router';
import { EditarPreciosComponent } from './components/edit/editar-precios/editar-precios.component';
import { CartaComponent } from './components/carta/carta.component';
import { EditPageComponent } from './components/edit/edit-page/edit-page.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { EditarCategoriasComponent } from './components/edit/editar-categorias/editar-categorias.component';
import { EditarCategoriaComponent } from './components/edit/editar-categoria/editar-categoria.component';
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
    path: 'crearproducto',
    canActivate: [
      loggedGuard
    ],
    component: EditPageComponent
},
{
    path: 'editarcategorias',
    canActivate: [
      loggedGuard
    ],
    component: EditarCategoriasComponent
},
{
    path: 'editarcategoria/:id',
    canActivate: [
      loggedGuard
    ],
    component: EditarCategoriaComponent
},
{
    path: 'loginlosrueda',
    component: LoginComponent
},
{
    path: 'registerlosrueda',
    component: RegisterComponent
}
];
