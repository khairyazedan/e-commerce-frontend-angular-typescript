import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlSidebar } from './control-sidebar';

describe('ControlSidebar', () => {
  let component: ControlSidebar;
  let fixture: ComponentFixture<ControlSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlSidebar],
    }).compileComponents();

    fixture = TestBed.createComponent(ControlSidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
