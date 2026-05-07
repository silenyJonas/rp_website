import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductDetailsBuilderComponent } from './product-details-builder.component';

describe('ProductDetailsBuilderComponent', () => {
  let component: ProductDetailsBuilderComponent;
  let fixture: ComponentFixture<ProductDetailsBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDetailsBuilderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductDetailsBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
