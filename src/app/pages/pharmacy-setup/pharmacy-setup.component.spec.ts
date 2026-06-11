import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmacySetupComponent } from './pharmacy-setup.component';

describe('PharmacySetupComponent', () => {
  let component: PharmacySetupComponent;
  let fixture: ComponentFixture<PharmacySetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PharmacySetupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmacySetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
