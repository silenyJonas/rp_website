import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericDetailsComponent } from './details-builder.component';

describe('GenericDetailsComponent', () => {
  let component: GenericDetailsComponent;
  let fixture: ComponentFixture<GenericDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
