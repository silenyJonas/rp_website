import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonBuilderComponent } from './button-builder.component';

describe('ButtonBuilderComponent', () => {
  let component: ButtonBuilderComponent;
  let fixture: ComponentFixture<ButtonBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonBuilderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
