import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreFooter } from './store-footer';

describe('StoreFooter', () => {
  let component: StoreFooter;
  let fixture: ComponentFixture<StoreFooter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreFooter],
    }).compileComponents();

    fixture = TestBed.createComponent(StoreFooter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
