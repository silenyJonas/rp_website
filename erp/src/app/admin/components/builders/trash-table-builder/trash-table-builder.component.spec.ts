import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrashTableBuilderComponent } from './trash-table-builder.component';

describe('GenericTrashTableComponent', () => {
  let component: TrashTableBuilderComponent;
  let fixture: ComponentFixture<TrashTableBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrashTableBuilderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrashTableBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
