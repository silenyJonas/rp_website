import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseDataComponent } from './base-data.component';

describe('BaseDataComponent', () => {
  let component: BaseDataComponent;
  let fixture: ComponentFixture<BaseDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaseDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
