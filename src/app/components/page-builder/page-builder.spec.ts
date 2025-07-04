import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageBuilder } from './page-builder';

describe('PageBuilder', () => {
  let component: PageBuilder;
  let fixture: ComponentFixture<PageBuilder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageBuilder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageBuilder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
