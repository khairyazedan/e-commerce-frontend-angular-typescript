import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreInfo } from './store-info';

describe('StoreInfo', () => {
  let component: StoreInfo;
  let fixture: ComponentFixture<StoreInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreInfo],
    }).compileComponents();

    fixture = TestBed.createComponent(StoreInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
