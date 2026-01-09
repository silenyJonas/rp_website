import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesRepComponent } from './sales-rep.component';

describe('SalesRepComponent', () => {
  let component: SalesRepComponent;
  let fixture: ComponentFixture<SalesRepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesRepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesRepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
