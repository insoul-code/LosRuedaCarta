import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditarCategoriasComponent } from './editar-categorias.component';
import { MenuService } from '@services/menu.service';
import { AuthService } from '@services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

describe('EditarCategoriasComponent', () => {
  let component: EditarCategoriasComponent;
  let fixture: ComponentFixture<EditarCategoriasComponent>;
  let menuService: jasmine.SpyObj<MenuService>;
  let authService: jasmine.SpyObj<AuthService>;
  let cookieService: jasmine.SpyObj<CookieService>;

  beforeEach(async () => {
    const menuServiceSpy = jasmine.createSpyObj('MenuService', ['consultMenu']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);
    const cookieServiceSpy = jasmine.createSpyObj('CookieService', ['get']);

    await TestBed.configureTestingModule({
      imports: [EditarCategoriasComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: MenuService, useValue: menuServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: CookieService, useValue: cookieServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditarCategoriasComponent);
    component = fixture.componentInstance;
    menuService = TestBed.inject(MenuService) as jasmine.SpyObj<MenuService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    cookieService = TestBed.inject(CookieService) as jasmine.SpyObj<CookieService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load categories on init', () => {
    const mockCategories = [
      { id: 1, title: 'Categoría 1', productos: [] },
      { id: 2, title: 'Categoría 2', productos: [] }
    ];

    menuService.consultMenu.and.returnValue(of(mockCategories));
    cookieService.get.and.returnValue('test@example.com');

    component.ngOnInit();

    expect(menuService.consultMenu).toHaveBeenCalled();
    expect(component.menuCategories).toEqual(mockCategories);
  });

  it('should get user email from cookie service', () => {
    const testEmail = 'test@example.com';
    cookieService.get.and.returnValue(testEmail);

    component.getEmailUser();

    expect(cookieService.get).toHaveBeenCalledWith('email');
    expect(component.emailUser).toBe(testEmail);
  });

  it('should call logout on auth service', () => {
    component.logout();

    expect(authService.logout).toHaveBeenCalled();
  });
});
