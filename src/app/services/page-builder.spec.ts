import { TestBed } from '@angular/core/testing';

import { PageBuilder } from './page-builder';

describe('PageBuilder', () => {
  let service: PageBuilder;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PageBuilder);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
