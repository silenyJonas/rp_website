import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiDesignerComponent } from './ui-designer.component';

describe('UiDesignerComponent', () => {
  let component: UiDesignerComponent;
  let fixture: ComponentFixture<UiDesignerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiDesignerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiDesignerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
