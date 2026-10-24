import { TestBed } from '@angular/core/testing';
import { AuthCartService } from './auth-cart.service';

describe('AuthCartService', () => {
  let service: AuthCartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthCartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
