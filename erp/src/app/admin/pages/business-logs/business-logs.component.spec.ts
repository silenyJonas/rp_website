import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessLogsComponent } from './business-logs.component';

describe('BusinessLogsComponent', () => {
  let component: BusinessLogsComponent;
  let fixture: ComponentFixture<BusinessLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessLogsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
