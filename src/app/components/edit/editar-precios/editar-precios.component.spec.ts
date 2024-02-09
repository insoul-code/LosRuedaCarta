import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPreciosComponent } from './editar-precios.component';

describe('EditarPreciosComponent', () => {
  let component: EditarPreciosComponent;
  let fixture: ComponentFixture<EditarPreciosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarPreciosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditarPreciosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
