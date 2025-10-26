import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditarCategoriaComponent } from './editar-categoria.component';
import { MenuService } from '@services/menu.service';
import { AuthService } from '@services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('EditarCategoriaComponent', () => {
  let component: EditarCategoriaComponent;
  let fixture: ComponentFixture<EditarCategoriaComponent>;
  let menuService: jasmine.SpyObj<MenuService>;
  let authService: jasmine.SpyObj<AuthService>;
  let cookieService: jasmine.SpyObj<CookieService>;
  let formBuilder: FormBuilder;

  const mockCategorias = [
    { id: 1, title: 'Categoría 1', productos: [] },
    { id: 2, title: 'Categoría 2', productos: [] }
  ];

  beforeEach(async () => {
    const menuServiceSpy = jasmine.createSpyObj('MenuService', ['consultMenu', 'updateCategory']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);
    const cookieServiceSpy = jasmine.createSpyObj('CookieService', ['get']);

    await TestBed.configureTestingModule({
      imports: [EditarCategoriaComponent, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: MenuService, useValue: menuServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: CookieService, useValue: cookieServiceSpy },
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '1' })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditarCategoriaComponent);
    component = fixture.componentInstance;
    menuService = TestBed.inject(MenuService) as jasmine.SpyObj<MenuService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    cookieService = TestBed.inject(CookieService) as jasmine.SpyObj<CookieService>;
    formBuilder = TestBed.inject(FormBuilder);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load categoria on init', () => {
    menuService.consultMenu.and.returnValue(of(mockCategorias));
    cookieService.get.and.returnValue('test@example.com');

    component.ngOnInit();

    expect(menuService.consultMenu).toHaveBeenCalled();
    expect(component.categoria).toEqual(mockCategorias[0]);
    expect(component.categoriaForm.get('title')?.value).toBe('Categoría 1');
  });

  it('should validate form correctly', () => {
    const titleControl = component.categoriaForm.get('title');

    // Test required validation
    titleControl?.setValue('');
    expect(titleControl?.valid).toBeFalsy();
    expect(titleControl?.errors?.['required']).toBeTruthy();

    // Test minlength validation
    titleControl?.setValue('a');
    expect(titleControl?.valid).toBeFalsy();
    expect(titleControl?.errors?.['minlength']).toBeTruthy();

    // Test valid value
    titleControl?.setValue('Categoría válida');
    expect(titleControl?.valid).toBeTruthy();
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
