import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductBuilderComponent } from './product-builder.component';

describe('ProductBuilderComponent', () => {
  let component: ProductBuilderComponent;
  let fixture: ComponentFixture<ProductBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductBuilderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
