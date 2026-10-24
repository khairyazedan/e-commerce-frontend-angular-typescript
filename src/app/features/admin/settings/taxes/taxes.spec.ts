import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Taxes } from './taxes';

describe('Taxes', () => {
  let component: Taxes;
  let fixture: ComponentFixture<Taxes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Taxes],
    }).compileComponents();

    fixture = TestBed.createComponent(Taxes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
