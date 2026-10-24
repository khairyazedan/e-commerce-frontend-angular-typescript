import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreNavbar } from './store-navbar';

describe('StoreNavbar', () => {
  let component: StoreNavbar;
  let fixture: ComponentFixture<StoreNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreNavbar],
    }).compileComponents();

    fixture = TestBed.createComponent(StoreNavbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
