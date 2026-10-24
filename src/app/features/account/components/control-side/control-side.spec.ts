import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlSide } from './control-side';

describe('ControlSide', () => {
  let component: ControlSide;
  let fixture: ComponentFixture<ControlSide>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlSide],
    }).compileComponents();

    fixture = TestBed.createComponent(ControlSide);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
