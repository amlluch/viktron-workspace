import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureHello } from './feature-hello';

describe('FeatureHello', () => {
  let component: FeatureHello;
  let fixture: ComponentFixture<FeatureHello>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureHello]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeatureHello);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
