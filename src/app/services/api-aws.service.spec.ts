import { TestBed } from '@angular/core/testing';

import { ApiAwsService } from './api-aws.service';

describe('ApiAwsService', () => {
  let service: ApiAwsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiAwsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
