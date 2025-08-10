import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericFilterFormComponent } from './generic-filter-form.component';

describe('GenericFilterFormComponent', () => {
  let component: GenericFilterFormComponent;
  let fixture: ComponentFixture<GenericFilterFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericFilterFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericFilterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
