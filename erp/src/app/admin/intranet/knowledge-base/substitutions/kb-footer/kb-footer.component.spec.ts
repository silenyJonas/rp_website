import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KbFooterComponent } from './kb-footer.component';

describe('KbFooterComponent', () => {
  let component: KbFooterComponent;
  let fixture: ComponentFixture<KbFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KbFooterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KbFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
