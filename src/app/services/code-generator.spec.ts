import { TestBed } from '@angular/core/testing';

import { CodeGenerator } from './code-generator';

describe('CodeGenerator', () => {
  let service: CodeGenerator;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodeGenerator);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
