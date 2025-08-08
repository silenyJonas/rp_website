import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericTrashTableComponent } from './generic-trash-table.component';

describe('GenericTrashTableComponent', () => {
  let component: GenericTrashTableComponent;
  let fixture: ComponentFixture<GenericTrashTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericTrashTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericTrashTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
