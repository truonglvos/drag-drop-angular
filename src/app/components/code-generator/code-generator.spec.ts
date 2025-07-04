import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeGenerator } from './code-generator';

describe('CodeGenerator', () => {
  let component: CodeGenerator;
  let fixture: ComponentFixture<CodeGenerator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeGenerator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeGenerator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
