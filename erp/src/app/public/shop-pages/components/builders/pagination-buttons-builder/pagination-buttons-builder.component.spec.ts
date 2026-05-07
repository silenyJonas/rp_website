import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginationButtonsBuilderComponent } from './pagination-buttons-builder.component';

describe('PaginationButtonsBuilderComponent', () => {
  let component: PaginationButtonsBuilderComponent;
  let fixture: ComponentFixture<PaginationButtonsBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationButtonsBuilderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginationButtonsBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
