import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrdersDetails } from './orders-details';

describe('OrdersDetails', () => {
  let component: OrdersDetails;
  let fixture: ComponentFixture<OrdersDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(OrdersDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
