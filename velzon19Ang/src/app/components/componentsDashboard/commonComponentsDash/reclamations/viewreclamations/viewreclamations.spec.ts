import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewreclamationsExtern } from './viewreclamations';

describe('Viewreclamations', () => {
  let component: ViewreclamationsExtern;
  let fixture: ComponentFixture<ViewreclamationsExtern>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewreclamationsExtern]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewreclamationsExtern);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
