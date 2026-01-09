import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KbArticleComponent } from './kb-article.component';

describe('KbArticleComponent', () => {
  let component: KbArticleComponent;
  let fixture: ComponentFixture<KbArticleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KbArticleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KbArticleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
