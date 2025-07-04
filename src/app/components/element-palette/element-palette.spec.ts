import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementPalette } from './element-palette';

describe('ElementPalette', () => {
  let component: ElementPalette;
  let fixture: ComponentFixture<ElementPalette>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElementPalette]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElementPalette);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
