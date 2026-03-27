import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopLogsComponent } from './shop-logs.component';

describe('ShopLogsComponent', () => {
  let component: ShopLogsComponent;
  let fixture: ComponentFixture<ShopLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopLogsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShopLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
